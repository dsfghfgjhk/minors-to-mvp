const fs=require('fs'),vm=require('vm');const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();let foul=0,caught=0;
for(const ev of [50,75,100,140,180])for(const la of [-20,0,15,35,60,80])for(const sp of [-150,-90,-65,-46,46,65,90,150]){
 const bb=bbResolve(ev,la,sp,50);if(!['F','FO'].includes(bb.k))throw Error('foul becomes fair hit');
 const again=bbResolve(ev,la,sp,50);if(bb.k!==again.k)throw Error('random foul out');
 if(bb.k==='F'){foul++;continue}caught++;
 const at=bb.fly.path.find(p=>Math.abs(p[0]-bb.tf)<.00001);
 if(!at||at[2]<.3||at[2]>2.3||at[0]>=bb.fly.tEnd)throw Error('foul caught on ground or beyond trajectory');
 const pos=FPOS[bb.fielder],speed=OFK.includes(bb.fielder)?6.8:6;
 if(.4+Math.max(0,Math.hypot(pos[0]-at[1],pos[1]-at[3])-.65)/speed>bb.tf+.00001)throw Error('fielder cannot reach foul catch');
 const play=bbPlan({mode:'bat',pa:{on:'1',out:0}},bb);
 if(!play||play.catchAt!==bb.tf||!play.events.some(e=>e.kind==='out'&&e.catch&&e.t===bb.tf)||!play.text.includes('파울'))throw Error('catch not linked to live out');
}
if(!foul||!caught)throw Error('missing caught or uncaught foul cases');
for(const sp of [-90,-65,65,90])if(bbResolve(180,35,sp,50).k!=='F')throw Error('stands foul is out');
if(bbFoulCatch({path:[[1,2,.037,0],[2,2,.037,0]]}))throw Error('bounced foul counted as catch');
const g={mode:'bat',role:'bat',pa:{on:'1',out:1,b:0,s:2,runs:0},ms:msZero(),msT:msZero(),my:0,op:0};
g.lastBB=bbResolve(180,35,75,50);const res=pgApply(g,'F');if(g.pa.s!==2||g.pa.out!==1||g.pa.on!=='1'||res.end)throw Error('uncaught two-strike foul changes outs or runners');
console.log({foul,caught,airCatch:'passed',count:'passed'});
`,{console,Math});
