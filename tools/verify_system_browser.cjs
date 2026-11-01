// Serve the repository locally. Supply Playwright with NODE_PATH, GAME_URL and THREE_LOCAL as needed.
const {chromium}=require('playwright');const assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],checks=[];
for(const [width,height] of [[1440,900],[390,844],[844,390]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<900});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push({width,error:e.message}));
 await page.route('https://**/*',r=>r.abort());await page.goto(process.env.GAME_URL||'http://127.0.0.1:8811/index.html');
 await page.locator('.cut-skip').click();await page.locator('.launch-primary').click();await page.locator('#c-name').fill('시스템검증');await page.locator('#c-num').fill('0');
 for(let i=0;i<3;i++)await page.locator('[data-a=c-next]').click();await page.locator('[data-a=c-focus]').first().click();await page.locator('[data-a=c-make]').click();await page.locator('[data-a=c-start]').click();
 for(const tab of ['home','news','season','player','record']){await page.locator(`[data-a=tab][data-v=${tab}]`).click();assert.equal(await page.locator('[aria-current=page]').count(),1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width} ${tab}`)}
 await page.locator('[data-a=settings]').first().click();const code=await page.locator('#exp').inputValue();assert(code.length>100);assert.equal(await page.evaluate(()=>S.num),0);await page.locator('#imp').fill('invalid code');await page.locator('[data-a=do-imp]').click();assert(await page.locator('#imp').count());await page.locator('#imp').fill(Buffer.from(JSON.stringify({v:2,stats:{}})).toString('base64'));await page.locator('[data-a=do-imp]').click();assert.equal(await page.evaluate(()=>S.name),'시스템검증');await page.locator('#imp').fill(code);await page.locator('[data-a=do-imp]').click();assert.equal(await page.evaluate(()=>S.name),'시스템검증');
 await page.reload();await page.locator('.cut-skip').click();await page.locator('.launch-primary').click();assert.equal(await page.evaluate(()=>S.name),'시스템검증');
 await page.evaluate(()=>{act('go');clearInterval(timer);timer=null;});assert.equal(await page.evaluate(()=>S.phase),'progress');
 await page.evaluate(()=>{act('skip');clearInterval(timer);timer=null;});assert.equal(await page.evaluate(()=>S.phase),'summary');await page.locator('[data-a=sum-ok]').click();
 checks.push({width,height,flow:'create, menus, import/export, reload, season completion'});
 if(width===390){
  await page.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
  await page.evaluate(()=>{S.off.decided='검증';S.nat=null;startSeason();const e=S.prog.ev.find(e=>e.t==='big');S.prog.p=e.p;S.play=newPlay(e);S.phase='play';render();});
  await page.waitForSelector('#pg3c canvas');await page.waitForFunction(()=>P3.r&&P3.A.pitcher);await page.locator('[data-a=pg-start]').click();await page.waitForFunction(()=>PG.an?.k==='fly');
  await page.locator('#pg3c canvas').dispatchEvent('pointerdown',{clientX:150,clientY:300,button:0,isPrimary:true});await page.waitForFunction(()=>PG.an?.k==='post'||PG.an?.k==='bb');
  await page.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;const g=S.play;pgStep(g,PG.an.t0+PG.an.dur+100);p3Frame(g,performance.now(),.016);save();});
  assert(await page.evaluate(()=>!S.play.livePending));
  await page.locator('[data-a=pg-auto]').click();assert(await page.evaluate(()=>S.play.done));await page.locator('[data-a=pg-done]').click();assert.equal(await page.evaluate(()=>S.phase),'progress');
  await page.evaluate(()=>{clearInterval(timer);timer=null;});checks.push({webgl:'actual pitch, input, result, auto finish, return to season'});
 }
 await page.close();
}
console.log(JSON.stringify({checks,errors},null,2));await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
