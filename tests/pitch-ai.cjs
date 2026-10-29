const vm=require('vm'),fs=require('fs'),assert=require('assert');let seed=42;const math=Object.create(Math);math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};const ctx=vm.createContext({console,Math:math});const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const js=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInContext(js,ctx);
vm.runInContext(`
C.pos='SP';C.cands=makeCands('SP');newCareer();
var game=newPlay({kind:'reg',label:'test',oppFull:tnames('HS')[1],opp:tnames('HS')[1]});game.bi=0;game.pa={s:0,b:0,on:'',out:0};game.lu[0].c=.8;game.lu[0].e=.85;
pgApply=(g,k)=>({k});
var sample=pgAISample,maxFuture=0,currentTime=0;
pgAISample=(c,t)=>{if(t>currentTime+.0001)maxFuture=Math.max(maxFuture,t-currentTime);return sample(c,t)};
function trial(type,u=0,v=0,vk=130){
 game.cur={type,u,v,vk,lh:false,inZ:Math.max(Math.abs(u),Math.abs(v))<=1.62,release:[.4,1.85,17.1],kw:1};p3BuildPitch(game.cur);pgAIStart(game,1000);
 var pitch=game.cur;
 for(let t=0;t<pitch.ms+220;t+=1000/60){currentTime=t/1000;pgAITrack(game,1000+t,false);}
 currentTime=pitch.ms/1000;var r=pgResolvePit(game);return {k:r.k,swing:pitch.read.decision,error:pitch.read.aim?Math.hypot((pitch.read.aim.u-u)*ZW,(pitch.read.aim.v-v)*ZH):null,dt:pitch.read.contactAt-(1000+pitch.ms),memory:game.batterMemory[0].length};
}
var first=[],last=[];game.batterMemory={};for(let i=0;i<60;i++){let r=trial('스플리터',0,.8,130);if(i<10)first.push(r.error);if(i>=50)last.push(r.error)};
if(last.reduce((a,b)=>a+b)>=first.reduce((a,b)=>a+b))throw Error('repeated pitch learning did not reduce prediction error');console.log('Repeated-pitch prediction improved');
var counts={};for(const type of Object.keys(PTY)){game.batterMemory={};let out={swing:0,miss:0,contact:0,take:0};for(let i=0;i<100;i++){let r=trial(type,0,0,145+PTY[type].dv);if(r.swing)out.swing++;else out.take++;if(r.k==='SW')out.miss++;else if(!['B','CS'].includes(r.k))out.contact++;}counts[type]=out}console.log(counts);console.log('future observations',maxFuture);
var ballSwings=0;for(let i=0;i<100;i++)if(trial('스위퍼',4,3,125).swing)ballSwings++;console.log('far ball chase',ballSwings);
if(ballSwings>=counts['직구'].swing)throw Error('AI does not distinguish strikes from distant balls');if(!Object.values(counts).every(c=>c.contact>0&&c.miss>0&&c.take>0))throw Error('missing reaction outcomes');if(maxFuture>1e-6)throw Error('future leakage');if(game.batterMemory[0].length>12)throw Error('unbounded memory');
// Mutating unseen trajectory cannot change a decision made before it.
function causal(){game.batterMemory={};game.cur={type:'커브',u:0,v:0,vk:115,inZ:true,lh:false,release:[.4,1.85,17.1],kw:1};p3BuildPitch(game.cur);pgAIStart(game,1000);let c=game.cur,initial=JSON.stringify(c.read);currentTime=.3;pgAITrack(game,1300,false);let a=JSON.stringify(c.read.prediction);c.read=JSON.parse(initial);for(const p of c.path)if(p[0]>.3){p[1]+=5;p[2]-=5}pgAITrack(game,1300,false);if(a!==JSON.stringify(c.read.prediction))throw Error('future changed prediction');}
causal();
let trajectories=0;for(const type of Object.keys(PTY))for(const lh of [false,true])for(const vk of [90,125,155]){const c={type,lh,vk,u:1,v:-1,kw:1};p3BuildPitch(c);let last=20;for(const p of c.path){if(!p.every(Number.isFinite)||p[3]>=last)throw Error('invalid flight');last=p[3]}if(Math.hypot(c.plate[1]+zx(c.u),c.plate[2]-zy(c.v))>.001)throw Error('endpoint mismatch');trajectories++}
console.log(trajectories+' trajectories; causal prediction and bounded learning passed');
// A live pitch must not resolve or mutate the count at release.
S.play=game;game.mode='pit';game.st='anim';game.cur={type:'포크',u:0,v:0,vk:125,inZ:true,lh:false};
PG.an={k:'wind',t0:1000,dur:760};PG.rv=null;let applied=0,posted=0;
p3Release=c=>p3BuildPitch(c);pgApply=(g,k)=>{applied++;return{k}};p3Post=()=>{posted++;PG.an=null};
pgStep(game,1760);if(applied||posted)throw Error('result resolved at release');
const duration=game.cur.ms;for(let t=1776;t<1760+duration+250;t+=16){if(PG.an)pgStep(game,t)}
if(applied!==1||posted!==1)throw Error('live pitch must resolve exactly once');
console.log('Live-pitch lifecycle passed');
`,ctx);

vm.runInContext(`
S.stats.con=60;S.stats.pow=60;S.stats.spd=50;game.L=50;game.mode='bat';
// Fair grounders are provisional hits until the live fielding timeline resolves them.
pgApply=(g,k)=>{const plan=g.lastBB?bbPlan(g,g.lastBB):null;return{k:plan?plan.k:k}};
function playerTrial(inZ,dt,aim){game.cur={type:'직구',u:0,v:inZ?0:2.8,inZ,lh:false};return pgResolveBat(game,dt,aim,.5).k}
const stats={zone:{miss:0,out:0,hit:0},ball:{miss:0,out:0,hit:0}};
for(let i=0;i<1500;i++)for(const zone of [true,false]){const result=playerTrial(zone,0,{u:999,v:999}),r=stats[zone?'zone':'ball'];
 if(result==='SW')r.miss++;else if(['GO','FO','LO'].includes(result))r.out++;else if(['1B','2B','3B','HR'].includes(result))r.hit++;
}
if(stats.zone.miss!==0)throw Error('click location still changes contact');
if(stats.ball.miss<stats.zone.miss+500)throw Error('missing ball chase penalty');
const ballOutRate=stats.ball.out/(stats.ball.out+stats.ball.hit),zoneOutRate=stats.zone.out/(stats.zone.out+stats.zone.hit);
if(ballOutRate<=zoneOutRate)throw Error('weak contact does not increase fair outs');
if(playerTrial(true,500,null)!=='SW'||playerTrial(false,null,null)!=='B'||playerTrial(true,null,null)!=='CS')throw Error('timing/take regression');
console.log('Timing-only contact and chase penalties passed',stats);
`,ctx);
vm.runInContext(`
performance={now:()=>2000,timeOrigin:0};document={getElementById:()=>null};P3.snd=false;
S.play=game;game.st='pitching';P3.bb=null;p3Pick=()=>{throw Error('batting still raycasts pointer position')};
for(const [x,y] of [[0,0],[900,600]]){PG.sw=null;PG.swAt=0;PG.an={k:'fly',t0:1500,dur:500};
 p3Down({preventDefault(){},isPrimary:true,button:0,clientX:x,clientY:y,timeStamp:2000});
 if(PG.sw!==2000||PG.aim!==null)throw Error('screen position changes timing-only input');
}
console.log('Anywhere-on-screen input and exact timing passed');
`,ctx);
