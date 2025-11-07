// Date utility functions

export function formatDate(date: Date | string, locale: string = 'bg'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US');
}

export function formatDateTime(date: Date | string, locale: string = 'bg'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale === 'bg' ? 'bg-BG' : 'en-US');
}

export function isDateInPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}
