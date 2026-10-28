// NODE_PATH=/path/to/node_modules node tools/render_opening_cinematic.cjs
// Serve the repository locally first; frames are written to OPENING_FRAMES.
const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const out=process.env.OPENING_FRAMES||'/tmp/opening-cinematic';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();await page.route('https://**/*',r=>r.abort());await page.goto(process.env.OPENING_URL||'http://127.0.0.1:8807/index.html');
 await page.addScriptTag({path:process.env.THREE_LOCAL||'/tmp/mvp-browser/three.min.js'});
 await page.evaluate(()=>{
 LAUNCH.screen=null;const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(960,540);r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
 P3.r=r;P3.sc=new THREE.Scene();const sc=P3.sc;sc.background=new THREE.Color(0x030b16);sc.fog=new THREE.FogExp2(0x071320,.008);sc.add(new THREE.HemisphereLight(0x93b9ef,0x15201a,.45));
 const key=new THREE.DirectionalLight(0xffdfae,2.4);key.position.set(-8,14,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-9,right:9,top:30,bottom:-8,near:.5,far:60});key.shadow.bias=-.0003;key.shadow.normalBias=.015;sc.add(key);
 const rim=new THREE.DirectionalLight(0x66aaff,2.2);rim.position.set(12,9,-12);sc.add(rim);
 const side=new THREE.DirectionalLight(0x8bbfff,.7);side.position.set(-20,15,35);sc.add(side);
 const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.86});
 const grass=new THREE.MeshStandardMaterial({color:0x39523c,map:grassTex(),roughness:.94});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(350,350),grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.position.z=40;sc.add(ground);
 const dirt=new THREE.MeshStandardMaterial({color:0x87634b,map:dirtTex(),roughness:.92});
 const disc=(x,z,size)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(size,64),dirt);m.rotation.x=-Math.PI/2;m.position.set(x,.015,z);m.receiveShadow=true;sc.add(m)};
 disc(0,0,4.3);disc(0,18.44,2.9);
 const chalk=mat(0xc8cec4);for(const [x,z]of [[19.4,19.4],[0,38.8],[-19.4,19.4]]){disc(x,z,1.6);const b=new THREE.Mesh(new THREE.BoxGeometry(.38,.08,.38),chalk);b.position.set(x,.06,z);sc.add(b)}
 const home=new THREE.Mesh(new THREE.CircleGeometry(.22,5),chalk);home.rotation.x=-Math.PI/2;home.position.y=.03;sc.add(home);
 for(const sign of [-1,1]){const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,.025,0),new THREE.Vector3(sign*85,.025,85)]);sc.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xabb9aa})));}
 for(let tier=0;tier<5;tier++){const g=new THREE.TorusGeometry(111+tier*4,1.7,4,128);const ring=new THREE.Mesh(g,mat(tier%2?0x142131:0x1a2937));ring.rotation.x=Math.PI/2;ring.position.set(0,8+tier*3,35);sc.add(ring)}
 const glow=new THREE.MeshBasicMaterial({color:0xcde6ff});
 for(const [x,z]of [[-68,-24],[68,-24],[-92,100],[92,100]]){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,36,8),mat(0x25333e));pole.position.set(x,18,z);sc.add(pole);
  for(let a=0;a<5;a++)for(let b=0;b<2;b++){const m=new THREE.Mesh(new THREE.BoxGeometry(.8,.6,.15),glow);m.position.set(x+(a-2)*1.15,35+b*.9,z);m.lookAt(0,8,30);sc.add(m)}
 }
 // Distant stadium lights stay subdued behind the players.
 const stars=new THREE.BufferGeometry(),positions=[];for(let i=0;i<280;i++){const a=i*2.39996;positions.push(Math.cos(a)*(110+i%17),8+i%15,35+Math.sin(a)*(110+i%17))}stars.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));sc.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0x90b9dc,size:.17,transparent:true,opacity:.5})));
 p3BuildActors();const A=P3.A;for(const f of Object.values(A.f))f.visible=false;A.catcher.visible=false;A.ump.visible=false;A.mitt.visible=false;A.ret.visible=false;A.tgt.visible=false;
 A.batter.position.set(.95,0,.15);A.batter.rotation.y=-Math.PI/2;A.pitcher.rotation.y=Math.PI;
 for(const [actor,color]of [[A.batter,0x142d55],[A.pitcher,0x632e29]]){const m=actor.userData.mats;for(const k of ['cap','trim','under'])if(m[k])m[k].color.setHex(color);actor.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}})}
 P3.cam=new THREE.PerspectiveCamera(39,16/9,.02,400);P3.dt=1/24;P3.resetting=true;
 p3PitchPose(A.pitcher,.72);A.pitcher.updateMatrixWorld(true);window.cinemaRelease=A.pitcher.userData.AR.hd.getWorldPosition(new THREE.Vector3());
 window.cinemaCanvas=document.createElement('canvas');cinemaCanvas.width=960;cinemaCanvas.height=540;
 });
 for(let i=0;i<288;i++){
 const data=await page.evaluate(i=>{
 const t=i/24,A=P3.A,c=P3.cam;P3.clock=t*1000;P3.dt=1/24;
 let pitch=t<2?0:t<4?(t-2)/2*.62:t<4.7?.62+(t-4)/.7*.1:Math.min(1.4,.72+(t-4.7)*.5);
 let swing=t<5.3?0:t<6.3?(t-5.3)*.42:Math.min(1,.42+(t-6.3)*.55);
 p3PitchPose(A.pitcher,pitch);p3SwingPose(A.batter,swing);
 A.ball.visible=true;A.ball.scale.setScalar(1.2);const release=window.cinemaRelease,contact=new THREE.Vector3(0,.99,.14);
 if(t<4.7){A.pitcher.updateMatrixWorld(true);A.pitcher.userData.AR.hd.getWorldPosition(A.ball.position)}
 else if(t<6.3){const u=(t-4.7)/1.6;A.ball.position.lerpVectors(release,contact,u)}
 else{const u=(t-6.3)/3.5;A.ball.position.set(-23*u,1+76*u-34*u*u,105*u)}
 if(t<2){const u=t/2;c.position.set(3.1-u*.5,1.1+u*.25,-1.8+u*.25);c.lookAt(.9,1.18,.2)}
 else if(t<4){const u=(t-2)/2;c.position.set(-2.1+u*.9,1.3+u*.55,20.8-u*.9);c.lookAt(0,1.22,18.44)}
 else if(t<4.7){const u=(t-4)/.7;c.position.set(-1.8+u*.6,1.65,17.5);c.lookAt(A.ball.position)}
 else if(t<5.3){const u=(t-4.7)/.6;c.position.set(A.ball.position.x+1.1,1.6,A.ball.position.z-2.6);c.lookAt(A.ball.position)}
 else if(t<7.4){const u=(t-5.3)/2.1;c.position.set(-2.2+u*.7,1.2+u*.45,-2.6);c.lookAt(.5,1,0)}
 else if(t<9.8){const u=(t-7.4)/2.4;c.position.copy(A.ball.position).add(new THREE.Vector3(2,1.2,-5));c.lookAt(A.ball.position)}
 else{const u=(t-9.8)/2.2;c.position.set(-30+u*14,28+u*12,-36+u*10);c.lookAt(0,0,34)}
 P3.r.render(P3.sc,c);
 const ctx=cinemaCanvas.getContext('2d');ctx.drawImage(P3.r.domElement,0,0);
 const vignette=ctx.createRadialGradient(480,270,120,480,270,550);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vignette;ctx.fillRect(0,0,960,540);
 // Gentle contact flare, no strobing.
 if(t>6.27&&t<6.48){ctx.fillStyle=`rgba(255,231,180,${.22*(1-(t-6.27)/.21)})`;ctx.fillRect(0,0,960,540)}
 ctx.fillStyle='#03070c';ctx.fillRect(0,0,960,44);ctx.fillRect(0,496,960,44);
 if(t<2){ctx.fillStyle='#d4b879';ctx.font='600 12px sans-serif';ctx.fillText('EVERY LEGEND STARTS ON THE BENCH.',45,466)}
 if(t>=9.8){const a=Math.min(1,(t-9.8)*2);ctx.fillStyle=`rgba(2,7,14,${a*.5})`;ctx.fillRect(0,44,960,452);ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='800 52px sans-serif';ctx.fillStyle='#f4eee1';ctx.fillText('2군에서',480,233);ctx.font='800 78px sans-serif';ctx.fillStyle='#e7c27c';ctx.fillText('MVP까지',480,321);ctx.font='500 13px sans-serif';ctx.fillStyle='#cdd5df';ctx.fillText('YOUR NAME. YOUR LEGACY.',480,365);ctx.textAlign='left';ctx.globalAlpha=1}
 return cinemaCanvas.toDataURL('image/png').split(',')[1];
 },i);
 fs.writeFileSync(`${out}/${String(i).padStart(4,'0')}.png`,Buffer.from(data,'base64'));if(i%48===0)console.log('Rendered',i,'/288');
 }
 await browser.close();
})();
