import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ExportedModel,
  checkApplicabilityDomain,
  evaluateModel,
} from '../src/lib/model';

const mockModel: ExportedModel = {
  model_id: 'TEST_EXTINCTION_SURROGATE',
  target_variable: 'extinction_diameter_mm',
  target_unit: 'mm',
  model_type: 'ridge',
  features: ['d0', 'o2', 'pressure_psi'],
  weights: {
    d0: 0.55,
    o2: 1.20,
    pressure_psi: -0.02,
  },
  intercept: 0.15,
  domain: {
    d0: { min: 1.2, max: 5.0 },
    o2: { min: 0.12, max: 0.34 },
    pressure_psi: { min: 0.0, max: 45.0 },
  },
  per_fuel_domains: {
    Methanol: {
      d0: { min: 1.61, max: 4.35 },
      o2: { min: 0.12, max: 0.34 },
      pressure_psi: { min: 0.0, max: 40.07 },
    },
    Heptane: {
      d0: { min: 1.34, max: 4.67 },
      o2: { min: 0.13, max: 0.24 },
      pressure_psi: { min: 10.21, max: 30.05 },
    },
  },
  model_nature: 'Demonstrator on liquid droplets, NOT a habitat safety predictor',
  convention_note:
    'The 1.50 distance multiplier threshold is an established engineering convention (1.5x of the 95th percentile nearest-neighbor distance in normalized feature space).',
  interval_params: {
    alpha: 0.1,
    q_hat: 0.35,
    coverage_level: 0.9,
  },
  physical_bounds: {
    min: 0.0,
    max: 6.0,
  },
  metadata: {
    name: 'FLEX Droplet Extinction Candidate',
    description: 'Surrogate model benchmarked under grouped LOCO cross-validation',
    investigations_used: ['PSI-69'],
    n_training_samples: 197,
    created_at: '2026-11-15',
  },
};

