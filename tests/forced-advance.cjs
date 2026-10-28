const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(source+`;
C.cands=makeCands(C.pos);newCareer();
for(const from of [1,2,3]){
 const r={from,to:from+1,start:.18,speed:6.6,forceBase:from+1,forceAt:1};
 bbRunnerLeg(r,from+.08,.18,'run');bbRunnerLeg(r,from,.8);bbRunnerLeg(r,from+1,2);
 const contact=bbRunnerProgress(r,1);
 bbRunnerEnforceForce(r);
 if(Math.abs(bbRunnerProgress(r,1)-contact)>.0001)throw Error('force commitment teleports');
 bbRunnerRetreat(r,1.2,from);
 if(r.to<from+1||Math.abs(bbRunnerProgress(r,20)-(from+1))>.001)throw Error('mandatory runner returns to old base');
 let prev=bbRunnerProgress(r,1.2);
 for(let t=1.22;t<8;t+=.02){const pos=bbRunnerProgress(r,t);if(pos<prev-.0001)throw Error('backward route survives force');prev=pos}
}
let count=0;
for(const on of ['1','12','123'])for(const ev of [70,100,130,160])for(const la of [-10,8,15,25,40,60])for(const sp of [-35,0,35]){
 const bb=bbResolve(ev,la,sp,50);if(['FO','LO','HR','F'].includes(bb.k))continue;
 const p=bbPlan({mode:'bat',pa:{on,out:0}},bb);if(!p)continue;count++;
 for(const r of p.runners){if(r.to<r.forceBase)throw Error('force destination violates rule');
  for(let t=r.forceAt+.02;t<Math.min(p.end,r.retireAt??p.end);t+=.04){const a=bbRunnerProgress(r,t),b=bbRunnerProgress(r,t+.02);if(a<r.forceBase-.005&&b<a-.00001)throw Error('force runner visibly returns before mandatory base')}
 }
}
// An actual catch removes the force; ordinary retouching must remain available.
const fly=bbResolve(90,60,0,50),p=bbPlan({mode:'bat',pa:{on:'1',out:0}},fly);
if(!['FO','LO'].includes(fly.k)||p.runners.some(r=>r.forceBase))throw Error('catch incorrectly keeps force active');
console.log(count+' forced plays, route cancellation, destination guards and legal caught-fly returns passed');
`,{console,Math});
