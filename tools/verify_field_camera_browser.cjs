// GAME_URL=http://127.0.0.1:8817/index.html NODE_PATH=/path/to/node_modules node tools/verify_field_camera_browser.cjs
const{chromium}=require('playwright'),assert=require('assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.request().url().includes('/three@')?r.fulfill({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js',contentType:'application/javascript'}):r.abort());
await page.goto(process.env.GAME_URL||'http://127.0.0.1:8817/index.html');await page.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
const checks=[];
for(const [width,height] of [[1440,900],[390,844],[844,390]]){
 await page.setViewportSize({width,height});
 for(const [pos,base] of [['SS',1],['C',2],['CF',4],['SS',2]]){
  await page.evaluate(({pos,base})=>{LAUNCH.screen=null;C.pos=pos;C.focus=[];C.cands=makeCands(pos);newCareer();startSeason();const g=newPlay({kind:'reg',label:'송구 카메라 검증',oppFull:tnames('HS')[1],opp:tnames('HS')[1]});g.inn=3;g.top=true;pgSetField(g,3);g.pa.on='1';g.pa.out=0;g.field=pgFieldMake(g);const f=g.field;f.x=FPOS[pos][0];f.z=FPOS[pos][1];f.phase='held';f.held=true;f.caughtAt=f.t=1;f.catchBall=[f.x,1.15,f.z];f.base=base;g.st='fielding';S.play=g;S.phase='play';render()},{pos,base});
  await page.waitForSelector('#pg3c canvas');await page.evaluate(()=>{cancelAnimationFrame(PG.raf);PG.raf=0;window.camTestNow=performance.now();p3Loop(camTestNow);cancelAnimationFrame(PG.raf);PG.raf=0});
  const result=await page.evaluate(()=>{
   const g=S.play,f=g.field,initial=P3.cam.position.clone(),checks=[];pgFieldThrow(g,1);let first=f.throws[0],relay=false;
   function sample(){P3.cam.updateMatrixWorld(true);const tr=f.throws.filter(t=>f.t>=t.t0-.24).at(-1)||first,base=BASEP[tr.base%4],target=new THREE.Vector3(-base[0],.2,base[1]).project(P3.cam),ball=P3.A.ball.position.clone().project(P3.cam);checks.push({base:tr.base,t:+f.t.toFixed(2),target:[target.x,target.y,target.z],ball:[ball.x,ball.y,ball.z]})}
   for(let frame=0;frame<1200;frame++){
    const tr=f.throws.at(-1);pgFieldUpdate(g,1/60);camTestNow+=1000/60;p3Frame(g,camTestNow,1/60);
    if(f.t>first.t0+.35&&frame%12===0)sample();
    if(f.throws.length>1)relay=true;
    if(g.st!=='fielding'||f.phase==='result'&&f.t>f.throws.at(-1).t0+f.throws.at(-1).dur+.4)break;
   }
   P3.r.render(P3.sc,P3.cam);const movement=initial.distanceTo(P3.cam.position);return{movement,relay,checks,base:P3.fieldCamera.base,mode:P3.fieldCamera.mode};
  });
  assert(result.movement<.01,'camera left the controlled fielder');assert.equal(result.mode,'throw');assert(result.checks.length>0);
  const last=result.checks.at(-1);assert(Math.abs(last.target[0])<.3&&Math.abs(last.target[1])<.3,'camera did not face receiving base');
  if(pos==='SS'&&base===2){assert(result.relay,'double-play relay did not occur');assert.equal(result.base,1,'camera did not pan to first for the relay')}
  if((width===1440&&pos==='SS'&&base===2)||(width===390&&pos==='CF'))await page.screenshot({path:`/tmp/mvp-browser/field-camera-${width}.png`});
  checks.push({width,height,pos,base,thirdPersonPositionHeld:true,facesReceivingBase:true,relay:result.relay});
 }
}
await browser.close();console.log(JSON.stringify({checks,errors},null,2));assert.equal(errors.length,0);
})().catch(e=>{console.error(e);process.exit(1)});
