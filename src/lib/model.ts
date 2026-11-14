export interface ModelDomainFeature {
  min: number;
  max: number;
}

export type ModelDomain = Record<string, ModelDomainFeature>;

export interface IntervalParams {
  alpha: number; // e.g. 0.10 for 90% prediction interval
  q_hat: number; // empirical quantile of prediction errors
  coverage_level: number; // e.g. 0.90
}

export interface ModelMetadata {
  name: string;
  description: string;
  investigations_used: string[];
  n_training_samples: number;
  group_column?: string;
  cv_r2?: number;
  mae?: number;
  created_at: string;
}

export interface ExportedModel {
  model_id: string;
  target_variable: string;
  target_unit: string;
  model_type: 'linear_regression' | 'ridge' | 'polynomial' | 'decision_tree';
  features: string[];
  weights?: Record<string, number>;
  intercept?: number;
  domain: ModelDomain;
  per_fuel_domains?: Record<string, ModelDomain>;
  convention_note?: string;
  model_nature?: string; // e.g. "Demonstrator on liquid droplets, NOT a habitat safety predictor"
  interval_params: IntervalParams;
  physical_bounds?: {
    min?: number;
    max?: number;
  };
  metadata: ModelMetadata;
}

export interface DomainViolation {
  feature: string;
  value: number;
  domain_range: [number, number];
}

export interface DomainCheckResult {
  inDomain: boolean;
  status: 'in-domain' | 'boundary' | 'out-of-domain';
  violations: DomainViolation[];
  reasons: string[];
}

export interface PredictionResult {
  model_id: string;
  target: string;
  unit: string;
  estimate: number;
  interval: [number, number]; // [lower, upper]
  coverage_level: number; // e.g. 0.90
  in_domain: boolean;
  status: 'in-domain' | 'boundary' | 'out-of-domain';
  is_abstention: boolean;
  abstention_reason?: string;
  warnings: string[];
  inputs_used: Record<string, number>;
  citation: string; // Explicit statement per SPEC Section 2 Rule 7 & Section 20
}

/**
 * Checks if candidate feature values lie inside the training applicability domain.
 */
export function checkApplicabilityDomain(
  model: ExportedModel,
  inputs: Record<string, number>
): DomainCheckResult {
  const violations: DomainViolation[] = [];
  const reasons: string[] = [];
  let isNearBoundary = false;

  // Resolve active domain (per-fuel if available, otherwise global)
  let activeDomain = model.domain;
  if (model.per_fuel_domains) {
    if (inputs['is_methanol'] === 1 || inputs['fuel'] === 1) {
      activeDomain = model.per_fuel_domains['Methanol'] ?? model.domain;
    } else if (inputs['is_methanol'] === 0 || inputs['fuel'] === 0) {
      activeDomain = model.per_fuel_domains['Heptane'] ?? model.domain;
    }
  }

  for (const feature of model.features) {
    const val = inputs[feature];
    if (val === undefined || val === null || isNaN(val)) {
      violations.push({
        feature,
        value: NaN,
        domain_range: [activeDomain[feature]?.min ?? 0, activeDomain[feature]?.max ?? 0],
      });
      reasons.push(`Missing value for feature '${feature}'`);
      continue;
    }

    const dom = activeDomain[feature];
    if (dom) {
      if (val < dom.min - 1e-6 || val > dom.max + 1e-6) {
        violations.push({
          feature,
          value: val,
          domain_range: [dom.min, dom.max],
        });
        reasons.push(
          `Feature '${feature}' value ${val} is outside flight-tested domain [${dom.min}, ${dom.max}]`
        );
      } else {
        const span = Math.max(dom.max - dom.min, 1e-6);
        const distToMin = (val - dom.min) / span;
        const distToMax = (dom.max - val) / span;
        if (distToMin < 0.05 || distToMax < 0.05) {
          isNearBoundary = true;
          reasons.push(
            `Feature '${feature}' value ${val} is near tested boundary [${dom.min}, ${dom.max}]`
          );
        }
      }
    }
  }

  const inDomain = violations.length === 0;
  const status: 'in-domain' | 'boundary' | 'out-of-domain' =
    !inDomain ? 'out-of-domain' : isNearBoundary ? 'boundary' : 'in-domain';

  return {
    inDomain,
    status,
    violations,
    reasons,
  };
}

/**
 * Evaluates an exported JSON regression model with domain checking and prediction intervals.
 * Strictly adheres to Section 2 Rule 5 (NO PARTIAL GRAVITY PREDICTIONS), Rule G5 (REFUSE LUNAR CONDITIONS),
 * and Rule 7 (ESTIMATES ARE NOT PSI DATA).
 */
