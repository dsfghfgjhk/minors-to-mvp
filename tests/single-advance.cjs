const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
let seed=827;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
vm.runInNewContext(source+`;
C.cands=makeCands(C.pos);newCareer();S.stats.spd=50;let singles=0;
for(const ev of [90,110,130,150,170])for(const la of [8,12,18,24,30,40])for(const sp of [-40,-25,-10,0,10,25,40]){
 const bb=bbResolve(ev,la,sp,50);if(bb.k!=='1B')continue;
 const p=bbPlan({mode:'bat',pa:{on:'1',out:0}},bb);if(!p||Math.hypot(...p.at)<48)continue;singles++;
 const runner=p.runners.find(r=>r.from===1);
 if(runner.out&&runner.force)throw Error('ordinary outfield single still forces out first-base runner');
 if(p.k!=='1B'||!p.on.includes('2'))throw Error('ordinary single did not advance runner to second');
 if(bbRunArrival(runner)>5)throw Error('runner waits too long before advancing');
 for(const tr of p.throws){if(!tr.carry&&tr.speed>22)throw Error('unrealistic uniform high throw speed')}
}
if(singles<50)throw Error('insufficient outfield single coverage');
console.log(singles+' outfield singles: first-base runner safely advances with continuous running');
`,{console,Math:math});
