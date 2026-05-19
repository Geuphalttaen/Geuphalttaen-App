export function formatDistance(meters: number | null): string {
  if (meters === null) return '-';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