describe('Workstream M: Domain-Gated Surrogate Modeling & Refusal Protocol', () => {
  it('checkApplicabilityDomain: in-domain query passes with in-domain status', () => {
    const query = { d0: 2.5, o2: 0.21, pressure_psi: 14.7 };
    const res = checkApplicabilityDomain(mockModel, query);
    assert.strictEqual(res.inDomain, true);
    assert.strictEqual(res.status, 'in-domain');
    assert.strictEqual(res.violations.length, 0);
  });

  it('checkApplicabilityDomain: near-boundary query identifies boundary status', () => {
    // d0 = 1.25 is within 5% of min 1.2 (span 3.8, 5% is 0.19 -> 1.2 to 1.39 is boundary)
    const query = { d0: 1.25, o2: 0.21, pressure_psi: 14.7 };
    const res = checkApplicabilityDomain(mockModel, query);
    assert.strictEqual(res.inDomain, true);
    assert.strictEqual(res.status, 'boundary');
    assert.strictEqual(res.violations.length, 0);
  });

  it('checkApplicabilityDomain: out-of-domain query fails and lists violation', () => {
    const query = { d0: 2.0, o2: 0.5, pressure_psi: 14.7 };
    const res = checkApplicabilityDomain(mockModel, query);
    assert.strictEqual(res.inDomain, false);
    assert.strictEqual(res.status, 'out-of-domain');
    assert.strictEqual(res.violations.length, 1);
    assert.strictEqual(res.violations[0].feature, 'o2');
    assert.strictEqual(res.violations[0].value, 0.5);
  });

  it('checkApplicabilityDomain: per-fuel domain isolates Heptane O2 upper limit (0.24) from Methanol (0.34)', () => {
    // For Heptane (is_methanol = 0), O2 = 0.30 violates max 0.24
    const heptaneQuery = { d0: 2.0, o2: 0.30, pressure_psi: 14.7, is_methanol: 0 };
    const heptaneRes = checkApplicabilityDomain(mockModel, heptaneQuery);
    assert.strictEqual(heptaneRes.inDomain, false);
    assert.strictEqual(heptaneRes.status, 'out-of-domain');
    assert.strictEqual(heptaneRes.violations[0].feature, 'o2');
    assert.strictEqual(heptaneRes.violations[0].domain_range[1], 0.24);

    // For Methanol (is_methanol = 1), O2 = 0.30 is inside max 0.34
    const methanolQuery = { d0: 2.0, o2: 0.30, pressure_psi: 14.7, is_methanol: 1 };
    const methanolRes = checkApplicabilityDomain(mockModel, methanolQuery);
    assert.strictEqual(methanolRes.inDomain, true);
  });

  it('evaluateModel: evaluates in-domain point estimate with physical interval', () => {
    const query = { d0: 2.0, o2: 0.21, pressure_psi: 14.7 };
    const res = evaluateModel(mockModel, query);
    assert.strictEqual(res.is_abstention, false);
    assert.strictEqual(res.in_domain, true);
    assert.strictEqual(res.status, 'in-domain');
    assert.ok(res.estimate > 0.0, 'Estimate should be physically positive');
    assert.ok(res.interval[0] >= 0.0, 'Lower interval bound should be non-negative');
    assert.ok(res.interval[1] > res.interval[0], 'Upper bound should exceed lower bound');
    assert.ok(res.citation.includes('TEST_EXTINCTION_SURROGATE'));
  });

  it('evaluateModel: strictly refuses partial-gravity input (Rule 5 & Rule G5)', () => {
    const query = { d0: 2.0, o2: 0.21, pressure_psi: 14.7, gravity: 0.16 };
    const res = evaluateModel(mockModel, query);
    assert.strictEqual(res.is_abstention, true);
    assert.strictEqual(res.in_domain, false);
    assert.strictEqual(res.status, 'out-of-domain');
    assert.ok(Number.isNaN(res.estimate));
    assert.ok(res.abstention_reason?.includes('Partial-gravity'));
    assert.ok(res.abstention_reason?.includes('Section 2 Rule 5'));
  });

  it('evaluateModel: strictly refuses Lunar exploration atmosphere (Rule G5)', () => {
    // Lunar exploration condition: 34% O2, 8.2 psi
    const query = { d0: 2.0, o2: 0.34, pressure_psi: 8.2 };
    const res = evaluateModel(mockModel, query);
    assert.strictEqual(res.is_abstention, true);
    assert.strictEqual(res.in_domain, false);
    assert.strictEqual(res.status, 'out-of-domain');
    assert.ok(Number.isNaN(res.estimate));
    assert.ok(res.abstention_reason?.includes('Lunar habitat condition'));
    assert.ok(res.abstention_reason?.includes('Rule G5'));
  });

  it('null result artifacts: verify published null result report and evaluation JSON', () => {
    const nullReportPath = path.resolve(__dirname, '../data/analysis/null_result_report.json');
    const evalPath = path.resolve(__dirname, '../data/analysis/surrogate_evaluation.json');

    assert.ok(fs.existsSync(nullReportPath), 'null_result_report.json must exist');
    assert.ok(fs.existsSync(evalPath), 'surrogate_evaluation.json must exist');

    const nullReport = JSON.parse(fs.readFileSync(nullReportPath, 'utf-8'));
    const evalMetrics = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));

    assert.strictEqual(nullReport.status, 'published_null_result');
    assert.ok(nullReport.governing_rules.includes('G6'));
    assert.strictEqual(nullReport.model_nature, 'Demonstrator on liquid droplets, NOT a habitat safety predictor');
    assert.ok(nullReport.required_finding.includes('On the FLEX droplet data, error rose by 211.3%'));
    assert.ok(nullReport.convention_note.includes('1.50'));
    assert.ok(nullReport.per_fuel_applicability_domains.Methanol);
    assert.ok(nullReport.per_fuel_applicability_domains.Heptane);

    assert.strictEqual(evalMetrics.sample_size_physical, 189);
    assert.strictEqual(evalMetrics.complete_combustion_excluded_rows, 8);
    assert.strictEqual(evalMetrics.discrete_condition_clusters, 77);
    assert.ok(evalMetrics.loco_results['Dummy (Mean)']);
    assert.ok(evalMetrics.loco_results['Dummy (Median)']);
    assert.ok(evalMetrics.loco_results['1-NN']);
    assert.ok(evalMetrics.loco_results['3-NN']);
    assert.ok(evalMetrics.loco_results['Linear Regression']);
    assert.ok(evalMetrics.loco_results['Random Forest']);
    assert.strictEqual(evalMetrics.loco_results['Linear Regression'].mae_95_ci.length, 2);
    assert.strictEqual(evalMetrics.extrapolation_test.held_out_rows, 8);
  });
});
