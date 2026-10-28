const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(source+`;
C.cands=makeCands(C.pos);newCareer();S.stats.spd=50;
// Cancelling an advance while still on the base must also cancel the saved route.
const held={from:2,to:4,start:.18,speed:6.6};bbRunnerLeg(held,2.06,.18);bbRunnerLeg(held,2,.7);bbRunnerLeg(held,4,2);
bbRunnerRetreat(held,1.9,2);
if(held.to!==2||Math.abs(bbRunnerProgress(held,30)-2)>.001)throw Error('hold keeps future home-running route');
let reads=0,returns=0,holds=0,total=0;
for(const on of ['2','3','12','13','23','123'])for(const ev of [85,105,125,145])for(const la of [10,18,25,38])for(const sp of [-35,-15,0,15,35]){
 const bb=bbResolve(ev,la,sp,50),g={mode:'bat',pa:{on,out:0}},p=bbPlan(g,bb);if(!p)continue;total++;
 for(const r of p.runners){
  if(r.riskRead)reads++;
  if(r.decision==='retreat')returns++;
  if(r.decision==='hold')holds++;
  if(!r.out&&Math.abs(bbRunnerProgress(r,p.end)-r.to)>.002)throw Error('final position disagrees with base decision');
 }
 const safe=p.runners.filter(r=>!r.out&&r.to<4);if(new Set(safe.map(r=>r.to)).size!==safe.length)throw Error('runner blocks trailing runner');
}
if(reads<20||returns<1||holds<1)throw Error('conservative decisions absent');
console.log({total,reads,returns,holds});
`,{console,Math});
