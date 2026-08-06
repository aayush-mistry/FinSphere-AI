import { UserProfile, InsurancePolicy, TaxSummary } from '../types';

// In a real app, this might calculate age, fetch latest tax updates, etc.
// For now, it passes through the profile data deterministically.
export function processProfile(
  rawProfile: UserProfile,
  insurance: InsurancePolicy[],
  tax: TaxSummary
): {
  profile: UserProfile;
  insurancePolicies: InsurancePolicy[];
  taxSummary: TaxSummary;
} {
  return {
    profile: rawProfile,
    insurancePolicies: insurance,
    taxSummary: tax,
  };
}
