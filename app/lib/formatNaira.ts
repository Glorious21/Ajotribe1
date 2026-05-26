export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatNairaFromNaira(naira: number): string {
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function parseNairaInput(value: string): number {
  return parseInt(value.replace(/[₦,\s]/g, ''), 10) || 0;
}
