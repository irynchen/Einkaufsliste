export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(timestamp),
  );
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function startOfMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

export function endOfMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
}

export function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(date);
}
