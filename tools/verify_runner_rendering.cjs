// Serve the repository locally and supply Playwright via NODE_PATH.
// OPENING_URL and THREE_LOCAL may point to an existing local server and Three.js file.
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage();await page.route('https://**/*',r=>r.abort());
 await page.goto(process.env.OPENING_URL||'http://127.0.0.1:8809/index.html');
 await page.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
 const result=await page.evaluate(()=>{
  LAUNCH.screen=null;C.cands=makeCands(C.pos);newCareer();
  P3.sc=new THREE.Scene();P3.cam=new THREE.PerspectiveCamera(35,1,.01,650);
  p3BuildActors();P3.A.zone=new THREE.Object3D();P3.A.grid=new THREE.Object3D();
  let plays=0,frames=0;const errors=[];
  for(const mode of ['bat','pit'])for(const on of ['1','2','3','12','13','23','123'])for(const outs of [0,1,2])for(const shot of [[110,-10,0],[150,15,20],[100,60,0]]){
   const g=newPlay({kind:'reg',label:'runner render verification',oppFull:tnames('HS')[1],opp:tnames('HS')[1]});
   g.mode=mode;g.st=mode==='bat'?'pitching':'aim';g.pa={on,out:outs,b:0,s:0};S.play=g;
   P3.bb=null;p3ResetField(g);const bb=bbResolve(...shot,50),play=bbPlan(g,bb);if(!play)continue;
   plays++;P3.bb={play,runners:play.runners,pts:play.pts,dur:play.end,hr:false,k:play.k,foul:false,t:0};
   PG.an={k:'bb',t0:1000,dur:play.end*1000};
   for(const t of [0,.8,play.catchAt+.05,play.end/2,play.end,play.end+.5]){
    p3Frame(g,1000+t*1000,.016);frames++;
    for(let i=0;i<3;i++){
     const fig=P3.A.runners[i],r=play.runners.find(r=>!r.bat&&r.from===i+1);
     const progress=r?bbRunnerProgress(r,Math.min(t,r.retireAt??play.thirdAt??t)):0;
     const expected=!!r&&!(r.to===4&&progress>=4)&&!(r.out&&t>r.retireAt+.18);
     if(fig.visible!==expected)errors.push({mode,on,outs,shot,t,actor:i+1,visible:fig.visible,expected});
     if(expected){const [x,z]=bbRunnerRenderPoint(r,t,play);if(Math.hypot(fig.position.x+x,fig.position.z-z)>.001)errors.push({mode,on,t,actor:i+1,error:'actor does not follow this runner'})}
    }
   }
  }
  return{plays,frames,errors:errors.slice(0,20),failures:errors.length};
 });
 await browser.close();console.log(JSON.stringify(result));if(result.failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
