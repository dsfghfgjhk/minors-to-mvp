const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const src=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>m[2].includes('const HAS_DOM='))[2];
let clock=1000;
vm.runInNewContext(src+`;
function game(pos){C.pos=pos;C.focus=[];C.cands=makeCands(pos);newCareer();startSeason();const g=newPlay({kind:'reg',label:'Keyboard test',oppFull:tnames('HS')[1],opp:tnames('HS')[1],p:.15});S.play=g;S.phase='play';PG.an=null;PG.rv=null;P3.fail=false;pgClearKeys();return g}
const down=(code,extra={})=>pgKeyboardDown({code,target:{tagName:'BODY'},...extra}),up=code=>pgKeyboardUp({code});
const g=game('SP');assert.equal(g.st,'intro');assert(down('Enter'));assert.equal(g.st,'aim');
const x=mpx(g.sel.u),y=mpy(g.sel.v);down('ArrowRight');down('KeyW');for(let i=0;i<30;i++)pgPitchAimStep(g,1/60);
assert(mpx(g.sel.u)>x&&mpy(g.sel.v)<y,'aim does not match screen direction');up('ArrowRight');up('KeyW');
const stopped=JSON.stringify(g.sel);pgPitchAimStep(g,.05);assert.equal(JSON.stringify(g.sel),stopped,'aim stuck after key release');
down('KeyR');assert.equal(g.sel.u,0);assert.equal(g.sel.v,0);
down('KeyD');pgPitchAimStep(g,.05);const normal=-g.sel.u;up('KeyD');down('KeyR');down('ShiftLeft');down('KeyD');pgPitchAimStep(g,.05);const fine=-g.sel.u;
assert(Math.abs(normal/fine-4)<.0001,'precision aiming not slower');up('ShiftLeft');up('KeyD');
down('KeyD');down('KeyS');for(let n=0;n<500;n++)pgPitchAimStep(g,.05);assert(g.sel.u>=-9&&g.sel.u<=9&&g.sel.v<=4.1);up('KeyD');up('KeyS');down('KeyR');
down('Digit2');assert.equal(g.sel.type,g.ars[1]);down('KeyQ');assert.equal(g.sel.type,g.ars[0]);down('KeyE');assert.equal(g.sel.type,g.ars[1]);down('Numpad4');assert.equal(g.sel.type,g.ars[3]);
// Holding Space works even when a pitch-selection button owns focus; key repeat cannot restart power.
setClock(1000);down('Space',{target:{tagName:'BUTTON',dataset:{a:'pg-type'}}});assert.equal(PG.charge,1000);assert.equal(PG.pitchChargeSource,'keyboard');setClock(1200);down('Space',{repeat:true});assert.equal(PG.charge,1000);
setClock(1325);up('Space');assert.equal(g.st,'anim');assert.equal(PG.an.k,'wind');assert(Math.abs(g.cur.pw-.5)<.0001);assert.equal(PG.charge,0);
const type=g.sel.type;down('Digit1');assert.equal(g.sel.type,type,'pitch changed after release');down('Enter');assert.equal(g.st,'anim','Enter skipped a live pitch');
// Losing focus or pressing Escape cancels charging rather than releasing a pitch.
g.st='aim';g.cur=null;PG.an=null;setClock(2000);down('Space');down('KeyD');pgClearKeys();up('Space');assert.equal(PG.charge,0);assert.equal(g.cur,null);assert.equal(Object.keys(PG.pitKeys).length,0);
setClock(2300);down('Space');down('Escape');up('Space');assert.equal(g.cur,null);
// Keyboard release must not accidentally release a mouse-owned pitch charge.
setClock(2600);pgCharge('pointer');up('Space');assert(PG.charge);pgPitchCancel();
assert.equal(down('Digit1',{target:{tagName:'INPUT'}}),false);assert.equal(down('KeyR',{ctrlKey:true}),false);
// Enter advances the inning and confirms the completed match without a mouse.
g.inn=9;g.top=true;g.my=5;g.op=2;g.st='between';g.pitDone[9]=true;PG.an=null;down('Enter');assert(g.done&&g.st==='over');
down('Enter',{repeat:true});assert(S.play);down('Enter');assert.equal(S.play,null);assert.equal(S.phase,'progress');
// A fielding turn uses the same keyboard handler for movement, queued throws and diving.
const fgame=game('SS');fgame.pa.on='1';fgame.pa.out=0;fgame.field=pgFieldMake(fgame);down('Enter');const f=fgame.field;assert.equal(fgame.st,'fielding');
const fx=f.x,fz=f.z;down('ArrowRight');down('KeyW');pgStep(fgame,4000);pgStep(fgame,4050);assert(f.x<fx&&f.z<fz);up('ArrowRight');up('KeyW');
down('Numpad2');const holdAt=PG.fieldHold.start;down('Numpad2',{repeat:true});assert.equal(PG.fieldHold.start,holdAt);
for(let n=0;n<1000&&f.phase!=='throw';n++){f.moveTo=(f.chaseTarget||f.target).slice();pgFieldUpdate(fgame,.02)}assert.equal(f.throws[0].base,2);up('Numpad2');
const diveGame=game('SS');down('Enter');down('KeyJ');assert(diveGame.field.getupUntil>diveGame.field.t);const until=diveGame.field.getupUntil;down('KeyJ',{repeat:true});assert.equal(diveGame.field.getupUntil,until);
down('Digit1');down('Escape');assert.equal(PG.fieldHold,null);assert.equal(Object.keys(PG.fieldKeys).length,0);
console.log({pitchAim:'screen directions and limits',precision:'4x finer',pitchSelection:'numbers, numpad and Q/E',power:'hold/release and cancel passed',fielding:'movement, queued throw and dive passed',progress:'Enter start/next/result passed',editableInputs:'preserved'});
`,{console,Math,assert,performance:{now:()=>clock},setClock:n=>clock=n});
