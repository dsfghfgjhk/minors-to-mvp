// Real game data: growth must survive saves and remain separate from retirement rankings.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=[...fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
const storage=new Map();
vm.runInNewContext(source+`;
const make=(pos='SS',name='후원 선수')=>{C.pos=pos;C.name=name;C.focus=[];C.cands=makeCands(pos);newCareer();return S.journey.id};
const first=make(),initial=jrLocal().find(j=>j.id===first);assert(jrValid(initial));assert.equal(initial.ovr,45);assert.equal(initial.seasons.length,0);
assert.equal(jrLocal().length,1);const revision=S.journey.revision;save();save();assert.equal(S.journey.revision,revision,'unchanged saves created extra snapshots');
fixState();save();const json=JSON.stringify(S);S=null;load();assert.equal(S.journey.id,first);assert.equal(JSON.stringify(S),json);
startSeason();finishSeason();save();const one=jrLocal().find(j=>j.id===first);assert.equal(one.seasons.length,1);assert(Number.isFinite(one.seasons[0].ovrBefore));assert(Number.isFinite(one.seasons[0].ovrAfter));assert(one.events.length>initial.events.length);
const full=jrText(one),short=jrText(one,true);assert(full.includes('시즌별 성적과 성장'));assert(full.includes(String(one.seasons[0].y)));assert(short.includes('릴스'));assert(short.includes('OVR 45'));assert(!full.includes('undefined'));assert(!short.includes('undefined'));
S.stats.fld++;save();const grown=jrLocal().find(j=>j.id===first);assert(grown.revision>one.revision);assert(grown.maxOvr>=grown.ovr);assert.equal(jrLocal().filter(j=>j.id===first).length,1);
if(S.tp&&!S.tp.done){chooseTP(0);save();assert(S.journey.events.some(e=>e.kind==='choice'))}
S.off={offers:[],decided:null};applyOffer({kind:'trade',org:'KR',team:tnames('KR')[0],role:'ace',comp:50,label:'테스트 트레이드'});save();assert(S.journey.events.some(e=>e.kind==='trade'));
const publicRow=jrRow(grown),publicJSON=JSON.stringify(publicRow);assert.equal(publicRow.ava.kind,'journey');assert(jrFromRow(publicRow));assert(!publicJSON.includes('"pot":'));assert(!publicJSON.includes('"prog":'));assert(!publicJSON.includes('"seen":'));assert.equal(publicRow.ava.skin,S.avatar.skin);
const second=make();assert.notEqual(second,first,'same-name characters reused identity');assert.equal(jrMerge(jrLocal()).length,2);
assert(jrMatches(grown,'후원'));assert(jrMatches(grown,first));assert(!jrMatches(grown,'다른이름'));
assert.equal(jrMerge([initial,grown,one]).length,1);assert.equal(jrMerge([initial,grown,one])[0].revision,grown.revision);
const bad={...grown,ovr:'<img src=x onerror=alert(1)>'};assert.equal(jrValid(bad),false);assert.equal(jrFromRow({ava:{kind:'journey',journey:bad}}),null);
const code=exportCode();assert(importCode(code));assert.equal(S.journey.id,second,'import forked the same character');
const old=JSON.parse(JSON.stringify(S));delete old.journey;assert(acceptSave(old));save();assert.equal(S.journey,undefined,'legacy save enrolled without notice');
assert(importCode(code));retire();save();const retired=jrLocal().find(j=>j.id===second);assert(retired.retired);assert.equal(rkLocal().filter(r=>r.mine).length,1,'growth snapshots polluted retirement list');
const row=jrRow(retired);assert(row.seasons>=1&&row.seasons<=40);assert(row.ovr<=99&&row.mvp<=30&&row.aw<=300&&row.tro<=150&&row.war>=-60&&row.war<=300);
ui.rank={tab:'players',day:'all',cat:'all',jrList:jrLocal(),detail:first,jrDetail:grown};assert(renderRank().includes('전체 성장 기록 복사'));
const malformed=JSON.parse(JSON.stringify(S));malformed.journey.events=[null];assert.equal(acceptSave(malformed),false);
console.log({stableIdentity:true,creationAndSeason:true,abilityHistory:true,sameNames:true,saveImport:true,legacyPreserved:true,publicWhitelist:true,retirementSeparated:true,copyText:true});
`,{assert,console,Math,Date,btoa,atob,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});
