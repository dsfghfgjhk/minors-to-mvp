const fs=require('fs'),vm=require('vm');let seed=891;
const math=Object.create(Math);math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(src+`;
const pitch={type:'직구',vk:140,u:0,v:0,inZ:true},stats={pow:65,con:65};
for(const left of [false,true]){
 resetSeed();const early=bbBatContact(pitch,-60,.5,stats,left);
 resetSeed();const late=bbBatContact(pitch,60,.5,stats,left);
 if(left?early.sp<=0||late.sp>=0:early.sp>=0||late.sp<=0)throw Error('early pull / late opposite field direction');
 if(early.la<=late.la)throw Error('timing does not change launch plane');
}
resetSeed();const short=bbBatContact(pitch,0,0,stats,false);resetSeed();const full=bbBatContact(pitch,0,1,stats,false);
if(short.ev>=full.ev||short.ev>145)throw Error('low-power contact still has full-swing exit velocity');
const results=[];let total=0;
for(const pow of [45,65,95])for(const P of [0,.5,1]){
 let fair=0,hr=0,ground=0,line=0,fly=0,ev=0;
 for(let i=0;i<1500;i++){
  const contact=bbBatContact({...pitch,v:rnd(-1.3,1.3)},rnd(-90,90),P,{pow,con:65},false);total++;
  if(!Object.values(contact.velocity).every(Number.isFinite)||contact.ev>210||contact.ev<0)throw Error('invalid impact velocity');
  const speed=Math.hypot(...contact.velocity)*3.6;if(Math.abs(speed-contact.ev)>.001)throw Error('speed differs from outgoing velocity');
  if(Math.abs(contact.sp)>45)continue;fair++;ev+=contact.ev;
  contact.la<8?ground++:contact.la<25?line++:fly++;
  if(bbFly(contact.ev,contact.la,contact.sp,false,contact.height).hr)hr++;
 }
 if(!ground||!line||!fly)throw Error('contact always produces same batted-ball type');
 if(P===0&&hr/fair>.08)throw Error('weak swing still has excessive homeruns');
 results.push({pow,P,fair,hr,ground,line,fly,meanEV:+(ev/fair).toFixed(1)});
}
// Pitch-path velocity is used in the same coordinates as fielding; contact height propagates to flight.
const c={...pitch,type:'커브',vk:115};p3BuildPitch(c);const contact=bbBatContact(c,-15,.5,stats,false);
const flight=bbFly(contact.ev,contact.la,contact.sp,true,contact.height);
if(Math.abs(flight.path[0][2]-contact.height)>.0001)throw Error('contact height ignored');
console.log({total,results});
`,{Math:math,console,resetSeed:()=>seed=891});
