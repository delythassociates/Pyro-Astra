import fs from 'fs';
import { AgentTools } from '../src/lib/agent';
import { validateAgentAnswer } from '../src/lib/validate';
import rawInvestigations from '../data/investigations.json';

// Read key
const envContent = fs.readFileSync('.env.local', 'utf-8');
const key = envContent.split('\n').find(l => l.startsWith('GROQ_API_KEY='))?.split('=')[1]?.trim();

const recordsMap = new Map((rawInvestigations as any[]).map(r => [r.id, r]));

async function testQuery(query: string) {
  console.log('\n--- Testing Query:', query);
  const matched = AgentTools.search_records(query);
  const topRecords = matched.slice(0, 3).map(r => ({
    id: r.id,
    name: r.name,
    hardware: r.hardware?.value ?? 'not reported',
    cabin_o2: r.cabin_o2_pct?.value ?? 'not reported',
    pressure: r.pressure_psi?.value ?? 'not reported',
    burner_o2: r.burner_flow_o2_pct?.value ?? 'not reported',
    n_tests: r.n_tests?.value ?? 'not reported',
    fuels: r.fuels?.value ?? [],
  }));

  const systemPrompt = `You are Ask ASTRA, the fire safety assistant for NASA Physical Sciences Informatics (PSI) combustion research.
Answer the user question using ONLY the factual context provided below.
Rules:
1. Never invent, estimate, round up, or extrapolate any values. If a value is null or not reported, state 'not reported'.
2. Oxygen in burner flow is NOT cabin oxygen.
3. Every sentence must cite its evidence with record_id (e.g. 'PSI-25') and field (e.g. 'cabin_o2_pct').
4. Respond ONLY with a valid JSON object:
{
  "sentences": [
    { "text": "...", "evidence": [{"record_id": "PSI-...", "field": "..."}] }
  ]
}`;

  const userContent = `User Question: "${query}"\n\nFactual Context from NASA PSI Records:\n${JSON.stringify(topRecords, null, 2)}`;

  const t0 = performance.now();
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: 1024,
    }),
  });

  const elapsed = Math.round(performance.now() - t0);
  console.log(`Status: ${res.status} (${elapsed} ms)`);
  if (!res.ok) {
    console.log('Error:', await res.text());
    return;
  }
  const data = await res.json();
  console.log('API Response Model:', data.model);
  const content = data.choices?.[0]?.message?.content;
  console.log('Content:\n', content);

  try {
    const parsed = JSON.parse(content);
    const valRes = validateAgentAnswer(
      { sentences: parsed.sentences, refusal: null },
      { query, records: recordsMap }
    );
    console.log('Verifier Valid:', valRes.valid);
    if (!valRes.valid) {
      console.log('Verifier Errors:', valRes.errors.map(e => e.message));
    }
  } catch (e: any) {
    console.log('JSON parse error:', e.message);
  }
}

async function run() {
  await testQuery('What was the hardware used in BASS-II?');
  await testQuery('What are the tested cabin oxygen levels in FLEX?');
}

run();
