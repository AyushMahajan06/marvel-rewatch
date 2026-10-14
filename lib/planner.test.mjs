import test from 'node:test';
import assert from 'node:assert/strict';
import {viewingMinutes} from './planner.mjs';
const film={runtime:{totalMinutes:148}};
test('credits included preserves sourced film runtime',()=>assert.equal(viewingMinutes(film,false,5),148));
test('credits toggle deducts configured minutes from a film',()=>assert.equal(viewingMinutes(film,true,5),143));
test('credits deduction is applied per episode and never removes an entire short',()=>assert.equal(viewingMinutes({runtime:{totalMinutes:54,episodes:[{minutes:4},{minutes:50}]}},true,5),46));
test('unknown runtimes remain unknown even with credits skipped',()=>assert.equal(viewingMinutes({runtime:{totalMinutes:null}},true,5),null));
test('invalid credit values cannot increase or corrupt the total',()=>assert.equal(viewingMinutes(film,true,-10),148));
test('assumed season runtime supports credit deductions without invented episode runtimes',()=>{
 const season={episodes:8,runtime:{assumed:true,totalMinutes:360,episodes:Array.from({length:8},()=>({minutes:null}))}};
 assert.equal(viewingMinutes(season),360);
 assert.equal(viewingMinutes(season,true,5),320);
 assert.equal(viewingMinutes(season,true,100),8);
 assert.ok(season.runtime.episodes.every(e=>e.minutes===null));
});
