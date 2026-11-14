const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GROQ_API_KEY=([^\r\n]+)/)[1].trim();

async function run() {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: 'Return valid JSON object: {"status": "ok"}' },
        { role: 'user', content: 'ping' }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 30
    })
  });

  console.log('Status:', r.status);
  console.log('x-ratelimit-remaining-tokens:', r.headers.get('x-ratelimit-remaining-tokens'));
  console.log('x-ratelimit-remaining-requests:', r.headers.get('x-ratelimit-remaining-requests'));
  const data = await r.json();
  console.log('Usage:', JSON.stringify(data.usage));
  console.log('Model:', data.model);
}
run().catch(console.error);
