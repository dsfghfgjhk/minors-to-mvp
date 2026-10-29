const fs=require('fs'),vm=require('vm');const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);newCareer();S.stats.spd=99;
const read={from:1,to:1,start:.18,speed:6.6};
bbRunnerFlyRead(read,{la:40,fly:{x:0,z:100,t:6}},{catchAt:6},.3);
if(!read.readCatch||bbRunnerProgress(read,5.9)<=1||read.retouchAt!=null)throw Error('runner prematurely parks on original base before catch');
const caught=bbPlan({mode:'bat',pa:{on:'1',out:0}},{k:'FO',ev:145,la:40,sp:0,fielder:'CF',tf:6,at:[0,100],fly:{x:0,z:100,dist:100,t:6}});
const batter=caught.runners.find(r=>r.bat),lead=caught.runners.find(r=>r.from===1);
if(batter.to>=1||lead.retouchAt<6||Math.abs(bbRunnerProgress(lead,lead.retouchAt)-1)>.001)throw Error('caught fly causes base crowding or illegal retouch');
let following=0;
for(const ev of [140,160,180,190])for(const la of [30,45,60])for(const sp of [-40,-25,0,25,40]){
 const bb=bbResolve(ev,la,sp,99);if(!['1B','2B','3B'].includes(bb.k))continue;
 const p=bbPlan({mode:'bat',pa:{on:'1',out:0}},bb),b=p.runners.find(r=>r.bat);
 if(b.decision==='follow'){
  following++;if(b.speed>6.6||bbRunnerProgress(b,bb.fly.t+.17)>=1)throw Error('batter overtakes waiting runner');
 }
}
// A catchable-looking ball is dropped: the trailing batter must still wait for the lead runner.
{const bb={k:'1B',ev:145,la:40,sp:0,fielder:'CF',fly:{x:0,z:100,dist:100,t:6}};
 const p=bbPlan({mode:'bat',pa:{on:'1',out:0}},bb),b=p.runners.find(r=>r.bat);
 if(b.decision!=='follow'||b.speed>6.6||bbRunnerProgress(b,6.17)>=1)throw Error('batter passes lead runner on dropped fly');following++;
}
if(!following)throw Error('waiting for uncertain lead runner never exercised');
const run={from:0,to:1,start:.24,speed:6.5,bat:true},end=bbRunArrival(run),base=p3BasePt(1),point=bbRunnerRenderPoint(run,end+.5,{});
if(point[0]<=base[0]||point[1]<=base[1]||run.to!==1)throw Error('safe first-base run-through changes base adjudication');
const r={from:1,to:2,start:.18,speed:6.6,bat:false},arrival=bbRunArrival(r);
if(bbSlideNeeded({throws:[]},r))throw Error('automatic sliding on safe arrival');
if(!bbSlideNeeded({throws:[{base:2,t0:arrival-.5,dur:.6}]},r))throw Error('contested base does not allow sliding');
for(let i=0;i<64;i++){
 const pose=runPose(i*Math.PI/32,1);
 for(const foot of [pose.footL,pose.footR])if(foot[1]<.049||!foot.every(Number.isFinite))throw Error('invalid gait foot target');
 if(pose.hips[1]*pose.chest[1]>0)throw Error('torso does not counter-rotate');
 const k=i/63,position=p3MoveFraction(k);if(position<0||position>1||i&&position<p3MoveFraction((i-1)/63))throw Error('fielding movement reverses');
}
console.log({following,firstBaseRunThrough:'passed',legalRetouch:'passed',selectiveSliding:'passed',gait:'passed'});
`,{Math,console});
