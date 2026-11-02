// NODE_PATH=/path/to/node_modules GAME_URL=http://127.0.0.1:8817/index.html node tools/verify_journey_browser.cjs
const{chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const records=[],requests=[],errors=[];let offline=false,searchOffline=false,postGate=null;
const gameURL=process.env.GAME_URL||'http://127.0.0.1:8817/index.html';
async function context(width=1440,height=1000){
 const c=await browser.newContext({viewport:{width,height}});await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(gameURL).origin});
 await c.route('https://**/*',async route=>{
  const request=route.request(),url=new URL(request.url());if(!url.hostname.endsWith('.supabase.co'))return route.abort();
  const table=url.pathname.split('/').pop();requests.push({method:request.method(),table,query:url.search});
  if(table==='starts')return route.fulfill({status:201,body:''});
  if(table!=='careers')return route.fulfill({status:404,body:'{}'});
  if(request.method()==='POST'){
   if(offline)return route.fulfill({status:503,body:'offline'});
   const row=request.postDataJSON();assert.equal(typeof row.ava,'object');assert(row.name.length>=1&&row.name.length<=12);assert(row.ovr>=0&&row.ovr<=99);assert(row.mvp<=30&&row.aw<=300&&row.tro<=150&&row.seasons>=1&&row.seasons<=40&&row.war>=-60&&row.war<=300);
   if(postGate){const wait=postGate;postGate=null;await wait}
   if(records.some(r=>r.id===row.id))return route.fulfill({status:409,body:'{"code":"23505"}'});
   records.push(row);return route.fulfill({status:201,body:''});
  }
  if(searchOffline)return route.fulfill({status:503,body:'offline'});
  const q=url.searchParams,kind=q.get('ava->>kind');let rows=records.slice();
  if(kind==='eq.journey')rows=rows.filter(r=>r.ava.kind==='journey');else{assert(q.get('id')==='not.like.j-*','retirement ranking included snapshots');rows=rows.filter(r=>r.ava.kind!=='journey')}
  if(q.has('name')){const literal=q.get('name').slice(7,-1).replace(/\\([\\%_*])/g,'$1').toLowerCase();rows=rows.filter(r=>r.name.toLowerCase().includes(literal))}
  if(q.has('ava->journey->>id'))rows=rows.filter(r=>r.ava.journey.id===q.get('ava->journey->>id').slice(3));
  rows.sort((a,b)=>b.ts-a.ts||b.id.localeCompare(a.id));const total=rows.length,offset=+(q.get('offset')||0);rows=rows.slice(offset,offset+(q.get('limit')||100));
  return route.fulfill({status:200,contentType:'application/json',headers:{'content-range':`0-${Math.max(0,rows.length-1)}/${total}`},body:JSON.stringify(rows)});
 });return c;
}
const c=await context(),page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(gameURL);await page.locator('.cut-skip').click();await page.locator('.launch-primary').click();
await page.locator('#c-name').fill('후원성장');for(let i=0;i<3;i++)await page.locator('[data-a=c-next]').click();await page.locator('[data-a=c-focus]').first().click();await page.locator('[data-a=c-make]').click();assert((await page.locator('.sheet').innerText()).includes('성장 기록이 공개'));await page.locator('[data-a=c-start]').click();
await page.evaluate(()=>{clearTimeout(JR.timer);JR.timer=null;return jrFlush()});await page.waitForFunction(()=>jrLocal().some(j=>j.sent));const first=await page.evaluate(()=>S.journey.id);assert(records.some(r=>r.ava.journey?.id===first));
await page.evaluate(()=>{startSeason();finishSeason();save();clearTimeout(JR.timer);JR.timer=null;return jrFlush()});await page.waitForFunction(()=>!JR.busy);const one=records.filter(r=>r.ava.journey?.id===first).at(-1);assert(one.ava.journey.seasons.length===1);
// The whole history survives an offline change and uploads on the actual online event.
offline=true;await page.evaluate(()=>{S.stats.fld+=2;addNews(S.name+'의 수비 집중 훈련','train',0);save();clearTimeout(JR.timer);JR.timer=null;return jrFlush()});assert(await page.evaluate(()=>jrLocal().some(j=>!j.sent)));offline=false;await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.waitForFunction(()=>!JR.busy&&jrLocal().every(j=>j.sent));
// An in-flight old snapshot must not acknowledge a newer update.
let release;postGate=new Promise(r=>release=r);await page.evaluate(()=>{S.stats.fld++;save();clearTimeout(JR.timer);JR.timer=null;jrFlush()});await page.waitForFunction(()=>JR.busy);await page.evaluate(()=>{S.stats.fld++;save()});release();await page.waitForFunction(()=>!JR.busy);assert(await page.evaluate(()=>jrLocal().some(j=>!j.sent)));await page.evaluate(()=>jrFlush());await page.waitForFunction(()=>jrLocal().every(j=>j.sent));
// Same-name second character and a target outside the retired top 100.
await page.evaluate(()=>{C.cands=makeCands(C.pos);newCareer();save();render();clearTimeout(JR.timer);JR.timer=null;return jrFlush()});const second=await page.evaluate(()=>S.journey.id);assert.notEqual(first,second);
const seed=records.filter(r=>r.ava.journey?.id===first).at(-1),clone=JSON.parse(JSON.stringify(seed));clone.id='j-remote-target';clone.name='백위밖선수';Object.assign(clone.ava.journey,{id:'p-remote-target',name:clone.name,updatedAt:1});clone.ts=1;records.push(clone);
// A page containing only older revisions still supports loading more unique players.
for(let n=0;n<65;n++){const r=JSON.parse(JSON.stringify(seed));r.id='j-fill-'+n;r.ts=Date.now()+n;records.push(r)}
await page.locator('[data-a=tab][data-v=record]').click();await page.locator('[data-a=rk-open]').first().click();await page.locator('[data-a=rk-tab][data-v=players]').click();await page.waitForFunction(()=>!ui.rank.jrLoading);assert(await page.locator('[data-a=rk-jr-more]').count());await page.locator('[data-a=rk-jr-more]').click();await page.waitForFunction(()=>!ui.rank.jrLoading);assert(await page.locator('[data-v="p-remote-target"]').count());
await page.locator('#jr-query').fill('후원성장');await page.locator('#jr-query').press('Enter');await page.waitForFunction(()=>!ui.rank.jrLoading);assert.equal(await page.locator('.jr-card').count(),2,'same names or revisions were merged incorrectly');
await page.locator(`[data-a=rk-jr-detail][data-v="${first}"]`).click();await page.waitForFunction(()=>!ui.rank.jrDetailLoading);assert((await page.locator('.jr-profile').innerText()).includes('OVR 45'));assert((await page.locator('.jr-timeline').innerText()).includes('집중 훈련'));assert.equal(await page.locator('.jr-season').count(),1);
await page.locator('[data-a=rk-jr-copy][data-v=full]').click();let copied=await page.evaluate(()=>navigator.clipboard.readText());assert(copied.includes(first)&&copied.includes('집중 훈련')&&copied.includes('2027년'));
await page.locator('[data-a=rk-jr-copy][data-v=short]').click();copied=await page.evaluate(()=>navigator.clipboard.readText());assert(copied.includes('릴스 요약')&&copied.includes('하이라이트'));
await page.locator('[data-a=rk-jr-copy][data-v=link]').click();assert((await page.evaluate(()=>navigator.clipboard.readText())).endsWith('#player='+first));
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(Error('denied'))}}));await page.locator('[data-a=rk-jr-copy][data-v=full]').click();const area=page.locator('#jr-copy-text');await area.waitFor();assert((await area.inputValue()).includes(first));assert(await area.evaluate(el=>el.selectionEnd-el.selectionStart>100));await page.screenshot({path:'/tmp/mvp-browser/journey-desktop.png',fullPage:true});
// Shared links work on a clean device, even after an unfinished career was saved there.
const mobile=await context(390,844),mp=await mobile.newPage();mp.on('pageerror',e=>errors.push(e.message));await mp.goto(gameURL+'#player='+first);await mp.waitForSelector('.jr-profile');await mp.waitForFunction(()=>!ui.rank.jrDetailLoading);assert.equal(await mp.evaluate(()=>S),null);assert((await mp.locator('.jr-profile').innerText()).includes('후원성장'));assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mp.screenshot({path:'/tmp/mvp-browser/journey-mobile.png',fullPage:true});
await mp.locator('[data-a=rk-jr-back]').click();await mp.waitForSelector('#jr-query');await mp.locator('#jr-query').fill('백위밖');await mp.locator('#jr-query').press('Enter');await mp.waitForFunction(()=>!ui.rank.jrLoading);assert.equal(await mp.locator('.jr-card').count(),1);
await mp.locator('#jr-query').fill('없는선수');await mp.locator('#jr-query').press('Enter');await mp.waitForFunction(()=>!ui.rank.jrLoading);assert((await mp.locator('.rk-empty').innerText()).includes('검색된 선수가 없어요'));
await mp.locator('#jr-query').fill(first);await mp.locator('#jr-query').press('Enter');await mp.waitForFunction(()=>!ui.rank.jrLoading);assert.equal(await mp.locator('.jr-card').count(),1);assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await mp.setViewportSize({width:320,height:640});assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
// A failed online search still leaves local same-name records accessible.
await page.locator('[data-a=rk-jr-back]').click();searchOffline=true;await page.locator('#jr-query').fill('후원성장');await page.locator('#jr-query').press('Enter');await page.waitForFunction(()=>!ui.rank.jrLoading);assert.equal(await page.locator('.jr-card').count(),2);assert((await page.locator('[role=status]').first().innerText()).includes('온라인 검색'));searchOffline=false;
// Visiting a shared profile preserves and pauses a saved season, then returns to it.
await page.evaluate(id=>{startSeason();save();location.hash='#player='+id},first);await page.reload();await page.waitForSelector('.jr-profile');await page.waitForFunction(()=>!ui.rank.jrDetailLoading);assert(await page.evaluate(()=>S.phase==='progress'&&!timer));await page.locator('[data-a=rk-close]').click();assert(await page.evaluate(()=>!ui.rank&&S.phase==='progress'&&!!timer));await page.evaluate(()=>{clearInterval(timer);timer=null});
assert(requests.some(r=>r.query.includes('name=ilike.')));assert.equal(errors.length,0,errors.join('\n'));await browser.close();console.log(JSON.stringify({creation:true,seasonHistory:true,offlineRetry:true,inFlightRevision:true,sameNames:true,pagination:true,outsideTop100:true,copyFull:true,copyReelSummary:true,copyFallback:true,shareLinkOnCleanDevice:true,mobile:true,searchFailureFallback:true,sharedLinkPreservesSeason:true,errors},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
