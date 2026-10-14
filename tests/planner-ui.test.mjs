import test from 'node:test';
import assert from 'node:assert/strict';
import {rewatchProgress} from '../lib/planner-ui.mjs';
import {plannerSettings, readSaved, saveSettings, displayDate, planCalendar, prettyTime} from '../lib/planner-ui.mjs';

test('migrates the previous default and retains custom valid targets', () => {
  assert.equal(plannerSettings({target:'2026-12-18'}).target, '2026-12-17');
  assert.equal(plannerSettings({target:'2026-11-20'}).target, '2026-11-20');
  assert.equal(plannerSettings({target:'2026-02-30'}).target, '2026-12-17');
});
test('invalid saved settings cannot break the planner', () => {
  assert.deepEqual(plannerSettings({pace:-3, creditMinutes:99, excluded:'not-an-array'}), {pace:.5, skipCredits:false, creditMinutes:15, target:'2026-12-17', excluded:[]});
  assert.equal(plannerSettings({pace:'2', creditMinutes:NaN}).pace, 2.5);
});
test('storage errors are recoverable and malformed settings do not hide the cache', () => {
  const blocked = {getItem(){throw new Error('denied')}, setItem(){throw new Error('quota')}};
  assert.equal(readSaved(blocked, 'settings'), null);
  assert.equal(saveSettings(blocked, 'settings', {}), false);
  assert.equal(readSaved({getItem:()=>'{bad'}, 'settings'), null);
});
test('date-only tickets stay on December 17 in Pacific time', () => {
  assert.equal(displayDate('2026-12-17'), 'Dec 17, 2026');
  assert.equal(displayDate('bad'), 'Date unavailable');
});
test('planner counts Pacific calendar days across daylight-saving time', () => {
  const result = planCalendar(60, 1, '2026-11-02', new Date('2026-10-31T21:00:00Z'));
  assert.equal(result.daysLeft, 2);
  assert.equal(displayDate(result.finish.toISOString()), 'Oct 31, 2026');
});
test('duration formatting carries rounded minutes into hours', () => {
  assert.equal(prettyTime(59.8), '1h 0m');
});
test('progress counts honorable mentions without treating them as completed watches', () => {
 const items=[...Array.from({length:84},()=>({status:'Watched'})),{status:'Partial'},...Array.from({length:47},()=>({status:'Remaining'}))];
 assert.deepEqual(rewatchProgress(items),{completed:84,honorable:1,counted:85,total:132,percent:64});
 assert.deepEqual(rewatchProgress([]),{completed:0,honorable:0,counted:0,total:0,percent:0});
});