export function evaluateModel(
  model: ExportedModel,
  inputs: Record<string, number>
): PredictionResult {
  const warnings: string[] = [];

  // RULE 5: Strictly refuse partial-gravity predictions
  const gravity = inputs['gravity'] ?? inputs['gravity_g'];
  if (gravity !== undefined && gravity !== null) {
    if (Math.abs(gravity - 0) > 1e-4 && Math.abs(gravity - 1) > 1e-4) {
      return {
        model_id: model.model_id,
        target: model.target_variable,
        unit: model.target_unit,
        estimate: NaN,
        interval: [NaN, NaN],
        coverage_level: model.interval_params.coverage_level,
        in_domain: false,
        status: 'out-of-domain',
        is_abstention: true,
        abstention_reason:
          'Partial-gravity prediction refused (Section 2 Rule 5). PSI holds no partial-gravity combustion data; only 0g and 1g bounds are valid.',
        warnings: ['Partial-gravity prediction prohibited'],
        inputs_used: inputs,
        citation: `Model ${model.model_id} abstained on partial-gravity input`,
      };
    }
  }

  // RULE G5: Strictly refuse Lunar habitat conditions (34% O2, 8.2 psi)
  const o2Val = inputs['o2'] ?? inputs['initial_o2_vol_pct'] ?? inputs['o2_pct'];
  const pressureVal = inputs['pressure_psi'] ?? inputs['pressure'];
  const isLunarO2 =
    o2Val !== undefined && (Math.abs(o2Val - 34) < 1.0 || Math.abs(o2Val - 0.34) < 0.01);
  const isLunarPressure = pressureVal !== undefined && Math.abs(pressureVal - 8.2) < 0.5;
  if (isLunarO2 && isLunarPressure) {
    return {
      model_id: model.model_id,
      target: model.target_variable,
      unit: model.target_unit,
      estimate: NaN,
      interval: [NaN, NaN],
      coverage_level: model.interval_params.coverage_level,
      in_domain: false,
      status: 'out-of-domain',
      is_abstention: true,
      abstention_reason:
        'Lunar habitat condition (34% O2, 8.2 psi) refused (Rule G5). Lunar exploration conditions fall strictly outside the empirical convex hull of public microgravity data; all high-oxygen flight tests occurred at pressure >= 10.33 psi.',
      warnings: ['Lunar habitat condition refused: outside tested convex hull'],
      inputs_used: inputs,
      citation: `Model ${model.model_id} abstained on Lunar habitat condition`,
    };
  }

  // Check Applicability Domain
  const domainCheck = checkApplicabilityDomain(model, inputs);
  if (!domainCheck.inDomain) {
    warnings.push(
      `Inputs outside applicability domain for ${domainCheck.violations.map((v) => `${v.feature}=${v.value} (domain: [${v.domain_range[0]}, ${v.domain_range[1]}])`).join(', ')}. Model estimate may be unreliable.`
    );
  }

  // Point estimate computation
  let yHat = model.intercept ?? 0;
  if (model.weights) {
    for (const f of model.features) {
      const w = model.weights[f] ?? 0;
      const x = inputs[f] ?? 0;
      yHat += w * x;
    }
  }

  // Physical bounds clipping on point estimate
  let pointEstimate = yHat;
  if (model.physical_bounds?.min !== undefined) {
    pointEstimate = Math.max(model.physical_bounds.min, pointEstimate);
  }
  if (model.physical_bounds?.max !== undefined) {
    pointEstimate = Math.min(model.physical_bounds.max, pointEstimate);
  }

  // Empirical prediction interval
  const qHat = model.interval_params.q_hat ?? 0;
  let lower = yHat - qHat;
  let upper = yHat + qHat;

  // Physical sanity clipping on interval bounds
  if (model.physical_bounds?.min !== undefined) {
    lower = Math.max(model.physical_bounds.min, lower);
  }
  if (model.physical_bounds?.max !== undefined) {
    upper = Math.min(model.physical_bounds.max, upper);
  }

  return {
    model_id: model.model_id,
    target: model.target_variable,
    unit: model.target_unit,
    estimate: pointEstimate,
    interval: [lower, upper],
    coverage_level: model.interval_params.coverage_level,
    in_domain: domainCheck.inDomain,
    status: domainCheck.status,
    is_abstention: false,
    warnings,
    inputs_used: inputs,
    citation: `Model estimate (${model.model_id}), not a PSI measurement. Prediction interval coverage: ${Math.round(model.interval_params.coverage_level * 100)}%.`,
  };
}
