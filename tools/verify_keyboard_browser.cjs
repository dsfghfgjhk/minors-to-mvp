// Serve the repository locally, then supply GAME_URL, NODE_PATH and optionally THREE_LOCAL.
const{chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],results=[];
async function pageFor(pos){
 const p=await b.newPage({viewport:{width:1280,height:800}});p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://**/*',r=>r.request().url().includes('/three@')?r.fulfill({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js',contentType:'application/javascript'}):r.abort());
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:8817/index.html');await p.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
 await p.evaluate(pos=>{LAUNCH.screen=null;C.pos=pos;C.focus=[];C.name='키보드 검증';C.cands=makeCands(pos);newCareer();startSeason();const e=S.prog.ev.find(e=>e.t==='big')||{t:'big',kind:'reg',p:.15,seg:0,label:'Keyboard test',oppFull:tnames('HS')[1],opp:tnames('HS')[1]};if(!S.prog.ev.includes(e))S.prog.ev.push(e);S.prog.p=e.p;S.play=newPlay(e);if(pos==='SS'){const g=S.play;g.inn=3;g.top=true;g.batInn=[3,6,9];g.fieldInn=[3,6,9];pgSetField(g,3);g.pa.on='1';g.pa.out=0;g.field=pgFieldMake(g)}S.phase='play';render()},pos);
 await p.waitForSelector('#pg3c canvas');await p.keyboard.press('Enter');return p;
}
const p=await pageFor('SP');assert.equal(await p.evaluate(()=>S.play.st),'aim');
await p.keyboard.press('Digit2');assert(await p.evaluate(()=>S.play.sel.type===S.play.ars[1]));await p.keyboard.press('KeyE');assert(await p.evaluate(()=>S.play.sel.type===S.play.ars[2]));await p.keyboard.press('KeyQ');assert(await p.evaluate(()=>S.play.sel.type===S.play.ars[1]));
await p.keyboard.press('KeyR');const marker=await p.locator('#p3tgt').getAttribute('transform');await p.keyboard.down('ArrowRight');await p.keyboard.down('KeyW');await p.waitForFunction(()=>S.play.sel.u<-.02&&S.play.sel.v<-.02);await p.keyboard.up('ArrowRight');await p.keyboard.up('KeyW');assert.notEqual(await p.locator('#p3tgt').getAttribute('transform'),marker);
await p.keyboard.press('KeyR');await p.keyboard.down('Shift');await p.keyboard.down('KeyA');await p.waitForFunction(()=>S.play.sel.u>.01);await p.keyboard.up('KeyA');await p.keyboard.up('Shift');
// A focused pitch button must not steal the Space pitch control.
await p.locator('[data-a=pg-type]').first().focus();await p.keyboard.down('Space');await p.waitForFunction(()=>PG.pitchChargeSource==='keyboard');await p.keyboard.press('Escape');await p.keyboard.up('Space');assert.equal(await p.evaluate(()=>PG.charge),0);assert.equal(await p.evaluate(()=>S.play.st),'aim');
await p.keyboard.down('Space');await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.keyboard.up('Space');assert.equal(await p.evaluate(()=>S.play.st),'aim');
await p.keyboard.press('KeyR');await p.keyboard.down('Space');await p.waitForTimeout(200);await p.keyboard.up('Space');await p.waitForFunction(()=>S.play.st==='anim');await p.waitForFunction(()=>PG.an?.k==='fly'||PG.an?.k==='post'||PG.an?.k==='bb');
await p.screenshot({path:'/tmp/mvp-browser/keyboard-pitch.png'});
// Finish real pitch lifecycles on a deterministic frame clock so GPU speed does not dictate test duration.
async function settlePitch(){await p.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;const g=S.play;let now=PG.an?.t0||performance.now();for(let n=0;n<2500&&PG.an;n++){now+=1000/60;pgStep(g,now)}pgHud()})}
await settlePitch();let pitches=1;
for(let n=0;n<70&&await p.evaluate(()=>!S.play.done);n++){
 const state=await p.evaluate(()=>S.play.st);
 if(state==='between'||state==='intro'){await p.keyboard.press('Enter');continue}
 assert.equal(state,'aim');await p.keyboard.press('KeyR');await p.keyboard.press(n%2?'Digit1':'Digit2');await p.keyboard.down('Space');await p.waitForTimeout(50);await p.keyboard.up('Space');await settlePitch();pitches++;
}
assert(await p.evaluate(()=>S.play.done),'pitcher game did not finish');await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>S.phase),'progress');results.push({mode:'pitcher',keyboardPitches:pitches,aim:true,pitchTypes:true,precision:true,focusAndCancel:true,resultConfirmation:true});await p.close();
const f=await pageFor('SS');assert.equal(await f.evaluate(()=>S.play.st),'fielding');const start=await f.evaluate(()=>S.play.field.x);await f.keyboard.down('KeyD');await f.waitForFunction(x=>S.play.field.x<x,start);await f.keyboard.up('KeyD');
await f.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;window.keyTestNow=performance.now();PG.fieldLast=keyTestNow});
await f.keyboard.press('KeyJ');assert(await f.evaluate(()=>S.play.field.getupUntil>S.play.field.t));await f.keyboard.down('Numpad2');
let pressed=new Set();
for(let n=0;n<100&&await f.evaluate(()=>S.play.st==='fielding'&&S.play.field.phase!=='throw');n++){
 const direction=await f.evaluate(()=>{const a=S.play.field,t=a.chaseTarget||a.target;return{x:t[0]-a.x,z:t[1]-a.z}});const next=new Set();if(Math.abs(direction.x)>.3)next.add(direction.x>0?'KeyA':'KeyD');if(Math.abs(direction.z)>.3)next.add(direction.z>0?'KeyS':'KeyW');
 for(const key of pressed)if(!next.has(key))await f.keyboard.up(key);for(const key of next)if(!pressed.has(key))await f.keyboard.down(key);pressed=next;
 await f.evaluate(()=>{for(let k=0;k<6;k++){keyTestNow+=1000/60;pgStep(S.play,keyTestNow)}});
}
for(const key of pressed)await f.keyboard.up(key);await f.keyboard.up('Numpad2');assert.equal(await f.evaluate(()=>S.play.field.throws[0]?.base),2,'keyboard fielding failed to throw to second');
await f.evaluate(()=>{for(let n=0;n<1600&&S.play.st==='fielding';n++){keyTestNow+=1000/60;pgStep(S.play,keyTestNow)}pgHud()});assert.equal(await f.evaluate(()=>S.play.st),'between');await f.keyboard.press('Enter');assert.equal(await f.evaluate(()=>S.play.mode),'bat');
// Native Tab/Enter can still activate the optional automatic-progress control.
for(let n=0;n<14&&!await f.evaluate(()=>document.activeElement?.dataset?.a==='pg-auto');n++)await f.keyboard.press('Tab');assert(await f.evaluate(()=>document.activeElement?.dataset?.a==='pg-auto'));await f.keyboard.press('Enter');assert(await f.evaluate(()=>S.play.done));await f.keyboard.press('Enter');assert.equal(await f.evaluate(()=>S.phase),'progress');
results.push({mode:'fielder',movement:true,dive:true,numpadQueuedThrow:true,enterNext:true,tabAndEnter:true,resultConfirmation:true});await f.close();
await b.close();console.log(JSON.stringify({results,errors},null,2));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
