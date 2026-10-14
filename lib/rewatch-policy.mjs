// User planning choices, applied to both fresh source responses and old browser caches.
// The source sheet and sourced episode records remain unchanged.
export const DOOMSDAY_TICKET_DATE = '2026-12-17';
export function applyRewatchPolicy(data) {
  const key = item => (item.originalTitle || item.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return {
    ...data,
    ticket: {title: 'Avengers: Doomsday', date: DOOMSDAY_TICKET_DATE},
    items: data.items.filter(item => key(item) !== 'avengersdoomsday')
    .map(item => item.id === 'captainamerica-1944-1' ? {...item, status: 'Watched'} : item)
    .map(item => key(item) === 'visionquest' ? {
      ...item,
      runtime: {
        ...item.runtime,
        totalMinutes: 360,
        assumed: true,
        complete: false,
        note: 'User-specified planning assumption: six hours for the season. Individual episode runtimes remain unverified.',
      },
    } : item),
  };
}
