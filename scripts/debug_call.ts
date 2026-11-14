import { askAstra } from '../src/lib/agent';

async function main() {
  console.log('Testing askAstra live for probe 74...');
  const res = await askAstra('What was the airflow in cm/s for BASS-II rods?', { mode: 'live' });
  console.log('Mode:', res.mode);
  console.log('Offline:', res.offline_mode);
  console.log('Api status:', res.api_status);
  console.log('Model:', res.model_used);
  console.log('Tokens:', res.tokens);
  console.log('Sentences:', JSON.stringify(res.sentences, null, 2));
  console.log('Raw response:', res.raw_response);
}

main().catch(console.error);
