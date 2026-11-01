const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(process.env.BALANCE_HTML||require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
let seed=15971;const math=Object.create(Math);
math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();
// Use the same pitch paths, timings and impact noise for each ability and swing setting.
// These are controlled strike swings, not a claimed season batting average.
const samples=Array.from({length:1200},()=>{
 const type=pick(['직구','직구','투심','슬라이더','커브','체인지업']);
 const c={type,u:rnd(-1.35,1.35),v:rnd(-1.35,1.35),vk:140+PTY[type].dv,inZ:true};
 c.ms=pgFlightMs(c.vk);p3BuildPitch(c);
 return{c,dt:clamp(gauss()*85,-260,260)};
});
pgApply=(g,k)=>({k:g.lastBB?(bbPlan(g,g.lastBB)?.k||k):k});
const results=[];
for(const ability of [45,65,85,95])for(const power of ability===95?[1]:[0,.5,1]){
 S.stats.con=ability;S.stats.pow=ability;S.stats.spd=50;
 const row={ability,power,hit:0,miss:0,hr:0,xbh:0,foul:0,out:0};
 for(let i=0;i<samples.length;i++){
  setSeed(91000+i);const {c,dt}=samples[i],g={mode:'bat',L:55,pa:{on:'',out:0},cur:c};
  const k=pgResolveBat(g,dt,null,power).k;
  if(['1B','2B','3B','HR'].includes(k))row.hit++;
  if(['2B','3B','HR'].includes(k))row.xbh++;
  if(['GO','FO','LO'].includes(k))row.out++;
  if(k==='SW')row.miss++;if(k==='HR')row.hr++;if(k==='F')row.foul++;
 }
 for(const k of ['hit','miss','hr','xbh','foul','out'])row[k]/=samples.length;
 results.push(row);
}
const get=(ability,power)=>results.find(r=>r.ability===ability&&r.power===power);
const short=get(65,0),normal=get(65,.5),full=get(65,1);
assert(get(45,.5).hit>.22,'rookie normal swings remain too weak');
assert(short.hit>.27&&normal.hit>.25&&full.hit>.22,'ordinary hitters cannot produce enough hits');
assert(short.miss<normal.miss&&normal.miss<full.miss,'swing power must retain contact tradeoff');
assert(full.xbh>normal.xbh&&normal.xbh>short.xbh,'power must increase extra-base production');
assert(full.hr>.002&&full.hr<.07,'average hitters need occasional, limited full-swing home runs');
assert(get(85,.5).hit>get(45,.5).hit+.06,'better hitters lack a meaningful advantage');
assert(results.every(r=>r.power!==0||r.hr<.03),'short swings became automatic home runs');
assert(get(95,1).hr<.23&&get(95,1).hit<.6,'elite full swings are overpowering');
// AI batters must also punish strikes without removing misses or the delayed perception model.
C.pos='SP';C.cands=makeCands(C.pos);newCareer();
S.stats.vel=S.stats.ctl=S.stats.brk=65;setSeed(5811);
let hits=0,outs=0,misses=0,homeRuns=0;
for(let i=0;i<1800;i++){
 const g=newPlay({kind:'reg',label:'AI balance',oppFull:tnames('HS')[1],opp:tnames('HS')[1]});
 g.L=55;g.bi=i%9;g.pa={on:'',out:0};
 const type=pick(['직구','슬라이더','커브','투심']);
 g.cur={type,u:rnd(-1.35,1.35),v:rnd(-1.35,1.35),vk:140+PTY[type].dv,inZ:true};g.cur.ms=pgFlightMs(g.cur.vk);
 const k=pgResolvePit(g).k;
 if(['1B','2B','3B','HR'].includes(k))hits++;if(['GO','FO','LO'].includes(k))outs++;
 if(k==='SW')misses++;if(k==='HR')homeRuns++;
}
assert(hits/(hits+outs)>.30&&hits/(hits+outs)<.45,'AI contact production unbalanced');
assert(misses/1800>.15&&misses/1800<.35&&homeRuns/1800<.06,'AI misses or home runs unbalanced');
console.log({strikeSwings:samples.length*results.length,results:results.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,+v.toFixed(3)]))),ai:{pitches:1800,hits,outs,misses,homeRuns}});
`,{console,Math:math,assert,setSeed:n=>seed=n});
