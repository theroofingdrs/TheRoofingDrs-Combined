/**
 * The Roof Doctors — Lead Intelligence & Configurable Scoring Engine
 * Computes deterministic, auditable lead priority score (0-100) and explicit reasons.
 */

import type { Lead, BusinessRule } from '../../shared/types/index.ts';

export interface ScoringResult {
  score: number;
  scoreReasons: string[];
}

export function calculateLeadScore(lead: Partial<Lead>, rule?: BusinessRule): ScoringResult {
  let score = 20; // Base baseline score for any verified customer inquiry
  const scoreReasons: string[] = ['Base inquiry registered (+20)'];

  const weights = rule?.parameters || {
    emergencyWeight: 25,
    stormDamageWeight: 20,
    insuranceWeight: 15,
    serviceReplacementWeight: 15,
    tier1CityWeight: 10,
    phoneProvidedWeight: 5,
    photoProvidedWeight: 10,
  };

  // 1. Emergency check
  if (lead.emergencyFlag || lead.leadType === 'EMERGENCY' || lead.serviceRequested?.toLowerCase().includes('emergency')) {
    score += weights.emergencyWeight;
    scoreReasons.push(`Active leak / Emergency roof breach (+${weights.emergencyWeight})`);
  }

  // 2. Storm damage check
  if (lead.stormRelatedFlag || lead.leadType === 'STORM_DAMAGE') {
    score += weights.stormDamageWeight;
    scoreReasons.push(`Reported recent storm / hail impact (+${weights.stormDamageWeight})`);
  }

  // 3. Insurance claim correlation
  if (lead.insuranceRelatedFlag || lead.leadType === 'INSURANCE') {
    score += weights.insuranceWeight;
    scoreReasons.push(`Active insurance claim / adjuster meeting (+${weights.insuranceWeight})`);
  }

  // 4. Replacement vs minor repair
  if (lead.leadType === 'REPLACEMENT' || lead.leadType === 'NEW_ROOF' || lead.serviceRequested?.toLowerCase().includes('replacement')) {
    score += weights.serviceReplacementWeight;
    scoreReasons.push(`Full roof replacement requested (+${weights.serviceReplacementWeight})`);
  } else if (lead.leadType === 'REPAIR') {
    score += 8;
    scoreReasons.push('Targeted diagnostic repair requested (+8)');
  } else if (lead.leadType === 'MAINTENANCE') {
    score += 5;
    scoreReasons.push('Preventative maintenance requested (+5)');
  }

  // 5. Geographic Service Area Priority (Tier 1 Northeast Texas cities)
  const tier1Cities = ['texarkana', 'atlanta', 'new boston', 'paris', 'sulphur springs', 'longview', 'tyler', 'marshall'];
  if (lead.city && tier1Cities.includes(lead.city.trim().toLowerCase())) {
    score += weights.tier1CityWeight;
    scoreReasons.push(`Located in primary Tier-1 dispatch corridor (${lead.city}) (+${weights.tier1CityWeight})`);
  }

  // 6. Direct Contact Reachability
  if (lead.phone && lead.phone.replace(/\D/g, '').length >= 10) {
    score += weights.phoneProvidedWeight;
    scoreReasons.push(`Verified telephone callback number (+${weights.phoneProvidedWeight})`);
  }

  // 7. Damage Photos Included
  if (lead.photoUrls && lead.photoUrls.length > 0) {
    score += weights.photoProvidedWeight;
    scoreReasons.push(`Property damage photos provided for triage (+${weights.photoProvidedWeight})`);
  }

  // Normalize score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  return { score, scoreReasons };
}
