"""명예의 전당 TOP 3 인스타 스토리(1080x1920) 만들기: 사진 1장 + 7.6초 영상.

사용법:
  python3 tools/hof_story.py data.json 출력폴더
data.json 모양 (.github/workflows/hof-data.yml 이 hof-data 브랜치의 data/hof/latest.json 으로 매일 만들어요):
  {"day":"2026-10-29","count":189,"top":[{"name":"..","pos":"SP","ovr":99,"mvp":18,"ava":{"skin":"#..","hair":"#.."},"col":"#.."}, ...]}
필요한 것: Pillow, numpy, scipy, ffmpeg, Playwright(아바타를 게임과 똑같이 그리려고 index.html 의 avatarURL 을 써요), Noto Sans CJK 글꼴.
"""
import json,math,os,random,shutil,subprocess,sys,asyncio,base64,io
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageFilter

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W,HH,FPS=1080,1920,30
FD='/usr/share/fonts/opentype/noto/'
POS={'SP':'선발투수','RP':'구원투수','C':'포수','1B':'1루수','2B':'2루수','3B':'3루수','SS':'유격수','LF':'좌익수','CF':'중견수','RF':'우익수'}
GOLD=(255,196,54);SIL=(205,214,224);BRZ=(214,146,92)
def FW(w,s):return ImageFont.truetype(FD+f'NotoSansCJK-{w}.ttc',s,index=1)
E=lambda x:1-(1-max(0,min(1,x)))**3
def tl(t,f,fill):
  b=ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),t,font=f);L=Image.new('RGBA',(b[2]-b[0]+40,b[3]-b[1]+40),(0,0,0,0))
  ImageDraw.Draw(L).text((20-b[0],20-b[1]),t,font=f,fill=fill);return L
