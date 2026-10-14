// Source runtimes are immutable. Credit skipping is an explicitly estimated plan adjustment.
export function viewingMinutes(item, skipCredits = false, creditMinutes = 5) {
  const runtime = item.runtime;
  if (runtime?.totalMinutes == null) return null;
  if (!skipCredits) return runtime.totalMinutes;
  const deduction = Number.isFinite(creditMinutes) ? Math.max(0, creditMinutes) : 0;
  const parts = runtime.episodes?.length ? runtime.episodes.map(e => e.minutes) : [runtime.totalMinutes];
  if (parts.some(minutes => minutes == null)) return null;
  return parts.reduce((sum, minutes) => sum + Math.max(1, minutes - deduction), 0);
}
