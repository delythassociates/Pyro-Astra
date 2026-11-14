import { Investigation, Range } from '@/data/schema';
import { CORE_EVIDENCE_FIELDS } from './score';

export interface NearestTestedValues {
  cabin_o2_pct: { min: number; max: number };
  pressure_psi: { min: number; max: number };
}

export interface NearestResult {
  record: Investigation;
  testedValues: NearestTestedValues;
  distance: number; // Euclidean distance on normalized axes (O2/100, psi/14.7)
  distanceO2: number; // Distance component on O2/100
  distancePsi: number; // Distance component on psi/14.7
  intersects: boolean;
}

export interface UnplottableRecord {
  id: string;
  name: string;
  reason: string;
}

export interface NearestEvidenceOutput {
  closest: NearestResult | null;
  allRanked: NearestResult[];
  unplottableCount: number;
  unplottableRecords: UnplottableRecord[];
  intersectsRegion: boolean;
  message: string;
}

function toRange(val: Range | number): { min: number; max: number } {
  if (typeof val === 'number') {
    return { min: val, max: val };
  }
  const minVal = val.min ?? val.max;
  return { min: Math.min(minVal, val.max), max: Math.max(minVal, val.max) };
}

/**
 * Calculates 1D distance between two intervals [aMin, aMax] and [bMin, bMax].
 * If they overlap, distance is 0.
 */
function intervalDistance(aMin: number, aMax: number, bMin: number, bMax: number): number {
  if (aMax < bMin) return bMin - aMax;
  if (aMin > bMax) return aMin - bMax;
  return 0;
}

/**
 * Computes evidence completeness share for tie-breaking.
 */
function getCompleteness(record: Investigation): number {
  let count = 0;
  for (const f of CORE_EVIDENCE_FIELDS) {
    if (record[f] !== null && record[f] !== undefined) count++;
  }
  return count / CORE_EVIDENCE_FIELDS.length;
}

/**
 * Finds the closest tested condition to the specified habitat on normalized axes (O2/100, psi/14.7).
 * Follows Section 8 of SPEC.md.
 * If no tested conditions intersect the habitat region, states plainly 'no PSI test inside this region'.
 * Never extrapolates or estimates.
 */
export function findNearestEvidence(
  records: Investigation[],
  habitat: { o2: Range | number; pressure: Range | number }
): NearestEvidenceOutput {
  const hO2 = toRange(habitat.o2);
  const hPsi = toRange(habitat.pressure);

  const plottableResults: NearestResult[] = [];
  const unplottableRecords: UnplottableRecord[] = [];

  for (const record of records) {
    const hasCabinO2 = record.cabin_o2_pct?.value != null;
    const hasPressure = record.pressure_psi?.value != null;
    const hasBurnerO2 = record.burner_flow_o2_pct?.value != null;

    if (!hasCabinO2 || !hasPressure) {
      let reason = '';
      if (!hasCabinO2 && hasBurnerO2) {
        reason = 'only burner-flow oxygen reported (not cabin air)';
      } else if (!hasCabinO2 && !hasPressure) {
        reason = 'cabin oxygen and pressure not reported';
      } else if (!hasCabinO2) {
        reason = 'cabin oxygen not reported';
      } else {
        reason = 'pressure not reported';
      }

      unplottableRecords.push({
        id: record.id,
        name: record.name,
        reason,
      });
      continue;
    }

    const rO2 = toRange(record.cabin_o2_pct!.value);
    const rPsi = toRange(record.pressure_psi!.value);

    // Distance on normalized axes: O2 / 100, psi / 14.7
    const rawDistO2 = intervalDistance(rO2.min, rO2.max, hO2.min, hO2.max);
    const rawDistPsi = intervalDistance(rPsi.min, rPsi.max, hPsi.min, hPsi.max);

    const normDistO2 = rawDistO2 / 100.0;
    const normDistPsi = rawDistPsi / 14.7;

    const distance = Math.sqrt(normDistO2 * normDistO2 + normDistPsi * normDistPsi);
    const intersects = rawDistO2 === 0 && rawDistPsi === 0;

    plottableResults.push({
      record,
      testedValues: {
        cabin_o2_pct: rO2,
        pressure_psi: rPsi,
      },
      distance,
      distanceO2: normDistO2,
      distancePsi: normDistPsi,
      intersects,
    });
  }

  // Sort by distance ascending, then by completeness descending, then id ascending
  plottableResults.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) > 1e-6) {
      return a.distance - b.distance;
    }
    const compA = getCompleteness(a.record);
    const compB = getCompleteness(b.record);
    if (Math.abs(compB - compA) > 1e-6) {
      return compB - compA;
    }
    return a.record.id.localeCompare(b.record.id);
  });

  const closest = plottableResults.length > 0 ? plottableResults[0] : null;
  const anyIntersects = plottableResults.some((r) => r.intersects);
  const intersectingCount = plottableResults.filter((r) => r.intersects).length;

  let message: string;
  if (plottableResults.length === 0) {
    message = 'no plottable PSI records with cabin oxygen and pressure';
  } else if (!anyIntersects) {
    // Exact phrase per SPEC Section 8: State plainly 'no PSI test inside this region' when none intersects
    message = 'no PSI test inside this region';
  } else {
    message = `${intersectingCount} PSI test condition(s) intersect this region.`;
  }

  return {
    closest,
    allRanked: plottableResults,
    unplottableCount: unplottableRecords.length,
    unplottableRecords,
    intersectsRegion: anyIntersects,
    message,
  };
}
