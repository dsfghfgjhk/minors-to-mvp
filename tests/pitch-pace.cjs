const fs=require('fs'),vm=require('vm');const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
let seed=161;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
vm.runInNewContext(src+`;
let behind=0,foul=0;for(let i=0;i<12000;i++){
 const c=bbBatContact({vk:140,u:0,v:rnd(-1,1),inZ:true},rnd(-140,140),rnd(0,1),{con:65,pow:65},false);
 if(Math.abs(c.sp)>90)behind++;if(Math.abs(c.sp)>45)foul++;
}
if(behind/12000>.04||foul/12000>.35||!behind||!foul)throw Error('foul direction distribution outside playable range');
const c={ms:400,vk:140};if(pgDisplayPitchMs({mode:'bat'},c)!==580||pgDisplayPitchMs({mode:'pit'},c)!==400||c.ms!==400)throw Error('display scaling changes physics');
let received=null,calls=0;p3Release=c=>{c.ms=400};pgResolveBat=(g,dt)=>{received=dt;return{k:'CS'}};p3Post=()=>calls++;P3.bb=null;PG.rv=null;
for(const target of [-60,0,60]){
 const g={mode:'bat',st:'pitching',cur:{ms:400},pa:{on:''}};
 PG.an={k:'wind',t0:0,dur:950};PG.sw=null;pgStep(g,950);
 if(PG.an.dur!==580||PG.an.timeScale!==1.45)throw Error('live release not slowed');
 const end=PG.an.t0+PG.an.dur;PG.sw=end+target*1.45;const finish=Math.max(PG.sw,end),before=calls;
 pgStep(g,finish-1);if(calls!==before)throw Error('pitch resolves before visual contact');
 pgStep(g,finish+.001);if(calls!==before+1||Math.abs(received-target)>.00001)throw Error('input timing does not match slow flight');
}
console.log({pitches:'45% longer flight for batting',behind,foul,total:12000,timing:'passed',pitcherSpeed:'unchanged'});
`,{Math:math,console});
