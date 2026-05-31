export type ContributionStatus = 'confirmed' | 'pending' | 'missed' | 'upcoming';

export function statusToPidgin(status: ContributionStatus): string {
  const map: Record<ContributionStatus, string> = {
    confirmed: 'Don pay ✓',
    pending: 'On the way...',
    missed: 'E no pay',
    upcoming: 'Not yet due',
  };
  return map[status];
}

export function frequencyToPidgin(frequency: string): string {
  const map: Record<string, string> = {
    weekly: 'Every week',
    biweekly: 'Every two weeks',
    monthly: 'Every month',
  };
  return map[frequency] ?? frequency;
}

export function collectionMessage(name: string, amountNaira: number): string {
  return `${name} don collect ₦${amountNaira.toLocaleString('en-NG')}! 🎉`;
}

export function contributionConfirmed(amountNaira: number): string {
  return `Your money don enter! ₦${amountNaira.toLocaleString('en-NG')} saved ✓`;
}

export function errorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : 'Something no work';
  return msg || 'E no go through — abeg try again';
}
