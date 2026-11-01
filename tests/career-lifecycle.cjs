// Deterministic full careers across every position, league and contract route.
const fs=require('fs'),vm=require('vm');let seed=20261101;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const source=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
const store=new Map();vm.runInNewContext(source+`;
let seasons=0,careers=0,frames=0;const orgs=new Set(),kinds=new Set();
function check(){if(!S||!SUBPOS[S.pos])throw Error('invalid state');for(const k of ['age','year','earn','sal','maxOvr','mvp'])if(!Number.isFinite(S[k]))throw Error('nonfinite '+k);for(const v of Object.values(S.stats))if(!Number.isFinite(v))throw Error('invalid stats');if(S.hist.length){const l=S.hist.at(-1).line;for(const [k,v]of Object.entries(l))if(typeof v==='number'&&!Number.isFinite(v))throw Error('invalid line '+k);if(l.t==='B'&&(l.H>l.AB||l.HR>l.H||l.AB>l.PA))throw Error('invalid batting line');}fixState();save();const before=JSON.stringify(S);S=null;load();if(JSON.stringify(S)!==before)throw Error('save mismatch');}
for(const pos of POSORDER)for(let run=0;run<10;run++){
 C.pos=pos;C.name='검증';C.cands=makeCands(pos);C.focus=keysOf(pos).slice(0,2);newCareer();
 for(let year=0;year<36&&S.phase!=='retired';year++){
  if(S.phase==='summary')S.phase=nextAfter('summary');
  if(S.phase==='award'){renderAward();S.last.awSeen=true;S.phase=nextAfter('award');frames++;}
  if(S.phase==='nat'){renderNatRes();S.natRes=null;S.phase=nextAfter('nat');frames++;}
  if(S.phase==='world'){renderWorld();S.last.world.seen=true;S.phase=nextAfter('world');frames++;}
  if(S.phase!=='app')throw Error('stuck '+S.phase);
  if(S.off&&!S.off.decided){let offers=S.off.offers.filter(o=>o.kind!=='retire'||year>=30);if(!offers.length)offers=S.off.offers;const o=pick(offers);kinds.add(o.kind);applyOffer(o);}
  if(S.phase==='retired')break;
  if(S.tp&&!S.tp.done){chooseTP(ri(0,tpDef(S.tp.id).opts().length-1));ui.sheet=null;}
  if(S.nat&&S.nat.joined==null)S.nat.joined=R()<.75;
  check();orgs.add(S.org);for(const tab of ['home','season','player','news','record']){ui.tab=tab;renderApp();frames++;}
  startSeason();check();renderProgress();finishSeason();seasons++;check();renderSummary();
 }
 if(S.phase!=='retired')retire();renderRetired();check();careers++;
}
console.log({careers,seasons,renderChecks:frames,orgs:[...orgs],offerKinds:[...kinds]});
`,{Math:math,console,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout,clearTimeout,Date});
