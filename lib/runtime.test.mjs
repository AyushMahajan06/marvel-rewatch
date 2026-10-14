import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcile} from './rewatch.mjs';
const csv='Watch Date,Movie/Show,Release Year\n,WandaVision,2021\n,Spider-Man: No Way Home,2021\n,Avengers: Doomsday,2026';
test('uses individual episode totals instead of a fixed episode length',()=>{
 const [show]=reconcile(csv,[]).items;
 assert.equal(show.runtime.totalMinutes,321);
 assert.equal(show.runtime.episodes.length,9);
 assert.equal(show.minutes,null);
});
test('uses theatrical movie runtime',()=>assert.equal(reconcile(csv,[]).items[1].runtime.totalMinutes,148));
test('an unconfirmed future runtime remains unknown, not 120 minutes',()=>assert.equal(reconcile(csv,[]).items[2].runtime.totalMinutes,null));
