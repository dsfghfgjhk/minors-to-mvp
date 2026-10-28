const fs=require('fs'),vm=require('vm');const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(src+`;
// Formerly retired the batter after the ball entered the first row near the foul pole.
const former=bbResolve(180,60,45.01,50);if(former.k!=='F'||former.fly.hr)throw Error('foul in stands becomes out or homerun');
for(const angle of [-170,-120,-90,-60,-46,0,46,60,90,120,170]){
 const a=angle*Math.PI/180,b=Math.abs(angle)<=45?fenceR(angle):bowlR(angle),point=r=>[Math.sin(a)*r,Math.cos(a)*r];
 const inside=point(b-1),outside=point(b+1);
 if(!bbInsidePlayingArea(...inside)||bbInsidePlayingArea(...outside))throw Error('stadium boundary differs from geometry');
 const excursion={path:[[.1,0,1,.6],[1,outside[0],4,outside[1]],[20,0,1,-1]]};
 if(bbFoulCatch(excursion))throw Error('out-of-play ball becomes catch after re-entry');
}
let checked=0,caught=0;
for(const ev of [130,140,150,160,170,180,190])for(const la of [20,25,30,35,40,45,50,60])for(const sp of [45.01,45.2,45.5,46,47,48,49,-45.01,-45.5,-46,-47]){
 checked++;const b=bbResolve(ev,la,sp,50);if(!b.foulOut)continue;caught++;
 if(!bbInsidePlayingArea(...b.at,.65))throw Error('foul caught beyond stadium boundary');
 for(const pt of b.fly.path){if(pt[0]>b.tf)break;if(!bbInsidePlayingArea(pt[1],pt[3]))throw Error('catch after entering stands')}
}
if(bbResolve(190,30,0,50).k!=='HR')throw Error('fair homerun lost');
console.log({checked,caught,stands:'passed',reentry:'passed',fairHomerun:'passed'});
`,{Math,console});
