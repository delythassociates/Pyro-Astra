const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('=')[1].trim();

async function test(model) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Respond with valid JSON: {"status": "ok"}' }],
        response_format: { type: 'json_object' }
      })
    });
    console.log(model, '-> HTTP', res.status);
    const json = await res.json();
    if (res.status === 200) {
      console.log('  Model ID returned:', json.model);
      console.log('  Limit requests:', res.headers.get('x-ratelimit-limit-requests'));
      console.log('  Limit tokens:', res.headers.get('x-ratelimit-limit-tokens'));
      console.log('  Remaining requests:', res.headers.get('x-ratelimit-remaining-requests'));
      console.log('  Remaining tokens:', res.headers.get('x-ratelimit-remaining-tokens'));
      console.log('  Content:', json.choices?.[0]?.message?.content);
    } else {
      console.log('  Error:', json.error?.message);
    }
  } catch (e) {
    console.error(e.message);
  }
}

async function main() {
  await test('llama-3.1-8b-instant');
  await test('llama-3.3-70b-versatile');
  await test('qwen/qwen3.8-27b');
  await test('openai/gpt-oss-20b');
  await test('openai/gpt-oss-120b');
}
main();
