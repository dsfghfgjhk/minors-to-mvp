const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let seed=424;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const src=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('const HAS_DOM='))[1];
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();let checked=0,downgraded=0;
for(const spd of [25,50,85])for(const on of ['','1','12'])for(const ev of [150,170,185])for(const la of [12,20,30])for(const sp of [-40,-25,25,40]){
 S.stats.spd=spd;const bb=bbResolve(ev,la,sp,spd);if(!bb.fly||bb.k==='HR'||bb.k==='F'||['FO','LO'].includes(bb.k))continue;bb.k='3B';const p=bbPlan({mode:'bat',pa:{on,out:0}},bb);if(!p)continue;
 const b=p.runners.find(r=>r.bat);if(['1B','2B','3B'].includes(p.k)){const n={'1B':1,'2B':2,'3B':3}[p.k];assert(bbRunnerProgress(b,p.end)>=n-.001,'awarded unearned base');if(p.k==='3B')assert(b.to>=3&&!b.out,'triple awarded to runner stopped before third');}
 if(b.to<3&&!b.out){assert.notEqual(p.k,'3B');downgraded++}checked++;
}
assert(downgraded>0&&checked>100);
// Legacy animation must also finish the actual route before announcing a triple.
S.stats.spd=50;const bb={k:'3B',ev:160,la:25,sp:25,height:.95,fly:bbFly(160,25,25,false,.95)};
const g={mode:'bat',lastBB:bb,pa:{on:'3'}};const B=p3MakeBB(g,{k:'3B',runs:0},'');const b=B.runners.find(r=>r.bat);
assert(Number.isFinite(B.dur)&&B.dur>=bbRunArrival(b));assert(p3RevealT(B,bb)>=bbRunArrival(b));assert(bbRunnerProgress(b,p3RevealT(B,bb))>=3-.001);
assert(bbFirstBaseTime(50)<4.1&&bbFirstBaseTime(50)>3.8);assert(bbFirstBaseTime(90)<bbFirstBaseTime(30));
const a=runPose(0,1),c=runPose(Math.PI,1);assert(a.shL[0]>0&&c.shL[0]<0,'arm swing is not opposite forward foot');assert(a.ftL[0]<0&&runPose(.4*Math.PI*2,1).ftL[0]>0,'foot has no heel/toe transition');
console.log({checked,downgraded,arrivalBeforeTriple:true,fasterRunning:true,armFootCoordination:true});
`,{console,Math:math,assert});
