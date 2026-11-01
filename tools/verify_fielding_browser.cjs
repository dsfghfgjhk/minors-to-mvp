// GAME_URL=http://127.0.0.1:8815/index.html NODE_PATH=/path/to/node_modules node tools/verify_fielding_browser.cjs
const{chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[],checks=[];
for(const[width,height,pos]of[[1440,900,'SS'],[390,844,'CF'],[844,390,'3B'],[320,640,'C']]){
 console.log('Field browser case',width,height,pos);const page=await browser.newPage({viewport:{width,height},hasTouch:width<900});page.setDefaultTimeout(20000);
 page.on('pageerror',e=>errors.push({width,error:e.message}));await page.route('https://**/*',r=>r.request().url().includes('/three@')?r.fulfill({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js',contentType:'application/javascript'}):r.abort());await page.goto(process.env.GAME_URL||'http://127.0.0.1:8815/index.html');await page.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
 await page.evaluate(pos=>{LAUNCH.screen=null;C.pos=pos;C.hand=pos==='CF'?'좌투좌타':'우투우타';C.name='수비 검증';C.cands=makeCands(pos);C.focus=[];newCareer();startSeason();const e=S.prog.ev.find(e=>e.t==='big')||{t:'big',kind:'reg',label:'Browser test',p:.15,seg:0,oppFull:tnames('HS')[1],opp:tnames('HS')[1]};if(!S.prog.ev.includes(e))S.prog.ev.push(e);const g=newPlay(e);g.inn=3;g.top=true;g.batInn=[3,6,9];g.fieldInn=[3,6,9];pgSetField(g,3);g.pa.on=OFK.includes(pos)?'3':'1';g.pa.out=0;g.field=pgFieldMake(g);S.play=g;S.phase='play';render()},pos);
 await page.waitForSelector('#pg3c canvas');await page.locator('[data-a=pg-start]').click();await page.waitForFunction(()=>S.play.st==='fielding');
 assert.equal(await page.locator('#fld-stick').count(),1);assert.equal(await page.locator('.fld-bases button').count(),4);
 const start=await page.evaluate(()=>S.play.field.x);await page.keyboard.down('ArrowRight');await page.waitForFunction(x=>S.play.field.key==='C'?S.play.field.x>x:S.play.field.x<x,start,{timeout:10000});await page.keyboard.up('ArrowRight');
 const box=await page.locator('#fld-stick').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+32,box.y+box.height/2);await page.waitForFunction(()=>PG.fieldJoy?.x>.2);await page.mouse.up();assert(await page.evaluate(()=>!PG.fieldJoy));await page.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0});
 // All controls fit, and the playing field retains most of the screen.
 const layout=await page.evaluate(()=>({vw:innerWidth,sw:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('.fld-actions,.fld-stick')].map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom}})}));assert(layout.sw<=width+1);for(const r of layout.controls)assert(r.x>=0&&r.y>=0&&r.right<=width+1&&r.bottom<=height+1,'field control overflow');
 await page.screenshot({path:`/tmp/mvp-browser/field-${width}.png`});
 // A screen tap uses the rendered ground plane; then finish moving without an AI catch/throw shortcut.
 const point=await page.evaluate(()=>{const f=S.play.field,v=new THREE.Vector3(-f.target[0],0,f.target[1]).project(P3.cam),r=P3.r.domElement.getBoundingClientRect();return{x:r.x+(v.x+1)/2*r.width,y:r.y+(1-v.y)/2*r.height}});
 if(point.x>0&&point.x<width&&point.y>150&&point.y<height-250){await page.mouse.click(point.x,point.y);assert(await page.evaluate(()=>S.play.field.moveTo||S.play.field.held))}
 await page.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;const g=S.play,f=g.field;for(let n=0;n<1200&&!f.held;n++){f.moveTo=(f.chaseTarget||f.target).slice();pgFieldUpdate(g,.02,{})}pgHud()});
 assert(await page.evaluate(()=>S.play.field.held),'manual movement failed to collect own ball '+JSON.stringify(await page.evaluate(()=>({key:S.play.field.key,time:S.play.field.t,phase:S.play.field.phase,player:[S.play.field.x,S.play.field.z],target:S.play.field.chaseTarget||S.play.field.target}))));assert.equal(await page.evaluate(()=>S.play.field.phase),'held');
 await page.locator('[data-a=fld-base][data-v="1"]').click();
 // Cancelling a charge must not release a throw.
 let throwBox=await page.locator('[data-pg=field-throw]').boundingBox();await page.mouse.move(throwBox.x+10,throwBox.y+10);await page.mouse.down();assert.equal(await page.evaluate(()=>S.play.field.phase),'charging');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.mouse.up();assert.equal(await page.evaluate(()=>S.play.field.throws.length),0);
 throwBox=await page.locator('[data-pg=field-throw]').boundingBox();await page.mouse.move(throwBox.x+10,throwBox.y+10);await page.mouse.down();await page.evaluate(()=>{const f=S.play.field;f.t=f.chargeAt+.54;pgFieldHudFrame(S.play)});await page.screenshot({path:`/tmp/mvp-browser/field-meter-${width}.png`});await page.mouse.up();assert.equal(await page.evaluate(()=>S.play.field.throws[0].quality),1);
 // Restore in-flight defense, then apply its result exactly once.
 await page.reload();await page.locator('.cut-skip').click();await page.locator('.launch-primary').click();await page.waitForSelector('#pg3c canvas');assert.equal(await page.evaluate(()=>S.play.mode),'field');
 await page.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;pgFieldQuick(S.play);save();pgHud()});assert.equal(await page.evaluate(()=>S.play.st),'between');
 await page.locator('[data-a=pg-next]').click();assert.equal(await page.evaluate(()=>S.play.mode),'bat');assert(await page.evaluate(()=>P3.A.batter.visible&&P3.A.batter.userData.batPivot.visible),'bat actor was not restored');
 await page.locator('[data-a=pg-auto]').click();assert(await page.evaluate(()=>S.play.done));
 checks.push({width,height,pos,movement:true,throwMeter:true,cancel:true,reload:true,battingTransition:true});await page.close();
}
await browser.close();console.log(JSON.stringify({checks,errors},null,2));if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
