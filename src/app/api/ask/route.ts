import { NextRequest, NextResponse } from 'next/server';
import { askAstra, AskAstraResponse } from '@/lib/agent';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question || body.query;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        {
          error: 'Missing required field: question (or query) must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // Default to deterministic OFFLINE mode unless user explicitly opts in with use_ai or mode: 'live'
    const isOffline = body.use_ai !== true && body.mode !== 'live' && body.offline !== false;
    const timeoutMs = typeof body.timeoutMs === 'number' ? body.timeoutMs : 12000;

    // Timeout-guarded invocation with fallback
    const timeoutPromise = new Promise<AskAstraResponse>((_, reject) =>
      setTimeout(() => reject(new Error('Ask ASTRA query timed out')), timeoutMs)
    );

    let result: AskAstraResponse;
    try {
      result = await Promise.race([
        askAstra(question.trim(), { isOffline, timeoutMs }),
        timeoutPromise,
      ]);
    } catch {
      // In case of timeout or internal agent exception, cleanly fall back to offline mode
      result = await askAstra(question.trim(), { isOffline: true });
    }

    return NextResponse.json({
      query: result.query,
      sentences: result.sentences,
      refusal: result.refusal,
      trace: result.toolTraces,
      offline_mode: result.offline_mode,
      mode: result.mode,
      model_used: result.model_used,
      api_status: result.api_status,
      api_latency_ms: result.api_latency_ms,
      verifier_intercepted: result.verifier_intercepted,
      validated: result.validated,
      validation_errors: result.validation_errors,
      tokens: result.tokens,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `Failed to process Ask ASTRA query: ${message}`,
      },
      { status: 500 }
    );
  }
}
