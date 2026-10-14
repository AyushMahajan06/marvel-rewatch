import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import posters from '../lib/posters.json' with {type:'json'};
import runtimes from '../lib/runtime-data.json' with {type:'json'};
test('every rewatch record has attributed poster artwork',()=>{
 const ids=Object.keys(runtimes).filter(id=>!id.startsWith('avengersdoomsday'));
 assert.equal(ids.length,132);
 for(const id of ids){const p=posters[id];assert.ok(p,id);assert.ok(p.url.startsWith('https://'));assert.ok(p.source.startsWith('https://'));assert.ok(p.matchedTitle);assert.ok(p.kind);}
});
test('Encore reuse is explicit rather than claiming edition-specific artwork',()=>assert.match(posters['avengersendagmeencore-2026-1'].kind,/Encore-specific artwork unverified/));
test('visitor view starts with All and puts total under Still to watch',()=>{
 const page=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.ok(page.includes("[status,setStatus]=useState('All')"));
 assert.ok(page.includes('Still to watch</span><strong>{remaining.length}<small>titles</small></strong><p>{progress.total} total</p>'));
 assert.ok(!page.includes('watched · {progress.total} total'));
});
