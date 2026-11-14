import { describe, it } from 'node:test';
import assert from 'node:assert';
import { scoreInvestigation, rankInvestigations, HABITAT_PRESETS } from '../src/lib/score';
import { Investigation } from '../data/schema';

function makeMockRecord(overrides: Partial<Investigation>): Investigation {
  return {
    id: 'PSI-999',
    acronym: 'TEST',
    name: 'Test Investigation',
    doi: '10.60555/test-0001',
    license: 'CC0-1.0',
    verified: true,
    depth: 'deep',
    record_type: 'test_matrix',
    safety_areas: ['prevention'],
    gravity_regimes: ['microgravity'],
    data_origin: ['flight'],
    hardware: { value: 'CIR', unit: null, provenance: { source_id: 'PSI-999', doi: '10.60555/test-0001', file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    objectives: { value: 'Test', unit: null, provenance: { source_id: 'PSI-999', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    fuels: { value: ['PMMA'], unit: null, provenance: { source_id: 'PSI-999', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    sample_shape: null,
    sample_size: null,
    cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-999', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    burner_flow_o2_pct: null,
    pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-999', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    airflow_speed_cm_s: null,
    varied_variables: null,
    constant_variables: null,
    sensors: null,
    n_tests: { value: 10, unit: 'count', provenance: { source_id: 'PSI-999', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    not_reported: ['sample_shape', 'sample_size', 'burner_flow_o2_pct', 'airflow_speed_cm_s', 'varied_variables', 'constant_variables', 'sensors'],
    ...overrides,
  };
}

describe('lib/score.ts - Core Algorithm Verification', () => {
  it('SPEC Test 1: ranking changes when O2 moves from 21 to 30', () => {
    const recordA = makeMockRecord({
      id: 'PSI-001',
      acronym: 'AIR21',
      cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    const recordB = makeMockRecord({
      id: 'PSI-002',
      acronym: 'OXY35',
      cabin_o2_pct: { value: { min: 30, max: 40 }, unit: '%', provenance: { source_id: 'PSI-002', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 8.0, max: 10.0 }, unit: 'psi', provenance: { source_id: 'PSI-002', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    // Rank at O2 = 21 (ISS cabin condition: 21% O2, 14.7 psi)
    const issRank = rankInvestigations([recordA, recordB], {
      habitat: HABITAT_PRESETS.iss_cabin,
    });
    assert.strictEqual(issRank[0].investigation.id, 'PSI-001', 'At 21% O2, recordA should rank first');

    // Rank at Moon base (30 to 100% O2, 0 to 10.2 psi)
    const moonRank = rankInvestigations([recordA, recordB], {
      habitat: HABITAT_PRESETS.moon_base,
    });
    assert.strictEqual(moonRank[0].investigation.id, 'PSI-002', 'At 30-100% O2, recordB should rank first');
  });

  it('SPEC Test 2: nulls score 0 with an explanatory reason', () => {
    const recordWithNulls = makeMockRecord({
      id: 'PSI-003',
      cabin_o2_pct: null,
      pressure_psi: null,
    });

    const score = scoreInvestigation(recordWithNulls, {
      habitat: HABITAT_PRESETS.iss_cabin,
    });

    const envComp = score.components.find((c) => c.name === 'environment_overlap');
    assert.ok(envComp, 'Environment component should exist');
    assert.strictEqual(envComp.value, 0, 'Null cabin O2 and pressure must score 0');
    assert.ok(envComp.reason.includes('cabin oxygen not reported'), 'Reason must mention cabin oxygen not reported');
    assert.ok(envComp.reason.includes('pressure not reported'), 'Reason must mention pressure not reported');
  });

  it('SPEC Test 3: ties are deterministic (break by completeness, then ID)', () => {
    // Record X and Y have identical overlap & safety area, but X has higher completeness
    const recordX = makeMockRecord({
      id: 'PSI-010',
      sample_shape: { value: 'sheet', unit: null, provenance: { source_id: 'PSI-010', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });
    const recordY = makeMockRecord({
      id: 'PSI-009',
      sample_shape: null,
    });

    const rank1 = rankInvestigations([recordY, recordX], {
      habitat: HABITAT_PRESETS.iss_cabin,
    });
    assert.strictEqual(rank1[0].investigation.id, 'PSI-010', 'Tie should break in favor of higher completeness');

    // Identical completeness and scores: break by ID ascending
    const recordZ1 = makeMockRecord({ id: 'PSI-050' });
    const recordZ2 = makeMockRecord({ id: 'PSI-040' });
    const rank2 = rankInvestigations([recordZ1, recordZ2], {
      habitat: HABITAT_PRESETS.iss_cabin,
    });
    assert.strictEqual(rank2[0].investigation.id, 'PSI-040', 'Tie should break by ID ascending (PSI-040 before PSI-050)');
  });

  it('SPEC Test 4: burner-flow O2 NEVER counts as cabin O2', () => {
    const recordBurnerOnly = makeMockRecord({
      id: 'PSI-159',
      acronym: 'CFI-G',
      cabin_o2_pct: null,
      burner_flow_o2_pct: { value: { min: 40, max: 85 }, unit: '%', provenance: { source_id: 'PSI-159', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-159', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    const score = scoreInvestigation(recordBurnerOnly, {
      habitat: { o2: { min: 40, max: 85 }, pressure: { min: 14.7, max: 14.7 } },
    });

    const envComp = score.components.find((c) => c.name === 'environment_overlap');
    assert.ok(envComp);
    assert.ok(
      envComp.reason.includes('only burner-flow oxygen reported (not cabin air)'),
      'Must explain that only burner-flow oxygen is reported, scoring 0 for O2'
    );
    // Pressure matches (1.0), O2 is 0.0 -> env score = (0 + 1) / 2 = 0.5
    assert.strictEqual(envComp.value, 0.5);
  });

  it('SPEC Test 5: weights renormalize when airflow is unset', () => {
    const record = makeMockRecord({});

    // Without airflow
    const scoreWithoutAirflow = scoreInvestigation(record, {
      habitat: HABITAT_PRESETS.iss_cabin,
      airflow: null,
    });

    const weightsWithout = scoreWithoutAirflow.components.map((c) => c.weight);
    const sumWithout = weightsWithout.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sumWithout - 1.0) < 1e-6, `Weights must sum to 1.0, got ${sumWithout}`);
    assert.strictEqual(scoreWithoutAirflow.components.some((c) => c.name === 'airflow_overlap'), false);

    // Default weights normalized without airflow:
    // 0.35 / 0.90 = ~0.388888, 0.20 / 0.90 = ~0.222222
    const safetyComp = scoreWithoutAirflow.components.find((c) => c.name === 'safety_area');
    assert.ok(safetyComp);
    assert.ok(Math.abs(safetyComp.weight - 0.35 / 0.9) < 1e-5);

    // With airflow
    const scoreWithAirflow = scoreInvestigation(record, {
      habitat: HABITAT_PRESETS.iss_cabin,
      airflow: { min: 10, max: 20 },
    });

    const weightsWith = scoreWithAirflow.components.map((c) => c.weight);
    const sumWith = weightsWith.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sumWith - 1.0) < 1e-6, `Weights must sum to 1.0 with airflow, got ${sumWith}`);
    assert.ok(scoreWithAirflow.components.some((c) => c.name === 'airflow_overlap'));
  });
});
