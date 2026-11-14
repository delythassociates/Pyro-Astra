import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateInvestigation,
  validateDigest,
  validateAgentAnswer,
  validateProvenance,
} from '../src/lib/validate';
import { Investigation } from '../data/schema';

function makeValidInvestigation(): Investigation {
  return {
    id: 'PSI-102',
    acronym: 'SAME',
    name: 'Smoke Aerosol Measurement Experiment',
    doi: '10.60555/gd4k-8h62',
    license: 'CC0-1.0',
    verified: true,
    depth: 'deep',
    record_type: 'summary',
    safety_areas: ['detection'],
    gravity_regimes: ['microgravity'],
    data_origin: ['flight'],
    hardware: { value: 'SAME rig', unit: null, provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '1', entered_by: 'parsed', note: null } },
    objectives: { value: 'Measure smoke particle size distribution', unit: null, provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '1', entered_by: 'parsed', note: null } },
    fuels: { value: ['Teflon', 'Kapton', 'silicone', 'pyrolysis products'], unit: null, provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '1', entered_by: 'parsed', note: null } },
    sample_shape: null,
    sample_size: null,
    cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '2', entered_by: 'parsed', note: null } },
    burner_flow_o2_pct: null,
    pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '2', entered_by: 'parsed', note: null } },
    airflow_speed_cm_s: { value: { min: 5, max: 20 }, unit: 'cm/s', provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '3', entered_by: 'parsed', note: null } },
    varied_variables: null,
    constant_variables: null,
    sensors: { value: ['ionization detector', 'optical detector'], unit: null, provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '1', entered_by: 'parsed', note: null } },
    n_tests: { value: 18, unit: 'count', provenance: { source_id: 'PSI-102', doi: '10.60555/gd4k-8h62', file: 'same_summary.csv', row_or_page: '1', entered_by: 'parsed', note: null } },
    not_reported: ['sample_shape', 'sample_size', 'burner_flow_o2_pct', 'varied_variables', 'constant_variables'],
  };
}

