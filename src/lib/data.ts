import type { Investigation } from '@/data/schema';
import rawInvestigations from '../../data/investigations.json';

// Verified 8 deep investigations plus catalog records according to Section 4 & 5
export const DEFAULT_INVESTIGATIONS: Investigation[] = rawInvestigations as unknown as Investigation[];

export function getInvestigations(): Investigation[] {
  return DEFAULT_INVESTIGATIONS;
}

export function getInvestigationById(id: string): Investigation | undefined {
  return DEFAULT_INVESTIGATIONS.find((inv) => inv.id === id);
}
