const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..'),asset=path.join(root,'assets/player');
const meshes=JSON.parse(fs.readFileSync(path.join(asset,'player-meshes.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const embedded=html.split('/* BLENDER_PLAYER_DATA_BEGIN */')[1].split('/* BLENDER_PLAYER_DATA_END */')[0].trim();
assert.deepStrictEqual(JSON.parse(embedded.slice('const BLENDER_PLAYER='.length,-1)),meshes,'game data differs from Blender export');
assert(meshes.pantsSkin?.si&&meshes.pantsSkin.sw,'continuous rigged trousers missing');
const pants=meshes.pantsSkin;assert(pants.si.length===pants.p.length/3*4&&pants.sw.length===pants.si.length,'trouser weights mismatch');
for(let i=0;i<pants.sw.length;i+=4){assert(Math.abs(pants.sw.slice(i,i+4).reduce((a,b)=>a+b,0)-1)<.00001,'unbalanced skin weights');assert(pants.si.slice(i,i+4).every(n=>n>=0&&n<5),'invalid trouser bone')}
for(let i=0;i<pants.p.length;i+=3){const x=pants.p[i],y=pants.p[i+1];if(y>.6&&y<.78)assert(Math.abs(x)>.006,'inner thighs fused below the crotch')}
let triangles=0;for(const [name,m] of Object.entries(meshes)){
 assert(m.p.length===m.n.length&&m.p.length%3===0,name+' vertex buffers');
 assert(m.p.every(Number.isFinite)&&m.n.every(Number.isFinite),name+' finite vertices');
 assert(m.i.length%3===0&&m.i.every(i=>Number.isInteger(i)&&i>=0&&i<m.p.length/3),name+' indices');triangles+=m.i.length/3;
}
const glb=fs.readFileSync(path.join(asset,'baseball-player.glb'));assert(glb.readUInt32LE(0)===0x46546c67&&glb.readUInt32LE(8)===glb.length,'GLB header');
const data=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString());assert(data.skins.length>0&&data.meshes.length>=20,'export must contain a rigged player');
assert(fs.readFileSync(path.join(asset,'baseball-player.blend')).subarray(0,7).toString()==='BLENDER','editable Blender source missing');
console.log(Object.keys(meshes).length+' Blender meshes, '+triangles+' triangles: embedded data, indices and rigged GLB passed');