describe('lib/validate.ts - Schema and Evidence Validation', () => {
  it('validates a complete, compliant investigation record', () => {
    const rec = makeValidInvestigation();
    const result = validateInvestigation(rec);
    assert.strictEqual(result.valid, true, `Expected valid, got: ${JSON.stringify(result.errors)}`);
  });

  it('fails when DOI is missing (SPEC Section 5)', () => {
    const rec = makeValidInvestigation();
    rec.doi = '';
    const res = validateInvestigation(rec);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.field === 'doi'));
  });

  it('fails when unknown keys exist (SPEC Section 5)', () => {
    const rec = { ...makeValidInvestigation(), unauthorized_key: 123 };
    const res = validateInvestigation(rec);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.field === 'unauthorized_key'));
  });

  it('fails when a numeric value has no unit (SPEC Section 5)', () => {
    const rec = makeValidInvestigation();
    rec.cabin_o2_pct = {
      value: { min: 21, max: 21 },
      unit: null, // Numeric value with null unit must fail!
      provenance: { source_id: 'PSI-102', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null },
    };
    const res = validateInvestigation(rec);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.rule?.includes('numeric value with no unit')));
  });

  it('strictly rejects partial-gravity regimes (SPEC Section 2 Rule 5)', () => {
    const rec = makeValidInvestigation();
    rec.gravity_regimes = ['partial-gravity-lunar' as any];
    const res = validateInvestigation(rec);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.rule?.includes('Section 2 Rule 5')));
  });

  it('fails verified: false on deep record when isRelease is true', () => {
    const rec = makeValidInvestigation();
    rec.verified = false;
    const res = validateInvestigation(rec, { isRelease: true });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some((e) => e.field === 'verified'));
  });

  it('validateDigest: catches ungrounded numbers in AI summary sentences', () => {
    const rec = makeValidInvestigation();
    const recordsMap = new Map<string, Investigation>([['PSI-102', rec]]);

    // Grounded digest: numbers 18, 21, 14.7 all exist in rec
    const validDigest = {
      id: 'PSI-102',
      sentences: [
        {
          text: 'The SAME experiment conducted 18 tests under 21% oxygen and 14.7 psi pressure.',
          record_ids: ['PSI-102'],
        },
      ],
    };
    const validRes = validateDigest(validDigest, recordsMap);
    assert.strictEqual(validRes.valid, true, `Expected valid, got: ${JSON.stringify(validRes.errors)}`);

    // Hallucinated number: 99.5 does not appear in rec
    const badDigest = {
      id: 'PSI-102',
      sentences: [
        {
          text: 'The experiment achieved 99.5% combustion efficiency.',
          record_ids: ['PSI-102'],
        },
      ],
    };
    const badRes = validateDigest(badDigest, recordsMap);
    assert.strictEqual(badRes.valid, false);
    assert.ok(badRes.errors.some((e) => e.message.includes("99.5")));
  });

  it('validateAgentAnswer: enforces refusal on partial-gravity and rocket queries', () => {
    const recordsMap = new Map<string, Investigation>([['PSI-102', makeValidInvestigation()]]);

    // Query asking for lunar partial-gravity prediction without refusal
    const unrefusedAnswer = {
      sentences: [
        {
          text: 'Flame spread on the Moon at 0.16g is estimated to be slower.',
          evidence: [{ record_id: 'PSI-102' }],
        },
      ],
      refusal: null,
    };
    const check1 = validateAgentAnswer(unrefusedAnswer, {
      query: 'What is the flame spread rate in lunar gravity (0.16g)?',
      records: recordsMap,
    });
    assert.strictEqual(check1.valid, false, 'Must fail because partial-gravity request was not refused');

    // Query properly refused
    const properlyRefusedAnswer = {
      sentences: [],
      refusal: 'PSI holds no partial-gravity combustion data. Predictions for lunar (0.16g) or Martian gravity are strictly out of scope per Section 2 Rule 5.',
    };
    const check2 = validateAgentAnswer(properlyRefusedAnswer, {
      query: 'What is the flame spread rate in lunar gravity (0.16g)?',
      records: recordsMap,
    });
    assert.strictEqual(check2.valid, true, 'Properly refused answer should be valid');

    // Rocket query properly refused
    const rocketAnswer = {
      sentences: [],
      refusal: 'Rockets and propellants are out of scope (Section 2 Rule 6).',
    };
    const check3 = validateAgentAnswer(rocketAnswer, {
      query: 'How does hydrazine propellant ignite in microgravity?',
    });
    assert.strictEqual(check3.valid, true);
  });

  it('validateAgentAnswer: enforces refusal on safety guarantee queries', () => {
    // Unrefused guarantee query must fail validation
    const unrefusedAnswer = {
      sentences: [
        {
          text: 'Acrylic panels tested in BASS-II did not ignite under low flow conditions.',
          evidence: [{ record_id: 'PSI-25' }],
        },
      ],
      refusal: null,
    };
    const check1 = validateAgentAnswer(unrefusedAnswer, {
      query: 'Can you guarantee that this acrylic panel will never ignite in the cabin?',
    });
    assert.strictEqual(check1.valid, false, 'Must fail because safety guarantee query was not refused');
    assert.ok(
      check1.errors.some((e) => e.message.includes('safety guarantee') || e.message.includes('absolute safety')),
      'Expected safety guarantee refusal error message'
    );

    // Properly refused guarantee query must pass validation
    const properlyRefusedAnswer = {
      sentences: [],
      refusal: 'Refusal: Models provide empirical estimates under tested bounds and cannot guarantee absolute safety. NASA PSI data describes tested bounds only.',
    };
    const check2 = validateAgentAnswer(properlyRefusedAnswer, {
      query: 'Can you guarantee that this acrylic panel will never ignite in the cabin?',
    });
    assert.strictEqual(check2.valid, true, 'Properly refused safety guarantee answer should be valid');
  });

  it('validateAgentAnswer: permits domain-gate refusal notices without spurious model estimate error', () => {
    const refusalAnswer = {
      sentences: [
        {
          text: 'Refusal: Outside applicability domain. Initial droplet diameter d0 = 15.0 mm exceeds the measured FLEX droplet range of 1.2 to 5.0 mm.',
          evidence: [{ record_id: 'PSI-69', field: 'hardware' }],
        },
      ],
      refusal: null,
    };
    const check = validateAgentAnswer(refusalAnswer, {
      query: 'Evaluate extinction model with initial droplet diameter = 15.0 mm.',
    });
    assert.strictEqual(check.valid, true, `Expected valid, got: ${JSON.stringify(check.errors)}`);
  });

  it('validateAgentAnswer: 100% verifier interception catches ungrounded fuels', () => {
    const recordsMap = new Map<string, Investigation>([['PSI-102', makeValidInvestigation()]]);

    // SAME (PSI-102) tested Teflon, Kapton, silicone; claiming it tested hydrazine or methane must fail!
    const badFuelAnswer = {
      sentences: [
        {
          text: 'The SAME experiment evaluated combustion of hydrazine propellant.',
          evidence: [{ record_id: 'PSI-102' }],
        },
      ],
      refusal: null,
    };
    const check = validateAgentAnswer(badFuelAnswer, { records: recordsMap });
    assert.strictEqual(check.valid, false, 'Must fail because hydrazine is not in SAME fuels list');
    assert.ok(check.errors.some((e) => e.message.includes('hydrazine') && e.rule?.includes('Fuel Verification')));
  });

  it('validateAgentAnswer: 100% verifier interception catches bogus units and dimensional mismatches', () => {
    const recordsMap = new Map<string, Investigation>([['PSI-102', makeValidInvestigation()]]);

    // Bogus unit: lightyears
    const bogusUnitAnswer = {
      sentences: [
        {
          text: 'The chamber pressure was 14.7 lightyears.',
          evidence: [{ record_id: 'PSI-102' }],
        },
      ],
      refusal: null,
    };
    const check1 = validateAgentAnswer(bogusUnitAnswer, { records: recordsMap });
    assert.strictEqual(check1.valid, false, 'Must fail because lightyears is an invalid unit');
    assert.ok(check1.errors.some((e) => e.message.includes('lightyears') && e.rule?.includes('Unit Verification')));

    // Dimensional mismatch: airflow velocity in psi
    const mismatchAnswer = {
      sentences: [
        {
          text: 'The duct maintained an airflow velocity of 20 psi.',
          evidence: [{ record_id: 'PSI-102' }],
        },
      ],
      refusal: null,
    };
    const check2 = validateAgentAnswer(mismatchAnswer, { records: recordsMap });
    assert.strictEqual(check2.valid, false, 'Must fail because airflow velocity cannot be in psi');
    assert.ok(check2.errors.some((e) => e.message.includes('dimensional mismatch')));
  });

  it('validateAgentAnswer: 100% verifier interception catches unknown investigation IDs', () => {
    const recordsMap = new Map<string, Investigation>([['PSI-102', makeValidInvestigation()]]);

    // Unknown ID in text: PSI-999
    const unknownIdAnswer = {
      sentences: [
        {
          text: 'Investigation PSI-999 tested flammability limits.',
          evidence: [{ record_id: 'PSI-102' }],
        },
      ],
      refusal: null,
    };
    const check = validateAgentAnswer(unknownIdAnswer, { records: recordsMap });
    assert.strictEqual(check.valid, false, 'Must fail because PSI-999 is not in catalog');
    assert.ok(check.errors.some((e) => e.message.includes('PSI-999') && e.rule?.includes('Investigation ID Check')));
  });

  it('validateProvenance: throws when provenance is missing on non-null Val', () => {
    const validVal = { value: 10, unit: 'count', provenance: { source_id: 'PSI-102', doi: null, file: null, row_or_page: null, entered_by: 'parsed' as const, note: null } };
    assert.doesNotThrow(() => validateProvenance(validVal));

    const invalidVal = { value: 10, unit: 'count', provenance: null as any };
    assert.throws(() => validateProvenance(invalidVal));
  });
});
