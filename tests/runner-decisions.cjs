const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(source+`;
C.pos='SS';C.cands=makeCands('SS');newCareer();S.stats.spd=50;
let scenarios=0,returns=0,holds=0,tagups=0;
for(const on of ['1','2','3','123'])for(const out of [0,1,2])for(const ev of [90,120,150])for(const la of [18,30,50])for(const sp of [-25,0,25]){
 const g={mode:'bat',role:'bat',pa:{on,out},runningMemory:{caution:.3,plays:0}},bb=bbResolve(ev,la,sp,50),p=bbPlan(g,bb);if(!p)continue;scenarios++;
 for(const r of p.runners){
  if(!r.bat&&out===2&&['FO','LO'].includes(bb.k)&&r.legs?.some(leg=>leg.to<leg.from))throw Error('two-out runner returned instead of running');
  if(!['FO','LO'].includes(bb.k)&&!r.out){const forced=r.bat||r.from===1||r.from===2&&on.includes('1')||r.from===3&&on.includes('1')&&on.includes('2');if(forced&&r.to<r.from+1)throw Error('retreat violates force advancement');}
  if(r.decision==='return'||r.decision==='retreat')returns++;if(r.decision==='hold')holds++;
  if(r.decision==='tagup'){tagups++;const leg=r.legs.at(-1);if(leg.start<p.catchAt||leg.start<r.retouchAt||Math.abs(bbRunnerProgress(r,r.retouchAt)-r.from)>1e-6)throw Error('illegal tag-up');}
  for(const leg of r.legs||[]){
   const a=bbRunnerProgress(r,leg.start-1e-7),b=bbRunnerProgress(r,leg.start+1e-7);if(Math.abs(a-b)*27.4>.001)throw Error('runner teleports at route change');
  }
  let previous=bbRunnerProgress(r,0);
  for(let t=.02;t<p.end;t+=.02){const next=bbRunnerProgress(r,t);if(Math.abs(next-previous)*27.4/.02>r.speed*1.1)throw Error('unphysical return speed');previous=next;}
 }
 if(out<2&&['FO','LO'].includes(bb.k))for(const r of p.runners.filter(r=>!r.bat&&r.to===r.from)){
  if(Math.abs(bbRunnerProgress(r,p.end)-r.from)>1e-6)throw Error('caught fly runner did not return');
 }
}
if(returns<1)throw Error('return behavior absent');
// Genuine bad tag-up decisions are prevented, but deep sacrifice-fly chances remain.
const deep={k:'FO',ev:145,la:40,sp:0,fielder:'CF',tf:5,at:[0,122],fly:{x:0,z:122,dist:122,t:5}};
const game={mode:'bat',pa:{on:'3',out:0},runningMemory:{caution:.2,plays:0}};
const deepPlan=bbPlan(game,deep),third=deepPlan.runners.find(r=>r.from===3);
if(third.decision!=='tagup')throw Error('safe deep tag-up was always blocked');
const old=game.runningMemory.caution,lesson={runningLesson:{tagOuts:1}};
pgLearnRunning(game,lesson);const learned=game.runningMemory.caution;pgLearnRunning(game,lesson);
if(learned<=old||game.runningMemory.plays!==1)throw Error('learning missing or duplicate');
for(let i=0;i<100;i++)pgLearnRunning(game,{runningLesson:{tagOuts:1}});
if(game.runningMemory.caution>.95)throw Error('unbounded learning');
// A preview only uses flight estimates, not the already decided hit/out code.
const runner=()=>({from:1,to:1,start:.18,speed:6.6,bat:false});
const a=runner(),b=runner();bbRunnerFlyRead(a,{...deep,k:'FO'},{catchAt:5},.3);bbRunnerFlyRead(b,{...deep,k:'1B'},{catchAt:5},.3);
if(JSON.stringify(a)!==JSON.stringify(b))throw Error('runner reads predetermined result');
console.log({scenarios,returns,holds,tagups,learning:'passed',retouch:'passed',continuity:'passed'});
`,{console,Math});
