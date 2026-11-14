import { askAstra } from '../src/lib/agent';

async function test() {
  console.log('Testing askAstra in LIVE mode...');
  const res = await askAstra('What was the hardware used in BASS-II?', { mode: 'live' });
  console.log('Result mode:', res.mode);
  console.log('Model used:', res.model_used);
  console.log('Latency:', res.api_latency_ms, 'ms');
  console.log('Validated:', res.validated);
  console.log('Sentences:\n', JSON.stringify(res.sentences, null, 2));
}

test();
