import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcile} from './rewatch.mjs';
import {applyRewatchPolicy} from './rewatch-policy.mjs';
const csv='Watch Date,Movie/Show,Release Year\n,WandaVision,2021\n,Spider-Man: No Way Home,2021\n,Avengers: Doomsday,2026\n,Vision Quest,2026';
test('uses individual episode totals instead of a fixed episode length',()=>{
 const [show]=reconcile(csv,[]).items;
 assert.equal(show.runtime.totalMinutes,321);
 assert.equal(show.runtime.episodes.length,9);
 assert.equal(show.minutes,null);
});
test('uses theatrical movie runtime',()=>assert.equal(reconcile(csv,[]).items[1].runtime.totalMinutes,148));
test('Doomsday is a ticketed event, not a rewatch entry',()=>{
 const data=reconcile(csv,[]);
 assert.equal(data.items.some(item=>item.title==='Avengers: Doomsday'),false);
 assert.equal(data.ticket.date,'2026-12-17');
});
test('Vision Quest uses an explicit six-hour assumption without inventing episode lengths',()=>{
 const item=reconcile(csv,[]).items.find(item=>item.title==='Vision Quest');
 assert.equal(item.runtime.totalMinutes,360);
 assert.equal(item.runtime.assumed,true);
 assert.ok(item.runtime.episodes.every(e=>e.minutes===null));
});
test('cached data policy is idempotent and does not mutate source records',()=>{
 const source={items:[{title:'Avengers: Doomsday'},{title:'Vision Quest',runtime:{totalMinutes:null,episodes:[{minutes:null}]}}]};
 const adjusted=applyRewatchPolicy(source);
 assert.equal(source.items.length,2);
 assert.equal(source.items[1].runtime.totalMinutes,null);
 assert.deepEqual(applyRewatchPolicy(adjusted),adjusted);
});
