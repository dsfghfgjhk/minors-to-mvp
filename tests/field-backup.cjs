const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('const HAS_DOM='))[1];
let seed=14;const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
vm.runInNewContext(src+`;
let plays=0;
for(const pos of ['C','1B','2B','3B','SS','LF','CF','RF']){
 C.pos=pos;C.cands=makeCands(pos);C.focus=[];newCareer();startSeason();const g=newPlay({kind:'reg',opp:'상대',oppFull:tnames('HS')[1]});pgSetField(g,3);g.pa.on='1';g.pa.out=0;g.field=pgFieldMake(g);S.play=g;S.phase='play';pgFieldStart(g);const f=g.field;f.x=90;f.z=0;
 let previous=null,restored=false;
 for(let n=0;n<2400&&g.st==='fielding';n++){
  pgFieldUpdate(g,.02);
  if(f.backup){assert.notEqual(f.backup.key,f.key);assert(!Object.values(f.cover).includes(f.backup.key),'backup abandoned a covered base');if(previous)assert(Math.hypot(f.backup.x-previous[0],f.backup.z-previous[1])<=.131,'backup teleported');previous=[f.backup.x,f.backup.z];
   if(!restored){save();assert(validSave(JSON.parse(JSON.stringify(S))));restored=true}
  }
 }
 assert(f.carrier,'no teammate recovered missed ball '+pos);assert(f.throws.length>0,'backup never threw '+pos);assert.equal(f.throws[0].by,f.carrier);assert(f.applied,'play never completed');assert.equal(g.fs.assists,0,'teammate out credited to player');assert.equal(g.fs.putouts,0);plays++;
}
// A ball just beyond the middle infield used to select the pitcher by distance.
for(const point of [[0,38],[-50,65],[50,65],[0,100]]){
 C.pos='SS';C.cands=makeCands(C.pos);C.focus=[];newCareer();startSeason();const g=newPlay({kind:'reg',opp:'상대',oppFull:tnames('HS')[1]});pgSetField(g,3);g.st='fielding';const f=g.field;f.t=2;f.catchTime=1;f.x=0;f.z=15;f.path=[[0,point[0],.04,point[1]],[10,point[0],.04,point[1]]];S.play=g;pgFieldBackup(g,.02);assert(f.backup);assert(OFK.includes(f.backup.key),'outfield ball assigned to '+f.backup.key);assert.notEqual(f.backup.key,'P');
}
console.log({missedBallRecoveries:plays,baseCoverPreserved:true,noTeleport:true,automaticThrows:true,completedPlays:true,playerStatsPreserved:true});
`,{console,Math:math,assert,localStorage:{getItem:()=>null,setItem:()=>{}}});
