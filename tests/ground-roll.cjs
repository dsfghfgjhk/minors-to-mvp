const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');const script=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(script+`;
const roll=bbSurfacePath([0,0,.037,50],[0,0,10]),last=roll.at(-1),distance=last[3]-50;
if(distance<25||distance>40||last[0]<5)throw Error('grass roll stops too quickly or never slows');
for(let i=1;i<roll.length;i++){if(roll[i][3]<roll[i-1][3]||roll[i][2]<.0369)throw Error('roll reversed or sank');}
const bounce=bbSurfacePath([0,0,.037,50],[0,-12,12]);let peak=0;for(const point of bounce)peak=Math.max(peak,point[2]);if(peak<.1||bounce.at(-1)[2]>.038)throw Error('bounce never settles');
C.pos='SS';C.cands=makeCands('SS');newCareer();const game={mode:'bat',pa:{on:'',out:0}};
let continued=0;
for(const ev of [90,120,150])for(const la of [10,20,35])for(const sp of [-25,0,25]){
 const flight=bbFly(ev,la,sp,true);if(flight.hr||flight.wall)continue;
 const bb={k:'1B',ev,la,sp,fly:flight,fielder:'CF'},plan=bbPlan(game,bb);
 const landing=plan.pts.find(p=>p[0]>=flight.tEnd-.001),pickup=plan.at;
 if(!landing||landing[2]>.038||plan.catchAt<flight.tEnd)throw Error('invalid landing/pickup order');
 if(Math.hypot(pickup[0]-flight.x,pickup[1]-flight.z)>.5)continued++;
 let previous=plan.pts[0];for(const point of plan.pts.slice(1)){if(point[0]<=previous[0]||!point.slice(0,4).every(Number.isFinite))throw Error('discontinuous time');previous=point;}
}
if(continued<5)throw Error('outfield balls freeze at landing');
console.log({grassRollMeters:+distance.toFixed(1),stopSeconds:+last[0].toFixed(1),continuedOutfieldPlays:continued});
`,{console,Math});
