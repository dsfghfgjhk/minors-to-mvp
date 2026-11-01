const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
const data=new Map();
vm.runInNewContext(src+`;
C.cands=makeCands(C.pos);C.name='저장 검증 ⚾';C.num='0';newCareer();
assert.equal(S.num,0,'zero jersey number must survive character creation');
fixState();const expected=JSON.stringify(S),code=exportCode();
assert(code);assert(importCode(code));assert.equal(JSON.stringify(S),expected);
save();S=null;load();assert.equal(JSON.stringify(S),expected);
const encode=s=>btoa(unescape(encodeURIComponent(JSON.stringify(s))));
const invalid=[null,{}, {v:2,stats:{}}, {...S,pos:'invalid'}, {...S,stats:{}}, {...S,age:null}, {...S,focus:null}, {...S,hist:[null]}, {...S,tro:[null]}, {...S,off:{offers:null}}, {...S,phase:'summary',last:null}, {...S,phase:'nat',natRes:null}, {...S,prog:{ev:{},segs:[]}}, {...S,phase:'play',play:{v:2}}];
for(const bad of invalid){
 assert.equal(importCode(encode(bad)),false,'incomplete save accepted');
 assert.equal(JSON.stringify(S),expected,'failed import changed current career');
 localStorage.setItem(KEY,JSON.stringify(bad));load();
 assert.equal(JSON.stringify(S),expected,'damaged local save changed current career');
}
assert.equal(importCode('not a save code'),false);
// Old progress data and unsupported direct-play versions still use existing recovery paths.
assert(importCode(encode({...S,phase:'progress',prog:{v:1}})));assert.equal(S.phase,'app');assert.equal(S.prog,null);
assert(importCode(encode({...S,phase:'progress',prog:null})));assert.equal(S.phase,'app');
assert(importCode(encode({...S,phase:'play',play:{v:1},prog:null})));assert.equal(S.phase,'app');
assert(importCode(code));startSeason();const event=S.prog.ev.find(e=>e.t==='big');
S.play=newPlay(event);S.phase='play';S.play.v=1;
assert(importCode(exportCode()));assert.equal(S.phase,'progress');assert.equal(S.play,null);
// A saved live result must commit once even when the user reloads and switches to automatic play.
S.play=newPlay(event);S.phase='play';const g=S.play;
g.mode='bat';g.inn=9;g.top=false;g.my=1;g.op=0;g.pa={i:9,on:'1',out:0,b:0,s:0,runs:0};
const bb=bbResolve(110,-10,0,50),plan=bbPlan(g,bb),res=pgApplyPlanned(g,bb,plan);
g.livePending={final:bbPlaySnapshot(g),res};bbPlayRestore(g,bb.before);
save();S=null;load();const restored=S.play;
assert(restored.livePending);pgFinishPending(restored);const settled=JSON.stringify(restored);
pgFinishPending(restored);assert.equal(JSON.stringify(restored),settled,'live result committed twice');
assert(restored.done);assert.equal(restored.ms.PA,1);assert.equal(restored.livePending,undefined);
for(const bad of ['null','{}','[null,1,"bad"]','invalid json']){
 localStorage.setItem(HOF,bad);localStorage.setItem(RKEY,bad);
 assert.equal(loadHof().length,0);assert.equal(rkLocal().length,0);
 assert.doesNotThrow(()=>renderCreate());
}
localStorage.setItem(HOF,JSON.stringify([{name:'기록',mvp:2},null]));
localStorage.setItem(RKEY,JSON.stringify([{name:'기록',day:'2026-11-01',pos:'SS',mine:1},null,{}]));
assert.equal(loadHof().length,1);assert.equal(rkLocal().length,1);
console.log({invalidSaves:invalid.length,unicodeRoundTrip:'passed',zeroJersey:'passed',legacyRecovery:'passed',liveResultRecovery:'passed',damagedRecordLists:'passed'});
`,{console,Math,assert,btoa,atob,localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}});
