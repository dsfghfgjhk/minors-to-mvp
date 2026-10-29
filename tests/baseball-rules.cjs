const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const source=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
vm.runInNewContext(source+`;
C.cands=makeCands(C.pos);newCareer();
for(const [on,expected,runs]of [['','1',0],['1','12',0],['2','12',0],['3','13',0],['12','123',0],['13','123',0],['23','123',0],['123','123',1]]){const pa={on};if(pgWalk(pa)!==runs||pa.on!==expected)throw Error('walk force chain: '+on)}
const runner={from:1,to:2,start:.18,speed:6.6,forceBase:2,forceAt:0,forceUntil:2};
if(!bbForceActive(runner,1.99)||bbForceActive(runner,2))throw Error('force release boundary');
bbRunnerRetreat(runner,2.1,1);if(runner.to!==1)throw Error('batter out did not allow retreat');
let releaseCases=0,tagPlays=0,releasedRetreats=0,tagOuts=0;
for(const tf of [.4,.8,1.2,1.6,2])for(const at of [[19,20],[18,21],[15,23]]){
 const bb={k:'1B',fielder:'1B',tf,at,ground:{path:[[0,0,1,0],[tf,at[0],.037,at[1]]]}};
 const p=bbPlan({mode:'bat',pa:{on:'1',out:0}},bb),batter=p.runners.find(r=>r.bat),lead=p.runners.find(r=>r.from===1);
 if(batter.out){releaseCases++;if(lead.forceUntil!==batter.retireAt||bbForceActive(lead,batter.retireAt+.001))throw Error('force persists after batter retirement');
  if(p.events.some(e=>e.from===1&&e.force&&e.t>=batter.retireAt))throw Error('incorrect force after first out');
  if(p.throws.some(t=>t.base===2))tagPlays++;
  if(lead.to===1&&!lead.out)releasedRetreats++;
  if(p.events.some(e=>e.from===1&&e.kind==='out'&&!e.force))tagOuts++;
 }
}
if(!releaseCases||!tagPlays||!releasedRetreats||!tagOuts)throw Error('first-out then second-base tag defense not exercised');
for(const third of [{t:5,force:true},{t:5,catch:true},{t:5,batterBeforeFirst:true}])if(bbRunCounts(third,4))throw Error('illegal third-out run');
if(!bbRunCounts({t:5,force:false},4.9)||bbRunCounts({t:5,force:false},5)||bbRunCounts({t:5,force:false},5.1))throw Error('timing-play run rule');
const deep={k:'FO',ev:145,la:40,sp:0,fielder:'CF',tf:7,at:[0,122],fly:{x:0,z:122,dist:122,t:7}};
const caught=bbPlan({mode:'bat',pa:{on:'3',out:2}},deep);
if(caught.runs||caught.events.some(e=>e.kind==='run'))throw Error('runner scored before caught third out');
console.log({walkStates:8,releaseCases,tagPlays,releasedRetreats,tagOuts,thirdOutScoring:'passed',caughtThirdOut:'passed'});
`,{console,Math});
