const fs=require('fs'),vm=require('vm');let seed=471;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);const src=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();S.stats.con=60;S.stats.pow=60;S.stats.spd=50;
pgApply=(g,k)=>({k:g.lastBB?(bbPlan(g,g.lastBB)?.k||k):k});
const outcomes=[];for(const p of [0,.5,1]){let miss=0,out=0,xbh=0,hit=0,foul=0,ev=0,fair=0;resetSeed();for(let i=0;i<4000;i++){const g={L:55,mode:'bat',pa:{on:'',out:0},cur:{type:pick(['직구','커브','슬라이더']),u:rnd(-1,1),v:rnd(-1,1),inZ:true}};const dt=rnd(-190,190);let k=pgResolveBat(g,dt,null,p).k;if(k==='SW')miss++;if(['GO','FO','LO'].includes(k))out++;if(['2B','3B','HR'].includes(k))xbh++;if(['1B','2B','3B','HR'].includes(k))hit++;if(k==='F')foul++;if(g.lastBB){ev+=g.lastBB.ev;fair++}}outcomes.push({p,miss:miss/4000,fairOut:out/(out+hit),xbh:xbh/4000,hit:hit/4000})}

const [short,normal,full]=outcomes;
if(!(short.miss<normal.miss&&normal.miss<full.miss))throw Error('power does not trade contact for misses');
if(full.fairOut<=short.fairOut||full.xbh<=short.xbh||short.hit<=full.hit)throw Error('missing contact/power tradeoff');
if(full.miss-short.miss>.12||full.fairOut-short.fairOut>.12||full.xbh-short.xbh>.12)throw Error('power extremes too far apart');
if(VIEW3.bat.pos[1]>=1.2||Math.abs(VIEW3.bat.look[1]-VIEW3.bat.pos[1])>.15)throw Error('batting view too high or tilted down');
console.log(outcomes);
`,{Math:math,console,resetSeed:()=>seed=471});
