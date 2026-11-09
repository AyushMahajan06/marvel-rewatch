import runtimes from './runtime-data.json' with {type:'json'};
import {applyRewatchPolicy} from './rewatch-policy.mjs';
export const SHEET_ID = '10TKkUaYAORSUVdpuc-0DeJA3xDX_JDvTfB9vqRpj4VY';
export const HANDLE = 'ayushm.bsky.social';
export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
export function csvParse(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i]; if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
  row.push(field);if(row.some(Boolean))rows.push(row);return rows;
}
export function norm(s){return s.toLowerCase().replace(/\([^)]*\)/g,'').replace(/season\s*0?(\d+)/g,'s$1').replace(/\bs0?(\d+)/g,'s$1').replace(/\bthe\b/g,'').replace(/&/g,'and').replace(/[^a-z0-9]/g,'');}
const aliases={shangchi:norm('Shang-Chi and the Legend of the Ten Rings'),bladeii:'blade2',[norm('Guardians of the Galaxy Vol 2')]:norm('Guardians of the Galaxy 2'),avengersendgameencore:'avengersendagmeencore'};
const reviewHeader = /^MCU(?:-canon)?[- ]Rewa[tr]ch(?: Media Piece)?\s+(\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?)*)\s*\/(\d+):?\s*\n+([^\n]+)/i;
const reviewYear = title => Number(title.match(/\((\d{4})\)/)?.[1]) || null;
function rating(text){const a=[...text.matchAll(/(?<![\d.])(10|[0-9](?:\.\d+)?)\s*\/\s*10\b/g)];return a.length?Number(a.at(-1)[1]):null;}
export function parsePosts(posts){
 const reviews=[];for(const p of posts){const t=p.record?.text||'';const match=t.match(reviewHeader);if(!match)continue;if(match[1].includes('.'))continue;
 const numbers = match[1].split(',').map(Number);
 const n = numbers[0];
 let title=match[3].trim();const year=reviewYear(title);let score=rating(t);let note='';
 const continuation=posts.filter(x=>x.record?.reply?.parent?.uri===p.uri&&!/^MCU(?:-canon)?[- ]Rewa[tr]ch/i.test(x.record?.text||''));
 if(score===null){for(const c of continuation){if(rating(c.record.text)!==null)score=rating(c.record.text);}}
 if(p.uri.endsWith('/3mjjbkd4x6k2k')){title='The Punisher';note='Title inferred from the review; confirm the 1989 version.';}
 if(p.uri.endsWith('/3mkmfo67ce22t'))title='Daredevil S1';
 const base={title,year,score,n,denominator:Number(match[2]),text:t,url:`https://bsky.app/profile/${HANDLE}/post/${p.uri.split('/').at(-1)}`,postedAt:p.record.createdAt,note};
 if(/Agent Carter S1, S2/i.test(title)){for(let i=1;i<=2;i++)reviews.push({...base,title:`Agent Carter S${i}`,n:39+i,note:'Shared score from a combined review of both seasons.'});}
 else if(/Agents of Shield s1, 2, 3, 4/i.test(title)){for(let i=1;i<=4;i++)reviews.push({...base,title:`Agents of Shield S${i}`,score:i===4?score:null,n:43+i,note:i===4?'Season 4 score from the combined review.':'Watched in the combined review; no separate rating posted.'});}
 else {
  const titles = title.split(/\s*,\s*/);
  if (numbers.length > 1 && titles.length === numbers.length && titles.every(Boolean)) {
   for (const [index, entry] of titles.entries()) {
    reviews.push({...base, title:entry, year:reviewYear(entry), n:numbers[index], note:'Shared score from a combined review.'});
   }
  } else {
   reviews.push(base);
  }
 }
 }return reviews;
}
function format(title,year){
 if(year===1944)return {type:'Serial',episodes:15,minutes:20};
 if(/one last kill|holiday special|werewolf by night/i.test(title))return {type:'Special',episodes:1,minutes:55};
 const isSeries=/season|\bS\d|wandavision|hawkeye|falcon and|ms\. marvel|moon knight|she-hulk|secret invasion|i am groot|echo|x-men 97|agatha|friendly neighborhood|iron ?heart|eyes of wakanda|marvel zombies|wonder man|vision quest|spider-noir/i.test(title);
 if(!isSeries)return {type:'Movie',episodes:1,minutes:120};
 let episodes=6,minutes=45;
 if(/agents of shield/i.test(title))episodes=/[67]$/.test(title)?13:22;
 else if(/agent carter/i.test(title))episodes=/[12]$/.test(title)&&title.endsWith('1')?8:10;
 else if(/daredevil|jessica jones|luke cage|iron fist|punisher/i.test(title)&&!/born again/i.test(title))episodes=/iron fist.*2$/i.test(title)?10:13;
 else if(/defenders/i.test(title))episodes=8;
 else if(/wandavision|she-hulk|agatha/i.test(title))episodes=9;
 else if(/what if/i.test(title)){episodes=/3$/.test(title)?8:9;minutes=30;}
 else if(/i am groot/i.test(title)){episodes=10;minutes=5;}
 else if(/x-men 97|friendly neighborhood/i.test(title)){episodes=10;minutes=30;}
 else if(/eyes of wakanda|marvel zombies/i.test(title)){episodes=4;minutes=30;}
 else if(/echo/i.test(title))episodes=5;
 else if(/born again/i.test(title))episodes=/1$/.test(title)?9:8;
 else if(/wonder man|spider-noir|vision quest/i.test(title))episodes=8;
 return {type:'Series',episodes,minutes};
}
export function reconcile(csv,posts){
 const table=csvParse(csv),header=table.findIndex(r=>r.includes('Movie/Show'));if(header<0)throw new Error('The Manual sheet no longer has a Movie/Show header.');
 const titleCol=table[header].indexOf('Movie/Show'),yearCol=table[header].indexOf('Release Year'),dateCol=table[header].findIndex(s=>s.includes('Watch Date'));
 const reviews=parsePosts(posts);const items=[];const occurrences=new Map();
 for(const r of table.slice(header+1)){const original=r[titleCol]?.trim();if(!original)continue;const year=Number(r[yearCol])||null;const key=norm(original);const count=(occurrences.get(key+year)||0)+1;occurrences.set(key+year,count);
 let matches=reviews.filter(p=>{let k=aliases[norm(p.title)]||norm(p.title);if(p.title==='The Amazing Spider-Man (2014)')k=norm('The Amazing Spider-Man 2');if(k!==key)return false;return !p.year||!year||p.year===year||/Spirit of Vengeance/i.test(original);});
 if(original==='The Punisher')matches=matches.filter(p=>p.year||year===1989);
 matches.sort((a,b)=>b.postedAt.localeCompare(a.postedAt));const review=matches[0]||null;
 const partial=year===1944&&posts.some(p=>(p.record?.text||'').includes('Captain America (1944)'));
 const display=original==='Guardians of the Galxy Vol. 2'&&year===2023?'Guardians of the Galaxy Vol. 3':original==='Avengers: Endagme Encore'?'Avengers: Endgame Encore':original==='Iron Heart'?'Ironheart':original.replace(/Ghostrider/g,'Ghost Rider');
 items.push({id:`${key}-${year||'tba'}-${count}`,title:display,originalTitle:original,year,plannedDate:r[dateCol]||null,...format(original,year),status:review?'Watched':partial?'Partial':'Remaining',rating:review?.score??null,review,sourceNote:display!==original?'Display title cleaned up; original sheet value retained.':'',runtimeEstimated:true});
 }
 for(const item of items){
  item.runtime=runtimes[item.id]||{totalMinutes:null,complete:false,note:'No sourced runtime available for this entry.'};
  item.minutes=null;
  item.episodes=item.runtime.episodes?.length||item.episodes;
  item.runtimeEstimated=false;
 }
 const newest=reviews.slice().sort((a,b)=>b.postedAt.localeCompare(a.postedAt)||b.n-a.n)[0];
 const updates=posts.filter(p=>{const t=p.record?.text||'';return !/^MCU(?:-canon)?[- ]Rewa[tr]ch/i.test(t)&&/rewatch|flow|doomsday|rating|\/10/i.test(t);}).sort((a,b)=>b.record.createdAt.localeCompare(a.record.createdAt)).slice(0,5).map(p=>({text:p.record.text,url:`https://bsky.app/profile/${HANDLE}/post/${p.uri.split('/').at(-1)}`,postedAt:p.record.createdAt}));
 return applyRewatchPolicy({items,updates,threadProgress:newest?`${newest.n}/${newest.denominator}`:null,latestReview:newest,syncedAt:new Date().toISOString(),sheetUrl:SHEET_URL,profileUrl:`https://bsky.app/profile/${HANDLE}`,source:'Manual'});
}
async function json(url){const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error(`Source returned ${r.status}`);return r.json();}
export async function loadRewatch(){
 const sheetPromise=fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Manual`,{signal:AbortSignal.timeout(25000)}).then(async r=>{if(!r.ok)throw new Error(`Manual sheet returned ${r.status}`);return r.text();});
 const posts=new Map();let cursor;for(let page=0;page<20;page++){const query=new URLSearchParams({actor:HANDLE,limit:'100',filter:'posts_with_replies'});if(cursor)query.set('cursor',cursor);const result=await json(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?${query}`);for(const f of result.feed||[])if(f.post?.author?.handle===HANDLE)posts.set(f.post.uri,f.post);if(!result.cursor)break;if(result.cursor===cursor)throw new Error('Bluesky returned a repeated page.');cursor=result.cursor;if(page===19)throw new Error('Bluesky history exceeds the sync limit; existing dashboard retained.');}
 return reconcile(await sheetPromise,[...posts.values()]);
}
