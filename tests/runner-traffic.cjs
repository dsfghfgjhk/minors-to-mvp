const fs=require('fs'),vm=require('vm');let seed=767;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();let total=0,overlaps=0,ex=null;
for(let i=0;i<5000;i++){
 const on=pick(['1','2','3','12','13','23','123']),out=ri(0,2);S.stats.spd=ri(20,99);const ev=rnd(60,190),la=rnd(-20,75),sp=rnd(-48,48),bb=bbResolve(ev,la,sp,S.stats.spd),p=bbPlan({mode:'bat',pa:{on,out}},bb);if(!p)continue;total++;
 let failed=false;
 for(let t=0;t<p.end+.1;t+=.08){const active=p.runners.filter(r=>!(r.out&&t>r.retireAt+.18)&&!(r.to===4&&bbRunnerProgress(r,Math.min(t,p.thirdAt??t))>=4));
  for(let a=0;a<active.length;a++)for(let b=a+1;b<active.length;b++){
   const x=bbRunnerRenderPoint(active[a],t,p),y=bbRunnerRenderPoint(active[b],t,p);
   if(Math.hypot(x[0]-y[0],x[1]-y[1])<.2&&BASEP.slice(1).some(base=>Math.hypot(x[0]-base[0],x[1]-base[1])<.4)){
    overlaps++;ex||={on,out,ev,la,sp,k:bb.k,t,a:active[a],b:active[b]};failed=true;break;
   }
  }if(failed)break;
 }
}
if(overlaps||total<4000)throw Error('mid-play base traffic overlap: '+JSON.stringify(ex));
console.log({total,overlaps,midPlaySpacing:'passed'});
`,{console,Math:math});
