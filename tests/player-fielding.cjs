const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
let seed=143;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const storage=new Map();
vm.runInNewContext(src+`;
function game(pos='SS',on='1',outs=0){
 C.pos=pos;C.focus=[];C.cands=makeCands(pos);newCareer();startSeason();
 const g=newPlay({kind:'reg',label:'Fielding test',oppFull:tnames('HS')[1],opp:tnames('HS')[1]});
 g.inn=3;g.top=true;pgSetField(g,3);g.pa.on=on;g.pa.out=outs;g.field=pgFieldMake(g);S.play=g;S.phase='play';return g;
}
let plays=0,air=0,dp=0;
for(const pos of ['C','1B','2B','3B','SS','LF','CF','RF'])for(const on of ['','1','12','123'])for(const outs of [0,1,2]){
 const g=game(pos,on,outs),f=g.field;assert.equal(f.key,pos);
 assert(Math.hypot(f.target[0]-FPOS[pos][0],f.target[1]-FPOS[pos][1])<8,'ball missed player defensive area');
 assert(f.path.every(p=>p.slice(0,4).every(Number.isFinite)));
 assert.equal(g.mode,'field');pgFieldQuick(g);plays++;
 assert(f.applied&&g.fieldDone[3]&&g.st==='between');assert(f.held,'auto fielder cannot reach assigned ball');
 assert(g.pa.out===3&&g.op>=f.before.op);assert.equal(g.a[2],g.pa.runs);
 assert.equal(new Set(g.pa.on).size,g.pa.on.length);
 assert(f.throws.every(t=>t.t0+t.dur+.0001>=t.ready),'throw reaches an uncovered base');
 air+=f.caughtAir;dp+=f.events.filter(e=>e.kind==='out').length>=2;
 const final=JSON.stringify(g);pgFieldFinish(g);assert.equal(JSON.stringify(g),final,'field result committed twice');
}
assert(air>=36&&dp>5,'missing fly catches or double plays');
// A middle infielder can step on second with the ball and throw to first for a double play.
{const g=game('2B','1',0);pgFieldStart(g);const f=g.field;f.phase='held';f.held=true;f.caughtAt=f.t=1;f.x=BASEP[2][0];f.z=BASEP[2][1];
 pgFieldUpdate(g,.01);assert(f.runners.find(r=>r.from===1).out);assert.equal(f.base,1);assert.equal(f.phase,'held');
 pgFieldThrow(g,1);while(!f.applied)pgFieldUpdate(g,.04);assert.equal(f.events.filter(e=>e.kind==='out').length,2);
}
// Keyboard and joystick movement operate in screen coordinates and stop with acceleration damping.
{const g=game(),f=g.field;pgFieldStart(g);f.t=.05;const x=f.x,z=f.z;
 for(let n=0;n<10;n++)pgFieldUpdate(g,.016,{x:1,z:-1});assert(f.x<x&&f.z<z);
 const speed=Math.hypot(f.vx,f.vz);for(let n=0;n<8;n++)pgFieldUpdate(g,.016,{});assert(Math.hypot(f.vx,f.vz)<speed);
}
// The player can preload a base but cannot send a throw before catching the ball.
{const g=game();pgFieldStart(g);assert.equal(pgFieldThrow(g,1),false);assert(pgFieldHold(g,3,'pointer:7'));for(let n=0;n<10;n++)pgFieldUpdate(g,.04);assert.equal(g.field.throws.length,0);pgFieldCancel(g);assert.equal(PG.fieldHold,null)}
// Two throws from the same collected ground ball: accurate throwing can get the out, a wild throw cannot.
let good,bad;
{const g=game('SS','',0);pgFieldStart(g);for(let i=0;i<300&&!g.field.held;i++)pgFieldUpdate(g,.02,{auto:true});
 // auto can throw immediately; restore the held checkpoint before judging an identical throw.
 const f=g.field;f.phase='held';f.throws=[];f.base=1;f.t=f.caughtAt;const snap=JSON.stringify(S);
 f.t+=.28;pgFieldThrow(g,1);while(!f.applied)pgFieldUpdate(g,.04);good=f.events.filter(e=>e.kind==='out').length;
 S=JSON.parse(snap);const g2=S.play,f2=g2.field;f2.t+=.28;pgFieldThrow(g2,0);while(!f2.applied)pgFieldUpdate(g2,.04);bad=f2.events.filter(e=>e.kind==='out').length;
 assert(good>bad&&f2.error&&g2.fs.errors===1,'wild throws have no consequence');
}
// Holding a base before the catch queues one throw, without any release timing.
{const g=game('SS','1',0);pgFieldStart(g);const f=g.field;assert(pgFieldHold(g,2,'pointer:1'));
 for(let n=0;n<800&&f.phase!=='throw';n++){f.moveTo=(f.chaseTarget||f.target).slice();pgFieldUpdate(g,.02)}
 assert(f.held);assert.equal(f.phase,'throw');assert.equal(f.throws[0].base,2);assert.equal(PG.fieldHold,null);
 for(let n=0;n<10;n++)pgFieldUpdate(g,.02);assert.equal(f.throws.filter(t=>!t.relay).length,1);
}
// A short tap, cancellation and a paused hold cannot accidentally dispatch a throw.
{const g=game('SS','',0);pgFieldStart(g);const f=g.field;f.phase='held';f.held=true;f.caughtAt=f.t=1;
 pgFieldHold(g,1,'pointer:1');for(let n=0;n<5;n++)pgFieldUpdate(g,.04);assert.equal(f.throws.length,0);
 pgFieldCancel(g);for(let n=0;n<6;n++)pgFieldUpdate(g,.04);assert.equal(f.throws.length,0);
 pgFieldHold(g,3,'pointer:2');assert.equal(pgFieldHold(g,1,'pointer:9'),false);pgFieldSelect(g,1);assert.equal(f.base,3);pgFieldCancel(g);
 pgFieldHold(g,1,'key:Digit1');for(let n=0;n<8;n++)pgFieldUpdate(g,.04);assert.equal(f.throws.length,1);assert.equal(f.throws[0].base,1);
}
// Throw quality depends on player ratings, not how long a base was held.
{const g=game('SS','',0);pgFieldStart(g);g.field.phase='held';g.field.held=true;g.field.caughtAt=g.field.t=1;const snap=JSON.stringify(S);let quality=null;
 for(const duration of [.3,.7,1.4]){S=JSON.parse(snap);const gg=S.play,f=gg.field;setSeed(765);pgFieldHold(gg,1,'pointer:1');f.t+=duration;pgFieldUpdate(gg,0);assert.equal(f.throws.length,1);if(quality==null)quality=f.throws[0].quality;else assert.equal(f.throws[0].quality,quality)}
 const errors=[];for(const ability of [30,95]){S=JSON.parse(snap);const gg=S.play,f=gg.field;S.stats.arm=S.stats.fld=ability;setSeed(512);let bad=0;
  for(let n=0;n<400;n++){f.phase='held';f.throws=[];f.error=false;pgFieldThrow(gg);if(f.throws[0].miss>2.3)bad++}errors.push(bad);
 }assert(errors[0]>errors[1]&&errors[1]<12,'player throwing ratings have no effect');
}

// A non-force throw to an occupied base never retires the safe runner standing there.
{const g=game('SS','2',0);pgFieldStart(g);const f=g.field;
 for(let i=0;i<300&&!f.held;i++)pgFieldUpdate(g,.02,{auto:true});f.phase='held';f.throws=[];f.base=2;pgFieldThrow(g,1);while(!f.applied)pgFieldUpdate(g,.04);
 assert(!f.events.some(e=>e.from===2),'standing runner falsely tagged out');
}
// A missed fly becomes a live hit; catching the bounce later is never a fly out.
{const g=game('CF','1',0),f=g.field;pgFieldStart(g);f.t=f.landTime+.01;pgFieldLanding(f);const p=pgFieldPathAt(f.path,f.t);f.x=p[0];f.z=p[2];
 assert(pgFieldCatch(g));assert(!f.caughtAir);assert(!f.events.some(e=>e.catch));
 assert(f.runners.every(r=>r.to>r.from),'forced runners failed to advance on dropped fly');
}
// A low line drive caught before its first bounce is already an out.
{const g=game('SS','1',0);pgFieldStart(g);const f=g.field;
 f.path=[[0,0,.9,.6,false],[.2,0,.6,3,false],[.3,0,.037,5,true]];f.t=.15;f.x=0;f.z=2.4;
 assert(pgFieldCatch(g));assert(f.caughtAir);assert(f.events.some(e=>e.catch&&e.bat));
 assert(!pgFieldForce(f,f.runners.find(r=>r.from===1),f.t+.1));
}
// Tag-up routes must retouch the original base after the actual catch.
{const g=game('CF','3',0);pgFieldStart(g);for(let i=0;i<400&&!g.field.held;i++)pgFieldUpdate(g,.02,{auto:true});
 const f=g.field,r=f.runners.find(r=>r.from===3);assert(f.caughtAir);assert(r.retouchAt>=f.caughtAt);assert(!pgFieldForce(f,r,f.t));
 if(r.to===4)assert(r.legs.at(-1).start>=r.retouchAt);
}
// Legacy saved meter charges remain loadable and automatic completion applies once.
{const g=game('RF','3',1);pgFieldStart(g);for(let i=0;i<400&&!g.field.held;i++)pgFieldUpdate(g,.02,{auto:true});
 const f=g.field;f.phase='charging';f.chargeAt=f.t;f.throws=[];save();const at=f.t;S=null;load();
 assert(S?.play?.field);assert.equal(S.play.field.t,at);pgFieldQuick(S.play);assert(S.play.field.applied);
 const final=JSON.stringify(S);pgFieldFinish(S.play);assert.equal(JSON.stringify(S),final);
}
// A third force out cancels any runner crossing home earlier during this play.
{const g=game('SS','123',2);pgFieldStart(g);const f=g.field;
 f.events=[{kind:'out',t:3,from:1,base:2,force:true}];f.runners.find(r=>r.from===1).out=true;
 const r=f.runners.find(r=>r.from===3);r.to=4;r.legs=[{from:3,to:4,start:0,end:1,mode:'cruise'}];
 pgFieldFinish(g);assert.equal(g.op,f.before.op,'third force incorrectly counted a run');
}
// Incomplete field snapshots cannot replace an otherwise valid career.
{game('SS');const current=S;
 for(const patch of [{target:null},{before:{}},{path:[[0,0,null,1]]}]){
  const bad=JSON.parse(JSON.stringify(S));Object.assign(bad.play.field,patch);
  assert.equal(acceptSave(bad),false);assert.equal(S,current);
 }
}
console.log({plays,airCatches:air,doublePlays:dp,goodThrowOuts:good,wildThrowOuts:bad,movement:'passed',tagups:'passed',droppedFly:'passed',saveRecovery:'passed'});
`,{console,Math:math,assert,setSeed:n=>seed=n,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
