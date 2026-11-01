const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(src+`;
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),unit=a=>a.map(v=>v/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function project(point,shot,aspect){const f=unit(sub(shot.look,shot.pos)),r=unit(cross(f,[0,1,0])),u=cross(r,f),d=sub(point,shot.pos),z=dot(d,f),vfov=Math.max(shot.v,2*Math.atan(Math.tan(shot.h*Math.PI/360)/aspect)*180/Math.PI),scale=z*Math.tan(vfov*Math.PI/360);return[dot(d,r)/(scale*aspect),dot(d,u)/scale,z]}
let shots=0;
for(const key of ['C','1B','2B','3B','SS','LF','CF','RF'])for(const base of [1,2,3,4])for(const aspect of [16/9,390/844,320/640,844/390])for(const k of [0,.3,.7,1]){
 const [x,z]=FPOS[key],target=BASEP[base%4],tr={base,from:[x,1.15,z],to:[target[0]+1.8,1.15,target[1]],t0:1,dur:2};
 const F={key,x,z,t:1+k*2,phase:'throw',throws:[tr],runners:[]},ball={x:-(x+(tr.to[0]-x)*k),y:1.15+3*k*(1-k),z:z+(tr.to[2]-z)*k};
 const before=JSON.stringify(F),shot=p3FieldCameraShot(F,ball,aspect);assert.equal(JSON.stringify(F),before,'camera changed simulation');assert.equal(shot.mode,'throw');assert.equal(shot.base,base);
 assert.equal(shot.pos[0],-F.x);assert.equal(shot.pos[1],4.6);assert.equal(shot.pos[2],F.z+8.5*(key==='C'?-1:1));assert.equal(shot.look[0],-target[0]);assert.equal(shot.look[2],target[1]);
 shots++;
}
const F={key:'SS',x:-12,z:30,t:0,throws:[],runners:[]},ball={x:12,y:1,z:30};
const before=p3FieldCameraShot(F,ball,1);assert.equal(before.mode,'player');assert.equal(before.pos[2],38.5);
F.throws.push({base:2,from:[-12,1,30],to:[0,1,38.75],t0:1,dur:1});
F.t=1.5;assert.equal(p3FieldCameraShot(F,ball,1).base,2);F.throws.push({base:1,from:[0,1,38.75],to:[19.37,1,19.37],t0:2.38,dur:1});F.t=2;assert.equal(p3FieldCameraShot(F,ball,1).base,2);F.t=2.4;assert.equal(p3FieldCameraShot(F,ball,1).base,1,'camera did not follow the relay');
F.phase='result';F.t=4;assert.equal(p3FieldCameraShot(F,ball,1).base,1,'camera returned before the out/safe result');
console.log({framingCases:shots,portraitAndLandscape:true,trackingBeforeThrow:true,relay:true,resultHold:true,simulationUnchanged:true});
`,{console,Math,assert});
