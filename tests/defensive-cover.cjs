const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('application/ld+json')&&m[2].trim())[2];
vm.runInNewContext(source+`;
C.cands=makeCands(C.pos);newCareer();let toss=0,cover=0,backup=0;
for(const f of IFK)for(const at of [[18.5,20],[12,23],[5,34],[-10,32]]){
 const p=bbPlan({mode:'bat',pa:{on:'1',out:0}},{k:'1B',fielder:f,tf:1.2,at,ground:{path:[[0,0,1,0],[1.2,at[0],.037,at[1]]]}});
 for(const tr of p.throws){
  if(tr.toss){toss++;if(tr.carry||tr.speed!==10||tr.by===tr.receiver)throw Error('invalid toss');}
  const expected=Math.max(.12,Math.hypot(tr.to[0]-tr.from[0],tr.to[2]-tr.from[2])/tr.speed);
  if(Math.abs(expected-tr.dur)>.001)throw Error('throw flight mismatch');
 }
 const busy=new Set([p.fielder,...p.throws.flatMap(t=>[t.by,t.receiver])]);
 for(const task of p.support){if(busy.has(task.key)||!Number.isFinite(task.arrive))throw Error('conflicting cover assignment');busy.add(task.key);task.role==='backup'?backup++:cover++}
}
const first=(at)=>bbPlan({mode:'bat',pa:{on:'',out:1}},{k:'1B',fielder:'1B',tf:1,at,ground:{path:[[0,0,1,0],[1,at[0],.037,at[1]]]}});
if(!first([19,20]).throws.some(t=>t.carry&&t.by==='1B'))throw Error('near first baseman did not step on base');
if(!first([12,23]).throws.some(t=>t.by==='1B'&&t.receiver==='P'&&t.toss))throw Error('pitcher cover toss missing');
if(!toss||!cover||!backup)throw Error('coverage absent');
console.log({toss,cover,backup});
`,{console,Math});
