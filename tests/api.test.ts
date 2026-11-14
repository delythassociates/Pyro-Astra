import { describe, it } from 'node:test';
import assert from 'node:assert';
import { POST as handleAskPost } from '../src/app/api/ask/route';
import { NextRequest } from 'next/server';

describe('Serverless API Routes Verification', () => {
  it('POST /api/ask handles offline queries and returns structured answer', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What solid materials were tested in the BASS-II investigation?',
        offline: true,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await handleAskPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.ok(data.sentences.length > 0, 'Expected sentences');
    assert.strictEqual(data.refusal, null);
    assert.ok(Array.isArray(data.trace), 'Trace should be an array');
    assert.strictEqual(data.offline_mode, true);
    assert.strictEqual(data.validated, true);
  });

  it('POST /api/ask enforces policy refusal on partial-gravity queries (Rule 5)', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Can you predict burn rates in lunar gravity (0.16g)?',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await handleAskPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.sentences.length, 0);
    assert.ok(data.refusal !== null, 'Expected refusal');
    assert.ok(data.refusal.toLowerCase().includes('partial-gravity'));
  });

  it('POST /api/ask enforces policy refusal on safety guarantee queries', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Can you guarantee that this acrylic panel will never ignite in the cabin?',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await handleAskPost(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.sentences.length, 0);
    assert.ok(data.refusal !== null, 'Expected refusal');
    assert.ok(
      data.refusal.toLowerCase().includes('cannot guarantee') ||
        data.refusal.toLowerCase().includes('absolute safety'),
      'Refusal must state inability to guarantee absolute safety'
    );
    assert.strictEqual(data.validated, true);
  });

  it('POST /api/ask rejects missing question with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/ask', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await handleAskPost(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Missing required field'));
  });

  it('POST /api/ask falls back to offline engine on simulated HTTP 429 rate limit or network failure', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () =>
        ({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded: 429 Too Many Requests',
          json: async () => ({ error: { message: 'Rate limit exceeded' } }),
        }) as any;

      const req = new NextRequest('http://localhost:3000/api/ask', {
        method: 'POST',
        body: JSON.stringify({
          question: 'What was the hardware used in BASS-II?',
          mode: 'live',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await handleAskPost(req);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.offline_mode, true);
      assert.ok(data.sentences.length > 0);
      assert.strictEqual(data.validated, true);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
