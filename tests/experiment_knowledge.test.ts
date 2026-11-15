import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  PSI_EXPERIMENT_DETAILS,
  getCatalogOverviewSentences,
  getDisciplineSentences,
  matchExperimentInQuery,
} from '../src/lib/experiment_knowledge';
import { askAstra } from '../src/lib/agent';
import { validateAgentAnswer } from '../src/lib/validate';
import rawInvestigations from '../src/data/investigations.json';
import { Investigation } from '../src/data/schema';

describe('Ask ASTRA Experiment Knowledge Verification', () => {
  const recordsMap = new Map((rawInvestigations as Investigation[]).map((r) => [r.id, r]));

  it('validates all 18 individual experiment profiles against validateAgentAnswer', () => {
    assert.strictEqual(Object.keys(PSI_EXPERIMENT_DETAILS).length, 18);

    for (const [id, detail] of Object.entries(PSI_EXPERIMENT_DETAILS)) {
      const answer = {
        sentences: detail.sentences,
        refusal: null,
      };
      const res = validateAgentAnswer(answer, {
        query: `Tell me about ${detail.acronym} (${id})`,
        records: recordsMap,
        toolResults: detail.toolContext,
      });

      assert.strictEqual(
        res.valid,
        true,
        `Validation failed for ${id} (${detail.acronym}): ${res.errors.map((e) => e.message).join('; ')}`
      );
    }
  });

  it('validates Catalog Overview against validateAgentAnswer', () => {
    const overview = getCatalogOverviewSentences();
    assert.strictEqual(overview.length, 4);

    const res = validateAgentAnswer(
      { sentences: overview, refusal: null },
      { query: 'What are all the experiments in NASA PSI?', records: recordsMap }
    );

    assert.strictEqual(
      res.valid,
      true,
      `Overview validation failed: ${res.errors.map((e) => e.message).join('; ')}`
    );
  });

  it('validates all 4 flight combustion disciplines against validateAgentAnswer', () => {
    for (const disc of ['solids', 'droplets', 'gases', 'smoke'] as const) {
      const sentences = getDisciplineSentences(disc);
      assert.ok(sentences.length >= 3);

      const res = validateAgentAnswer(
        { sentences, refusal: null },
        { query: `Tell me about the ${disc} experiments`, records: recordsMap }
      );

      assert.strictEqual(
        res.valid,
        true,
        `Discipline validation failed for ${disc}: ${res.errors.map((e) => e.message).join('; ')}`
      );
    }
  });

  it('verifies askAstra answers broad catalog queries with full 4-discipline overview', async () => {
    const res = await askAstra('What are all the combustion science experiments in NASA PSI?', { isOffline: true });
    assert.strictEqual(res.validated, true);
    assert.strictEqual(res.sentences.length, 4);
    assert.strictEqual(res.refusal, null);
    assert.ok(res.sentences.some((s) => s.text.includes('BASS')));
    assert.ok(res.sentences.some((s) => s.text.includes('FLEX')));
    assert.ok(res.sentences.some((s) => s.text.includes('Flame Design')));
    assert.ok(res.sentences.some((s) => s.text.includes('SAME')));
  });

  it('verifies askAstra handles specific experiments with grounded profiles', async () => {
    const res1 = await askAstra('Tell me about Flame Design PSI-10', { isOffline: true });
    assert.strictEqual(res1.validated, true);
    assert.ok(res1.sentences.length >= 3);

    const res2 = await askAstra('What did SAME-R measure?', { isOffline: true });
    assert.strictEqual(res2.validated, true);
    assert.ok(res2.sentences.length >= 3);

    const res3 = await askAstra('Tell me about ACME E-FIELD', { isOffline: true });
    assert.strictEqual(res3.validated, true);
    assert.ok(res3.sentences.some((s) => s.text.includes('analog')));
  });
});
