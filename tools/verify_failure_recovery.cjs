// Browser checks for blocked autoplay, decoder fallback, resource cleanup and missing 3D support.
const {chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});let errors=[];
for(const kind of ['webcodecs','sheets','webgl']){
 const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(kind+': '+e.message));await p.route('https://**/*',r=>r.abort());
 if(kind!=='webgl')await p.addInitScript(k=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('blocked for test','NotAllowedError'))};if(k==='sheets')Object.defineProperty(window,'VideoDecoder',{value:undefined});},kind);
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:8811/index.html');
 if(kind==='webgl'){
  await p.locator('.cut-skip').click();await p.locator('.launch-primary').click();
  await p.evaluate(()=>{C.cands=makeCands(C.pos);newCareer();startSeason();const e=S.prog.ev.find(e=>e.t==='big');S.prog.p=e.p;S.play=newPlay(e);S.phase='play';render()});
  await p.waitForFunction(()=>P3.fail);await p.locator('[data-a=pg-auto]').last().click();assert(await p.evaluate(()=>S.play.done));await p.locator('[data-a=pg-done]').click();assert.equal(await p.evaluate(()=>S.phase),'progress');
 }else{
  await p.waitForFunction(()=>LAUNCH.anim==='v'?OPP.started&&OPP.next>4:OPA.started&&OPA.f>4,{},{timeout:15000});
  const result=await p.evaluate(()=>({anim:LAUNCH.anim,decoded:OPP.next||0,frame:OPA.f}));console.log(kind,result);
  await p.keyboard.press('Escape');await p.locator('.launch-primary').waitFor();
  await p.waitForFunction(()=>!OPP.raf&&!OPA.raf);
 }
 await p.close();
}
await browser.close();console.log({errors});assert.equal(errors.length,0);
})().catch(e=>{console.error(e);process.exit(1)});
