import { Investigation, Range, SafetyArea } from '@/data/schema';

export interface ScoreComponent {
  name: 'safety_area' | 'environment_overlap' | 'airflow_overlap' | 'evidence_completeness';
  value: number; // 0.0 to 1.0
  weight: number; // normalized weight summing to 1.0
  reason: string;
}

export interface ScoreBreakdown {
  total: number; // 0.0 to 1.0
  components: ScoreComponent[];
}

export interface RankedInvestigation {
  investigation: Investigation;
  score: ScoreBreakdown;
}

export interface HabitatPreset {
  id: 'moon_base' | 'spacesuit' | 'iss_cabin' | 'mars_rover';
  name: string;
  o2: { min: number; max: number };
  pressure: { min: number; max: number };
  description: string;
  source_label: string;
}

export const HABITAT_PRESETS: Record<'moon_base' | 'spacesuit' | 'iss_cabin' | 'mars_rover', HabitatPreset> = {
  moon_base: {
    id: 'moon_base',
    name: 'Moon base',
    o2: { min: 30, max: 100 },
    pressure: { min: 0, max: 10.2 },
    description: 'O2 of 30% or more, pressure of 10.2 psi or less. The 100% and 0 psi are domain limits, not NASA values.',
    source_label: 'NASA brief',
  },
  spacesuit: {
    id: 'spacesuit',
    name: 'Spacesuit',
    o2: { min: 100, max: 100 },
    pressure: { min: 4.3, max: 4.3 },
    description: '100% O2 at 4.3 psi.',
    source_label: 'NASA brief',
  },
  iss_cabin: {
    id: 'iss_cabin',
    name: 'ISS cabin',
    o2: { min: 21, max: 21 },
    pressure: { min: 14.7, max: 14.7 },
    description: 'Earth sea level 14.7 psi, 21% O2 approximation, not an ISS measurement.',
    source_label: 'Earth-air approximation, not an ISS measurement',
  },
  mars_rover: {
    id: 'mars_rover',
    name: 'Mars or rover',
    o2: { min: 0, max: 100 },
    pressure: { min: 0, max: 14.7 },
    description: 'Free-set atmosphere. The brief gives no Mars atmosphere.',
    source_label: 'The brief gives no Mars atmosphere',
  },
};

export const CORE_EVIDENCE_FIELDS: Array<keyof Investigation> = [
  'hardware',
  'objectives',
  'fuels',
  'sample_shape',
  'sample_size',
  'cabin_o2_pct',
  'burner_flow_o2_pct',
  'pressure_psi',
  'airflow_speed_cm_s',
  'varied_variables',
  'constant_variables',
  'sensors',
  'n_tests',
];

export interface ScoreWeights {
  safety_area?: number;
  environment_overlap?: number;
  airflow_overlap?: number;
  evidence_completeness?: number;
}

export interface ScoreOptions {
  habitat: {
    o2: Range | number;
    pressure: Range | number;
  };
  safetyArea?: SafetyArea | 'any';
  airflow?: Range | number | null;
  weights?: ScoreWeights;
}

function toRange(val: Range | number): Range {
  if (typeof val === 'number') {
    return { min: val, max: val };
  }
  const minVal = val.min ?? val.max;
  return { min: Math.min(minVal, val.max), max: Math.max(minVal, val.max) };
}

/**
 * Calculates interval overlap coverage:
 * length of intersection between tested range and habitat interval, divided by habitat length.
 * If tested range is a single point, coverage is 1 when point lies inside habitat interval, 0 otherwise.
 * If habitat is a single point, coverage is 1 if tested range encompasses or equals that point, 0 otherwise.
 */
