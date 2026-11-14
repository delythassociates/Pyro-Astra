import fs from 'fs';
import { AgentTools } from '../src/lib/agent';
import { validateAgentAnswer } from '../src/lib/validate';
import rawInvestigations from '../data/investigations.json';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const key = envContent.split('\n').find(l => l.startsWith('GROQ_API_KEY='))?.split('=')[1]?.trim();
const recordsMap = new Map((rawInvestigations as any[]).map(r => [r.id, r]));

async function testAstraQuery(query: string) {
  console.log('\n======================================================');
  console.log('Query:', query);

  // 1. Tool execution
  const matched = AgentTools.search_records(query);
  const primary = matched[0] || AgentTools.get_record('PSI-25')!;

  const toolData = {
    investigation_id: primary.id,
    name: primary.name,
    hardware: primary.hardware?.value ?? 'not reported',
    cabin_o2_range: primary.cabin_o2_pct?.value ?? 'not reported',
    pressure_range: primary.pressure_psi?.value ?? 'not reported',
    burner_o2: primary.burner_flow_o2_pct?.value ?? 'not reported',
    n_tests: primary.n_tests?.value ?? 'not reported',
    fuels: primary.fuels?.value ?? [],
  };

  const systemPrompt = `You are Ask ASTRA, the fire safety AI assistant for NASA PSI combustion research.
You must answer using ONLY the factual context provided.
RULES:
1. Never invent or extrapolate any values. If a value is null or not reported, state 'not reported'.
2. Oxygen in burner flow is burner oxidizer only, never cabin oxygen.
3. Every sentence MUST cite evidence in the "evidence" array with record_id (e.g. "${primary.id}") and field (e.g. "hardware" or "cabin_o2_pct").
4. Return a valid JSON object matching:
{
  "sentences": [
    {
      "text": "sentence text",
      "evidence": [{"record_id": "${primary.id}", "field": "field_name"}]
    }
  ]
}`;

  const userContent = `User Question: "${query}"\n\nVerified Tool Data:\n${JSON.stringify(toolData, null, 2)}`;

  const t0 = performance.now();
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: 512,
    }),
  });

  const elapsed = Math.round(performance.now() - t0);
  console.log(`API Status: ${res.status} (${elapsed} ms)`);
  const data = await res.json();
  console.log('Model reported by API:', data.model);
  const text = data.choices?.[0]?.message?.content;
  console.log('JSON Content:\n', text);

  const parsed = JSON.parse(text);
  const val = validateAgentAnswer(
    { sentences: parsed.sentences, refusal: null },
    { query, records: recordsMap }
  );

  console.log('Verifier Passed:', val.valid);
  if (!val.valid) {
    console.log('Verifier Errors:', val.errors.map(e => e.message));
  }
}

async function run() {
  await testAstraQuery('What hardware was used in BASS-II?');
  await testAstraQuery('What was the tested pressure range in FLEX?');
}

run();
