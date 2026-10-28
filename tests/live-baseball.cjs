const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const js=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
const ctx=vm.createContext({console,Math});vm.runInContext(js,ctx);
vm.runInContext(`
C.pos='SS';C.cands=makeCands('SS');newCareer();S.stats.spd=50;
function fixture(on='1',outs=0){return{mode:'bat',role:'bat',pa:{on,out:outs,b:0,s:0,runs:0,i:1},my:0,op:0,ms:msZero(),msT:msZero()}}
const found={};let total=0;
for(const on of ['','1','12','123'])for(const outs of [0,1,2])for(const ev of [70,100,130,160])for(const sp of [-35,-15,0,15,35]){
 const g=fixture(on,outs),bb=bbResolve(ev,-12,sp,50),p=bbPlan(g,bb);if(!p)throw Error('ground play missing');total++;
 if(p.outs>3-outs)throw Error('too many outs');
 for(const e of p.events.filter(e=>e.kind==='out')){const r=p.runners.find(r=>r.from===e.from&&r.bat===e.bat);if(e.force&&e.t>=bbRunArrival(r))throw Error('force out after runner arrival');if(!e.force&&e.base&&e.t<bbRunArrival(r)-.001)throw Error('tag before runner arrives')}
 for(const tr of p.throws){if(tr.t0<p.catchAt||Math.abs(Math.hypot(tr.to[0]-tr.from[0],tr.to[2]-tr.from[2])/tr.dur-(tr.speed||(tr.carry?6.5:30)))>.001)throw Error('throw timing/speed');}
 if(p.outs===2&&!found.dp)found.dp={g,bb,p};
 if(outs===2&&p.outs&&p.runs)throw Error('force third out scored');
}
for(const ev of [80,100,120,140])for(const la of [10,18,25,35])for(const sp of [-30,0,30]){
 const g=fixture('2'),bb=bbResolve(ev,la,sp,50),p=bbPlan(g,bb);if(p?.events.some(e=>e.kind==='out'&&!e.bat&&!e.force))found.tag={g,bb,p};
}
// A conservative runner still can be trapped on a late-read shallow pop-up.
{const g=fixture('2',0),bb=bbResolve(113.17141573061235,56.89572156406939,-43.393579637631774,50),p=bbPlan(g,bb);if(p?.events.some(e=>e.kind==='out'&&!e.bat&&!e.force))found.tag={g,bb,p};}
if(!found.dp||!found.tag)throw Error('double play or tag out never occurs');
const {g,bb,p}=found.dp;g.lastBB=bb;const before=bbPlaySnapshot(g),res=pgApply(g,bb.k,0);
if(g.pa.out-before.pa.out!==p.outs||g.pa.on!==p.on||res.runs!==p.runs)throw Error('scoreboard disagrees with timeline');
// The renderer and adjudicator must share a continuous ball path.
class V{set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
for(const item of Object.values(found)){const B={play:item.p};for(const tr of item.p.throws){let a=p3LiveBall(B,tr.t0-1e-5,new V()),b=p3LiveBall(B,tr.t0+1e-5,new V());if(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)>.01)throw Error('ball teleports at release')}
 for(let t=0;t<item.p.end;t+=.016){const pos=p3LiveBall(B,t,new V());if(!Number.isFinite(pos.x+pos.y+pos.z))throw Error('invalid ball position')}
}
// Counters advance at the plays, not at contact, and commit once.
const final=bbPlaySnapshot(g);bbPlayRestore(g,before);
const live={play:p,eventIndex:0,dur:p.end,pending:{final,res}};g.livePending=live.pending;
pgFlash=()=>{};save=()=>{};let committed=0;pgAfterBat=()=>{committed++};
const outs=p.events.filter(e=>e.kind==='out');
p3LiveAdvance(g,live,outs[0].t-.001);if(g.pa.out!==before.pa.out)throw Error('premature out');
p3LiveAdvance(g,live,outs[0].t+.001);if(g.pa.out!==before.pa.out+1)throw Error('first out missing');
p3LiveAdvance(g,live,outs[0].t+.001);if(g.pa.out!==before.pa.out+1)throw Error('duplicate event');
p3LiveAdvance(g,live,outs[1].t+.001);if(g.pa.out!==before.pa.out+2)throw Error('second out missing');
p3LiveAdvance(g,live,p.end);p3LiveAdvance(g,live,p.end+1);if(committed!==1||g.livePending)throw Error('duplicate commit');
g.livePending={final,res};pgFinishPending(g);pgFinishPending(g);if(committed!==2||g.livePending)throw Error('resume duplicates play');
console.log(total+' ground scenarios; DP, tag-out, force rules, scoreboard and continuous ball paths passed');
console.log('DP events',found.dp.p.events,'tag events',found.tag.p.events);
`,ctx);