export function calculateIntervalOverlap(tested: Range | null | undefined, habitat: Range): number {
  if (!tested) return 0;

  const rawTMin = tested.min ?? tested.max;
  const tMin = Math.min(rawTMin, tested.max);
  const tMax = Math.max(rawTMin, tested.max);
  const rawHMin = habitat.min ?? habitat.max;
  const hMin = Math.min(rawHMin, habitat.max);
  const hMax = Math.max(rawHMin, habitat.max);

  // If habitat is a single point
  if (hMin === hMax) {
    return (tMin <= hMin && tMax >= hMin) ? 1.0 : 0.0;
  }

  // If tested is a single point
  if (tMin === tMax) {
    return (tMin >= hMin && tMin <= hMax) ? 1.0 : 0.0;
  }

  // Both are non-degenerate intervals
  const interMin = Math.max(tMin, hMin);
  const interMax = Math.min(tMax, hMax);
  const interLen = Math.max(0, interMax - interMin);
  const habLen = hMax - hMin;

  if (habLen <= 0) return 0;
  const coverage = interLen / habLen;
  return Math.min(1.0, Math.max(0.0, coverage));
}

export function scoreInvestigation(record: Investigation, options: ScoreOptions): ScoreBreakdown {
  const habitatO2 = toRange(options.habitat.o2);
  const habitatPressure = toRange(options.habitat.pressure);
  const hasAirflow = options.airflow !== undefined && options.airflow !== null;

  // 1. Safety-area match (default 0.35)
  let safetyScore = 0;
  let safetyReason = '';
  if (!options.safetyArea || options.safetyArea === 'any') {
    safetyScore = 1.0;
    safetyReason = 'Matches any safety area (filter disabled)';
  } else if (record.safety_areas && record.safety_areas.includes(options.safetyArea)) {
    safetyScore = 1.0;
    safetyReason = `Matches requested safety area '${options.safetyArea}'`;
  } else {
    safetyScore = 0.0;
    const areas = record.safety_areas && record.safety_areas.length > 0 ? record.safety_areas.join(', ') : 'none';
    safetyReason = `Does not match requested safety area '${options.safetyArea}' (record has: ${areas})`;
  }

  // 2. Environment overlap (default 0.35): Mean of O2 coverage and pressure coverage
  let o2Coverage = 0;
  let o2Reason = '';
  if (record.cabin_o2_pct?.value != null) {
    const rO2 = toRange(record.cabin_o2_pct.value);
    o2Coverage = calculateIntervalOverlap(rO2, habitatO2);
    o2Reason = `cabin O2 [${rO2.min}, ${rO2.max}]% vs habitat [${habitatO2.min}, ${habitatO2.max}]%`;
  } else if (record.burner_flow_o2_pct?.value != null) {
    o2Coverage = 0.0;
    o2Reason = 'only burner-flow oxygen reported (not cabin air)';
  } else {
    o2Coverage = 0.0;
    o2Reason = 'cabin oxygen not reported';
  }

  let pressureCoverage = 0;
  let pressureReason = '';
  if (record.pressure_psi?.value != null) {
    const rP = toRange(record.pressure_psi.value);
    pressureCoverage = calculateIntervalOverlap(rP, habitatPressure);
    pressureReason = `pressure [${rP.min}, ${rP.max}] psi vs habitat [${habitatPressure.min}, ${habitatPressure.max}] psi`;
  } else {
    pressureCoverage = 0.0;
    pressureReason = 'pressure not reported';
  }

  const envScore = (o2Coverage + pressureCoverage) / 2.0;
  const envReason = `Mean of O2 (${Math.round(o2Coverage * 100)}%: ${o2Reason}) and pressure (${Math.round(pressureCoverage * 100)}%: ${pressureReason})`;

  // 3. Airflow overlap (default 0.10): Used only if user sets airflow
  let airflowScore = 0;
  let airflowReason = '';
  if (hasAirflow) {
    const habitatAirflow = toRange(options.airflow!);
    if (record.airflow_speed_cm_s?.value != null) {
      const rFlow = toRange(record.airflow_speed_cm_s.value);
      airflowScore = calculateIntervalOverlap(rFlow, habitatAirflow);
      airflowReason = `airflow [${rFlow.min}, ${rFlow.max}] cm/s vs target [${habitatAirflow.min}, ${habitatAirflow.max}] cm/s`;
    } else {
      airflowScore = 0.0;
      airflowReason = 'airflow speed not reported';
    }
  }

  // 4. Evidence completeness (default 0.20): Share of core fields non-null
  let nonNullCount = 0;
  for (const field of CORE_EVIDENCE_FIELDS) {
    if (record[field] !== null && record[field] !== undefined) {
      nonNullCount++;
    }
  }
  const completenessScore = nonNullCount / CORE_EVIDENCE_FIELDS.length;
  const completenessReason = `${nonNullCount}/${CORE_EVIDENCE_FIELDS.length} core fields reported (${Math.round(completenessScore * 100)}%)`;

  // Weights and renormalization
  const rawSafetyWeight = options.weights?.safety_area ?? 0.35;
  const rawEnvWeight = options.weights?.environment_overlap ?? 0.35;
  const rawAirflowWeight = options.weights?.airflow_overlap ?? 0.10;
  const rawCompletenessWeight = options.weights?.evidence_completeness ?? 0.20;

  let normSafetyWeight: number;
  let normEnvWeight: number;
  let normAirflowWeight = 0;
  let normCompletenessWeight: number;

  const components: ScoreComponent[] = [];

  if (hasAirflow) {
    const sum = rawSafetyWeight + rawEnvWeight + rawAirflowWeight + rawCompletenessWeight;
    const factor = sum > 0 ? 1.0 / sum : 1.0;
    normSafetyWeight = rawSafetyWeight * factor;
    normEnvWeight = rawEnvWeight * factor;
    normAirflowWeight = rawAirflowWeight * factor;
    normCompletenessWeight = rawCompletenessWeight * factor;

    components.push({ name: 'safety_area', value: safetyScore, weight: normSafetyWeight, reason: safetyReason });
    components.push({ name: 'environment_overlap', value: envScore, weight: normEnvWeight, reason: envReason });
    components.push({ name: 'airflow_overlap', value: airflowScore, weight: normAirflowWeight, reason: airflowReason });
    components.push({ name: 'evidence_completeness', value: completenessScore, weight: normCompletenessWeight, reason: completenessReason });
  } else {
    // Airflow is unset: renormalize remaining weights so they sum to 1.0
    const sum = rawSafetyWeight + rawEnvWeight + rawCompletenessWeight;
    const factor = sum > 0 ? 1.0 / sum : 1.0;
    normSafetyWeight = rawSafetyWeight * factor;
    normEnvWeight = rawEnvWeight * factor;
    normCompletenessWeight = rawCompletenessWeight * factor;

    components.push({ name: 'safety_area', value: safetyScore, weight: normSafetyWeight, reason: safetyReason });
    components.push({ name: 'environment_overlap', value: envScore, weight: normEnvWeight, reason: envReason });
    components.push({ name: 'evidence_completeness', value: completenessScore, weight: normCompletenessWeight, reason: completenessReason });
  }

  const total = components.reduce((acc, c) => acc + c.value * c.weight, 0);

  return {
    total: Math.min(1.0, Math.max(0.0, total)),
    components,
  };
}

export function rankInvestigations(records: Investigation[], options: ScoreOptions): RankedInvestigation[] {
  const scored = records.map((record) => ({
    investigation: record,
    score: scoreInvestigation(record, options),
  }));

  // Tie-breaker rules:
  // 1. Total score descending
  // 2. Evidence completeness descending
  // 3. ID ascending (deterministic)
  scored.sort((a, b) => {
    if (Math.abs(b.score.total - a.score.total) > 1e-6) {
      return b.score.total - a.score.total;
    }

    const aComp = a.score.components.find((c) => c.name === 'evidence_completeness')?.value ?? 0;
    const bComp = b.score.components.find((c) => c.name === 'evidence_completeness')?.value ?? 0;
    if (Math.abs(bComp - aComp) > 1e-6) {
      return bComp - aComp;
    }

    return a.investigation.id.localeCompare(b.investigation.id);
  });

  return scored;
}
