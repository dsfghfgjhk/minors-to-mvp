const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(source+`;
function actor(){return{rotation:{y:0},position:{x:0,z:0},userData:{body:{rotation:{z:0}},o:{},ph:0}}}
function face(fps){const p=actor();P3.dt=1/fps;for(let i=0;i<fps;i++)p3Face(p,Math.PI/2);return p.rotation.y}
if(Math.abs(face(30)-face(60))>1e-9)throw Error('turn depends on frame rate');
const p=actor();P3.dt=1/60;p.rotation.y=Math.PI-.02;p3Face(p,-Math.PI+.02);if(p.rotation.y<Math.PI-.02)throw Error('turn takes long path around angle wrap');
let blend=0;p3Pose=(p,pose,k)=>{blend=k};
function run(fps){const p=actor();P3.dt=1/fps;p3Run(p,0,1);for(let i=1;i<=fps;i++){p.position.z=5*i/fps;p3Run(p,0,1)}return p}
const a=run(30),b=run(60);if(Math.abs(a.userData.runPhase-b.userData.runPhase)>1e-8)throw Error('stride depends on frame rate');
const phase=b.userData.runPhase;for(let i=0;i<10;i++)p3Run(b,999,1);if(b.userData.runPhase!==phase)throw Error('stationary runner pedals in place');
if(!(blend>0&&blend<1))throw Error('run transition snaps');p3Idle(b);if(b.userData.runLast!==null)throw Error('idle fails to reset movement tracking');
if(SWING_MS!==420||CONTACT_T!==.42)throw Error('contact timing changed');
console.log('Frame-rate independent turns, angle wrapping, distance-driven stride and transition blending passed');
`,{console,Math});
