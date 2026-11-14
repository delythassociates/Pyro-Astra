export interface HabitatPreset {
  id: string;
  name: string;
  o2Range: { min: number; max: number };
  pressureRange: { min: number; max: number };
  notes: string;
  sourceLabel: string;
}

export const HABITAT_PRESETS: HabitatPreset[] = [
  {
    id: 'moon-base',
    name: 'Moon Base',
    o2Range: { min: 30, max: 100 },
    pressureRange: { min: 0, max: 10.2 },
    notes:
      'The challenge brief gives O₂ of 30% or more and pressure of 10.2 psi or less. The 100% O₂ and 0 psi are physical domain limits, not NASA flight specifications.',
    sourceLabel: 'source: challenge brief',
  },
  {
    id: 'spacesuit',
    name: 'Spacesuit (EVA)',
    o2Range: { min: 100, max: 100 },
    pressureRange: { min: 4.3, max: 4.3 },
    notes: 'Pure oxygen environment at 4.3 psi to prevent decompression sickness while maintaining mobility.',
    sourceLabel: 'NASA EVA Reference',
  },
  {
    id: 'iss-cabin',
    name: 'ISS Cabin (Earth Normal)',
    o2Range: { min: 21, max: 21 },
    pressureRange: { min: 14.7, max: 14.7 },
    notes:
      'Earth-normal sea level reference (14.7 psi, 21% O₂ approximation). Note: this is an Earth-air approximation, not an actual ISS telemetry measurement.',
    sourceLabel: 'Earth Reference Approximation',
  },
  {
    id: 'mars-rover',
    name: 'Mars Base / Pressurized Rover',
    o2Range: { min: 28, max: 34 },
    pressureRange: { min: 7.0, max: 8.5 },
    notes: 'Free-set exploration profile. The NASA brief gives no fixed Mars habitat atmosphere.',
    sourceLabel: 'User-Configured Exploration Target',
  },
];