def pill(t,size,bg,fg,pad=(34,16)):
  f=FW('Black',size);b=ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),t,font=f)
  w,h=b[2]-b[0]+pad[0]*2,b[3]-b[1]+pad[1]*2;L=Image.new('RGBA',(w,h),(0,0,0,0));d=ImageDraw.Draw(L)
  d.rounded_rectangle((0,0,w-1,h-1),radius=h//2,fill=bg);d.text((pad[0]-b[0],pad[1]-b[1]),t,font=f,fill=fg);return L
def put(base,L,cx,cy,sc=1.,al=1.):
  if al<=0:return
  if sc!=1:L=L.resize((max(1,int(L.width*sc)),max(1,int(L.height*sc))),Image.BICUBIC)
  if al<1:a=L.getchannel('A').point(lambda v:int(v*al));L=L.copy();L.putalpha(a)
  base.alpha_composite(L,(int(cx-L.width/2),int(cy-L.height/2)))
def pop(t,dur=.22,frm=1.8):k=max(0,min(1,t/dur));return(frm+(1-frm)*E(k)+math.sin(k*math.pi)*.08 if t<dur else 1),min(1,k*3)

async def _avatars(top):
  from playwright.async_api import async_playwright
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page()
    await pg.goto('file://'+os.path.join(ROOT,'index.html'));await pg.wait_for_timeout(500)
    urls=[await pg.evaluate("([a,c])=>avatarURL(a,c)",[r.get('ava') or {'skin':'#e8b98f','hair':'#2b2118'},r.get('col') or '#1f4fa3']) for r in top]
    await b.close()
  return [Image.open(io.BytesIO(base64.b64decode(u.split(',',1)[1]))).convert('RGBA') for u in urls]

def build(data,out):
  top=data['top'][:3]
  if not top:raise SystemExit('랭킹 기록이 없어요')
  os.makedirs(out,exist_ok=True)
  avs=asyncio.run(_avatars(top))
  slots=[dict(col=GOLD,w=330,h=440,x=W/2),dict(col=SIL,w=310,h=360,x=W/2-335),dict(col=BRZ,w=310,h=310,x=W/2+335)]
  P=[]
  for i,(r,a) in enumerate(zip(top,avs)):
    p=dict(slots[i],rk=i+1,name=str(r.get('name') or '이름 없는 선수')[:12],pos=POS.get(r.get('pos'),r.get('pos') or ''),ovr=int(r.get('ovr') or 0),mvp=int(r.get('mvp') or 0))
    a=a.crop(a.getchannel('A').getbbox());hh=300 if i==0 else 245;p['img']=a.resize((int(a.width*hh/a.height),hh),Image.NEAREST);P.append(p)
  BASE=1470
  BG=Image.new('RGBA',(W,HH));d=ImageDraw.Draw(BG)
  for y in range(HH):k=y/HH;d.line([(0,y),(W,y)],fill=(int(8+10*k),int(30+30*k),int(22+16*k),255))
  def beams(b,ang):
    L=Image.new('RGBA',(W,HH),(0,0,0,0));g=ImageDraw.Draw(L)
    for sx,a0 in((-80,ang),(W+80,-ang)):
      a=math.radians(90+a0);cx,cy=sx+math.cos(a)*2400,-120+math.sin(a)*2400;nx,ny=-math.sin(a)*260,math.cos(a)*260
      g.polygon([(sx,-120),(cx+nx,cy+ny),(cx-nx,cy-ny)],fill=(255,240,200,46))
    b.alpha_composite(L.filter(ImageFilter.GaussianBlur(30)))
  rnd=random.Random(7);CONF=[dict(x=rnd.uniform(0,W),y=rnd.uniform(-900,-20),vx=rnd.uniform(-70,70),vy=rnd.uniform(380,800),r=rnd.uniform(0,6.28),vr=rnd.uniform(-7,7),c=rnd.choice([GOLD,(255,77,94),(96,165,250),(52,211,153),(255,255,255)]),s=rnd.uniform(10,20)) for _ in range(150)]
  def confetti(b,lt):
    d=ImageDraw.Draw(b)
    for p in CONF:
      y=p['y']+p['vy']*lt;x=p['x']+p['vx']*lt;r=p['r']+p['vr']*lt;s=p['s']
      if -40<y<HH+40:d.polygon([(x+math.cos(r+a)*s,y+math.sin(r+a)*s*.5) for a in(0,1.57,3.14,4.71)],fill=p['c'])
  CR=Image.new('RGBA',(220,160),(0,0,0,0));g=ImageDraw.Draw(CR)
  g.polygon([(20,140),(10,40),(65,90),(110,15),(155,90),(210,40),(200,140)],fill=GOLD);g.rectangle((20,125,200,150),fill=(230,160,30))
  for x,y in((10,40),(110,15),(210,40)):g.ellipse((x-14,y-14,x+14,y+14),fill=(255,236,160))
  def block(p):
    w,h=p['w'],p['h'];L=Image.new('RGBA',(w,h+30),(0,0,0,0));g=ImageDraw.Draw(L);c=p['col'];dk=tuple(int(v*.7) for v in c)
    g.polygon([(0,30),(26,0),(w-26,0),(w,30)],fill=tuple(min(255,int(v*1.12)) for v in c));g.rectangle((0,30,w,h+30),fill=c);g.rectangle((0,h+10,w,h+30),fill=dk)
    g.text((w/2,30+62),str(p['rk']),font=FW('Black',100),fill=dk,anchor='mm')
    n=p['name'];fs=54
    while fs>30 and g.textlength(n,font=FW('Black',fs))>w-30:fs-=2
    g.text((w/2,30+150),n,font=FW('Black',fs),fill=(20,24,30),anchor='mm')
    g.text((w/2,30+203),f"{p['pos']} · OVR {p['ovr']}",font=FW('Bold',31),fill=(40,44,52),anchor='mm')
    m=pill(f"MVP {p['mvp']}회",44,(20,24,30),'#ffc436',(30,14));L.alpha_composite(m,(int(w/2-m.width/2),int(30+h-40-m.height/2)));return L
  y_,m_,d_=data['day'].split('-')
  TITLE=tl('명예의 전당',FW('Black',150),GOLD);TG=TITLE.filter(ImageFilter.GaussianBlur(22))
  SUB=pill(f"오늘 TOP 3 · {int(m_)}월 {int(d_)}일 · 총 {int(data.get('count') or len(data['top']))}명",40,(255,255,255,40),'#f3f7f2')
  CTA=pill('너도 이름 올려 봐 · 프로필 링크',48,'#d33a3a','#ffffff',(44,24));URL=tl('minors2mvp.pages.dev',FW('Bold',36),(200,225,210))
  T_IN={3:1.3,2:2.0,1:2.9};TOTAL=7.6
  def frame(t,still=False):
    b=BG.copy();beams(b,18+10*math.sin(t*1.3) if not still else 16);a=1 if still else min(1,t/.5)
    if still or t>=T_IN[1]:confetti(b,(t-T_IN[1]) if not still else 3.0)
    b.alpha_composite(TG,(int(W/2-TG.width/2),int(330-TG.height/2)));put(b,TITLE,W/2,330,1 if still else 1.1-.1*E(t/.5),a);put(b,SUB,W/2,470,1,a)
    for p in sorted(P,key=lambda q:-q['rk']):
      lt=9 if still else t-T_IN[p['rk']]
      if lt<0:continue
      k=E(lt/.45);hh=p['h'];top_=BASE-hh-30;b.alpha_composite(block(p),(int(p['x']-p['w']/2),int(top_+(1-k)*(hh+60))))
      av=p['img'];s,al=pop(lt-.3,.25,1.5);put(b,av,p['x'],top_-av.height/2+6,s,al)
      if p['rk']==1:put(b,CR,p['x'],top_-av.height-60,*pop(lt-.45,.25,1.8))
    if not still and T_IN[1]<=t<T_IN[1]+.1:b.alpha_composite(Image.new('RGBA',(W,HH),(255,255,255,int(200*(1-(t-T_IN[1])/.1)))))
    ka=1 if still else E((t-3.7)/.35)
    if ka>0:put(b,CTA,W/2,1585,(1+.04*math.sin(max(0,t-4.2)*8)) if not still else 1,ka);put(b,URL,W/2,1665,1,ka)
    return b
  png=os.path.join(out,f'명예의전당_{data["day"]}.png');frame(0,True).convert('RGB').save(png,quality=95)
  fr=os.path.join(out,'_frames');shutil.rmtree(fr,ignore_errors=True);os.makedirs(fr)
  for n in range(int(TOTAL*FPS)):frame(n/FPS).convert('RGB').save(os.path.join(fr,'%05d.jpg'%n),quality=92)
  wav=os.path.join(out,'_a.wav');sound(T_IN,TOTAL,wav)
  mp4=os.path.join(out,f'명예의전당_{data["day"]}.mp4')
  subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-i',os.path.join(fr,'%05d.jpg'),'-i',wav,'-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',mp4],check=True)
  shutil.rmtree(fr,ignore_errors=True);os.remove(wav)
  return png,mp4

def sound(T_IN,TOTAL,path):
  """드럼롤 → 1위에서 심벌·팡파르·함성 (numpy로 직접 합성)"""
  from scipy.signal import butter,sosfilt,fftconvolve
  from scipy.io import wavfile
  SR=44100;N=int((TOTAL+1)*SR);rng=np.random.default_rng(5);L=np.zeros(N);R=np.zeros(N)
  tt=lambda d:np.arange(int(d*SR))/SR
  bp=lambda x,lo,hi,o=2:sosfilt(butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
  lp=lambda x,f,o=2:sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
  hp=lambda x,f,o=2:sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
  nz=lambda d:rng.standard_normal(int(d*SR))
  def add(t,s,g=1.):
    s=np.asarray(s)*g;sl,sr=(s[0],s[1]) if s.ndim==2 else (s,s);i=int(t*SR);n=min(len(sl),N-i)
    if n>0:L[i:i+n]+=sl[:n];R[i:i+n]+=sr[:n]
  IR=nz(1.3)*np.exp(-tt(1.3)/.32);IR/=np.abs(IR).sum()**.5*8
  verb=lambda x,w=.35:x+w*fftconvolve(x,IR)[:len(x)]
  boom=lambda:(lambda x:np.sin(2*np.pi*np.cumsum(60-25*x/1.2)/SR)*np.exp(-x/.35)+lp(nz(1.2),200)*np.exp(-x/.2)*.6)(tt(1.2))
  crash=lambda d=1.6:(lambda x:hp(nz(d),5000)*np.exp(-x/.45)+bp(nz(d),3000,9000)*np.exp(-x/.25)*.5)(tt(d))
  def whoosh(d=.3,lo=500,hi=3000):
    n=nz(d);o=np.zeros(len(n));ch=8;seg=len(n)//ch
    for k in range(ch):f=lo+(hi-lo)*(k/(ch-1));a=bp(n,f*.7,min(f*1.4,SR/2-100))[k*seg:(k+1)*seg];o[k*seg:k*seg+len(a)]=a
    return o*np.sin(np.pi*np.linspace(0,1,len(o)))**1.5
  def firework():
    x=tt(1.4);s=bp(nz(1.4),400,3000)*np.exp(-x/.02)*1.4+np.sin(2*np.pi*55*x)*np.exp(-x/.3)*.9
    for k in range(60):
      t0=.15+rng.random()**1.6*1.1;i=int(t0*SR);c=hp(nz(.012),2000)*np.exp(-tt(.012)/.002)*(1-t0/1.3)*.5;s[i:i+len(c)]+=c
    return verb(s,.5)
  def crowd(d,lvl=1.,seed=0):
    g=np.random.default_rng(seed)
    def mk(z):
      base=bp(z,250,2600)
      for f in(520,830,1150):base+=bp(z,f*.9,f*1.1,1)*1.5
      return base*np.clip(lp(g.standard_normal(len(z)),3)*60+1,.3,2)
    return np.stack([mk(g.standard_normal(int(d*SR))),mk(g.standard_normal(int(d*SR)))])*lvl
  saw=lambda f,d:2*((tt(d)*f)%1)-1
  hit=lambda:bp(nz(.08),900,6000)*np.exp(-tt(.08)/.02)
  t=.5
  while t<T_IN[1]:add(t,hit(),.18+.25*(t-.5)/(T_IN[1]-.5));t+=max(.035,.12-.03*(t-.5))
  for k in(3,2):add(T_IN[k],boom(),.45);add(T_IN[k],whoosh(),.35)
  add(T_IN[1],boom(),.9);add(T_IN[1],crash(),.45)
  brass=lambda fs,d:(lambda x:lp(sum(saw(f,d)+saw(f*1.005,d) for f in fs),2600)*np.minimum(1,x/.03)*np.exp(-x/(d*.9)))(tt(d))
  for o,fs,d in((0,[392,493.9,587.3],.25),(.27,[392,493.9,587.3],.25),(.54,[523.3,659.3,784],1.4)):add(T_IN[1]+.1+o,brass(fs,d),.16)
  add(T_IN[1],crowd(TOTAL-T_IN[1],.3,5)*.7)
  for o in(0,.4,.9):add(T_IN[1]+o,firework(),.4)
  mix=np.stack([L,R])[:,:int(TOTAL*SR)];mix=hp(mix,35);mix=np.tanh(mix/np.percentile(np.abs(mix),99.9)*1.1)*.89
  wavfile.write(path,SR,(mix.T*32767).astype(np.int16))

if __name__=='__main__':
  if len(sys.argv)<3:raise SystemExit(__doc__)
  png,mp4=build(json.load(open(sys.argv[1],encoding='utf-8')),sys.argv[2]);print(png);print(mp4)
