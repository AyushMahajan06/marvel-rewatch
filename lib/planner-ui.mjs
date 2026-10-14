import {DOOMSDAY_TICKET_DATE} from './rewatch-policy.mjs';
export const ticketDate = DOOMSDAY_TICKET_DATE;
export const plannerStorageKey = 'ayush-marvel-planner-v1';
export const syncStorageKey = 'ayush-marvel-last-sync';

export function rewatchProgress(items) {
  const completed = items.filter(item => item.status === 'Watched').length;
  const honorable = items.filter(item => item.status === 'Partial').length;
  const counted = completed + honorable;
  return {completed, honorable, counted, total: items.length, percent: items.length ? Math.round(counted / items.length * 100) : 0};
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function plannerSettings(saved) {
  return {
    pace: typeof saved?.pace === 'number' && Number.isFinite(saved.pace) ? Math.round(Math.min(8, Math.max(.5, saved.pace)) * 2) / 2 : 2.5,
    skipCredits: saved?.skipCredits === true,
    creditMinutes: typeof saved?.creditMinutes === 'number' && Number.isFinite(saved.creditMinutes) ? Math.round(Math.min(15, Math.max(0, saved.creditMinutes))) : 5,
    target: validDate(saved?.target) && saved.target !== '2026-12-18' ? saved.target : ticketDate,
    excluded: Array.isArray(saved?.excluded) ? saved.excluded.filter(id => typeof id === 'string') : [],
  };
}

export function readSaved(storage, key) {
  try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
}

export function saveSettings(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

// Date-only targets are calendar dates, not UTC instants.
export function displayDate(value) {
  const date = new Date(validDate(value) ? `${value}T12:00:00Z` : value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:'America/Los_Angeles'}) : 'Date unavailable';
}

export function prettyTime(value) {
  const minutes = Math.round(value);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function planCalendar(minutes, pace, target, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Los_Angeles', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
  const start = Date.parse(`${today}T12:00:00Z`);
  const days = Math.ceil(minutes / (pace * 60));
  const daysLeft = validDate(target) ? Math.max(0, Math.round((Date.parse(`${target}T12:00:00Z`) - start) / 86400000)) : 0;
  // A one-day plan completes today; the ticket day is reserved for Doomsday.
  const finish = new Date(start + Math.max(0, days - 1) * 86400000);
  return {days, daysLeft, finish, needed:daysLeft > 0 ? minutes / 60 / daysLeft : 0};
}
