import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const key = envContent.split('\n').find(l => l.startsWith('GROQ_API_KEY='))?.split('=')[1]?.trim();

async function testModel(modelName: string, withJsonFormat: boolean) {
  console.log(`\nTesting ${modelName} (jsonFormat: ${withJsonFormat}):`);
  const body: any = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are Ask ASTRA. You must respond with a JSON object with this exact shape: {"sentences": [{"text": "string", "evidence": [{"record_id": "PSI-25", "field": "hardware"}]}]}.'
      },
      {
        role: 'user',
        content: 'In BASS-II (PSI-25), what hardware was used? Data: Hardware is Combustion Integrated Rack (CIR).'
      }
    ],
    temperature: 0.1,
    max_tokens: 512,
  };
  if (withJsonFormat) {
    body.response_format = { type: 'json_object' };
  }

  const t0 = performance.now();
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const elapsed = Math.round(performance.now() - t0);
  console.log(`HTTP ${res.status} in ${elapsed} ms`);
  const data = await res.json();
  if (res.ok) {
    console.log('Model returned:', data.model);
    console.log('Output:\n', data.choices?.[0]?.message?.content);
  } else {
    console.log('Error:', data.error);
  }
}

async function run() {
  await testModel('openai/gpt-oss-20b', false);
  await testModel('openai/gpt-oss-120b', false);
  await testModel('qwen/qwen3.8-27b', false);
  await testModel('qwen/qwen3.8-27b', true);
  await testModel('openai/gpt-oss-120b', true);
}

run();
