import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findNearestEvidence } from '../src/lib/nearest';
import { HABITAT_PRESETS } from '../src/lib/score';
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
    hardware: null,
    objectives: null,
    fuels: null,
    sample_shape: null,
    sample_size: null,
    cabin_o2_pct: null,
    burner_flow_o2_pct: null,
    pressure_psi: null,
    airflow_speed_cm_s: null,
    varied_variables: null,
    constant_variables: null,
    sensors: null,
    n_tests: null,
    not_reported: [],
    ...overrides,
  };
}

describe('lib/nearest.ts - Nearest Evidence Algorithm', () => {
  it('identifies exact match intersecting the habitat region with distance = 0', () => {
    const recordISS = makeMockRecord({
      id: 'PSI-001',
      name: 'Earth / ISS Atmosphere Test',
      cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    const res = findNearestEvidence([recordISS], HABITAT_PRESETS.iss_cabin);
    assert.strictEqual(res.intersectsRegion, true);
    assert.ok(res.closest);
    assert.strictEqual(res.closest?.intersects, true);
    assert.strictEqual(res.closest?.distance, 0);
    assert.ok(res.message.includes('intersect this region'));
  });

  it('states plainly "no PSI test inside this region" when none intersects', () => {
    // Record at standard Earth atmosphere
    const recordISS = makeMockRecord({
      id: 'PSI-001',
      name: 'Earth Atmosphere Test',
      cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-001', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    // Spacesuit: 100% O2, 4.3 psi
    const res = findNearestEvidence([recordISS], HABITAT_PRESETS.spacesuit);
    assert.strictEqual(res.intersectsRegion, false);
    assert.strictEqual(res.message, 'no PSI test inside this region');
    assert.ok(res.closest);
    assert.strictEqual(res.closest?.intersects, false);
    assert.ok(res.closest!.distance > 0);

    // Check normalized distance formula:
    // dO2 = (100 - 21) / 100 = 0.79
    // dPsi = (14.7 - 4.3) / 14.7 = 10.4 / 14.7 = ~0.70748
    // distance = sqrt(0.79^2 + 0.70748^2) = ~1.0605
    const expectedDist = Math.sqrt(Math.pow((100 - 21) / 100, 2) + Math.pow((14.7 - 4.3) / 14.7, 2));
    assert.ok(Math.abs(res.closest!.distance - expectedDist) < 1e-4);
  });

  it('identifies unplottable records lacking cabin O2 or pressure (including burner-flow only)', () => {
    const recordBurnerOnly = makeMockRecord({
      id: 'PSI-159',
      name: 'CFI-G',
      cabin_o2_pct: null,
      burner_flow_o2_pct: { value: { min: 50, max: 85 }, unit: '%', provenance: { source_id: 'PSI-159', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: { value: { min: 14.7, max: 14.7 }, unit: 'psi', provenance: { source_id: 'PSI-159', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
    });

    const recordMissingPressure = makeMockRecord({
      id: 'PSI-102',
      name: 'SAME',
      cabin_o2_pct: { value: { min: 21, max: 21 }, unit: '%', provenance: { source_id: 'PSI-102', doi: null, file: null, row_or_page: null, entered_by: 'parsed', note: null } },
      pressure_psi: null,
    });

    const res = findNearestEvidence([recordBurnerOnly, recordMissingPressure], HABITAT_PRESETS.moon_base);
    assert.strictEqual(res.unplottableCount, 2);
    const burnerUnplottable = res.unplottableRecords.find((r) => r.id === 'PSI-159');
    assert.ok(burnerUnplottable);
    assert.ok(burnerUnplottable.reason.includes('only burner-flow oxygen reported (not cabin air)'));

    const pressUnplottable = res.unplottableRecords.find((r) => r.id === 'PSI-102');
    assert.ok(pressUnplottable);
    assert.ok(pressUnplottable.reason.includes('pressure not reported'));
  });
});
