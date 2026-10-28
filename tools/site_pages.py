"""사이트 안내 페이지(소개·공략·패치노트·개인정보·약관·문의·사이트맵·404)와 sitemap.xml/robots.txt를 만들고,
index.html·guide.html의 대표 주소(canonical)와 하단 메뉴를 맞춰요.

사용법:  python3 tools/site_pages.py https://새주소
(도메인을 바꾸면 이 명령 한 번만 다시 실행하면 돼요)"""
import re,sys,html,datetime,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=(sys.argv[1] if len(sys.argv)>1 else 'https://minors2mvp.pages.dev').rstrip('/')
TODAY=datetime.date.today().isoformat()
SITE='2군에서 MVP까지'
REPO='https://github.com/dsfghfgjhk/minors-to-mvp'
IG='https://www.instagram.com/minors2mvp/'
def rd(p):return open(os.path.join(ROOT,p),encoding='utf-8').read()
def wr(p,s):open(os.path.join(ROOT,p),'w',encoding='utf-8').write(s)
guide=rd('guide.html')
STYLE=re.search(r'<style>(.*?)</style>',guide,re.S).group(1)
STYLE+="""
.topnav{display:flex;gap:6px 14px;flex-wrap:wrap;justify-content:center;font-size:14px;padding:4px 0}
.topnav a{color:var(--ink2);text-decoration:none}.topnav a[aria-current]{color:var(--navy);font-weight:700}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:6px 0 10px}
.cards a{display:block;background:#f4f6f9;border-radius:12px;padding:14px 16px;color:var(--ink);text-decoration:none}
.cards a b{display:block;color:var(--navy)}.cards a span{font-size:14px;color:var(--ink2)}
.log h3{margin-top:18px}.muted{color:var(--muted);font-size:14px}
"""
# 페이지 목록: (파일, 메뉴 이름, 제목, 설명)
PAGES=[('about.html','서비스 소개','서비스 소개','2군에서 MVP까지가 어떤 게임인지, 무엇을 할 수 있는지 소개해요.'),
       ('guide.html','게임 가이드','게임 가이드','선수 만들기부터 드래프트, FA, 상무, 국가대표, MVP까지 한 번에 정리한 게임 가이드예요.'),
       ('tips.html','커리어 공략','커리어 공략 모음','진로 선택, 승부처, 3D 빅매치, 특성, 나이 관리까지 MVP를 빨리 받는 공략을 모았어요.'),
       ('patch.html','패치노트','패치노트','2군에서 MVP까지의 업데이트 기록이에요.'),
       ('privacy.html','개인정보처리방침','개인정보처리방침','2군에서 MVP까지가 어떤 정보를 어디에 저장하고 어떻게 쓰는지 안내해요.'),
       ('terms.html','이용약관','이용약관','2군에서 MVP까지를 이용할 때 지켜야 할 약속과 안내예요.'),
       ('contact.html','문의','문의','버그 제보, 기능 제안, 랭킹 기록 삭제 요청 등 문의하는 방법이에요.'),
       ('sitemap.html','사이트맵','사이트맵','2군에서 MVP까지의 모든 페이지를 한눈에 볼 수 있어요.')]
def url(f):return BASE+'/'+('' if f in('','index.html') else f)
def nav(cur):
  items=[('./','게임')]+[(f,m) for f,m,_,_ in PAGES if f not in('privacy.html','terms.html')]
  cur_attr=' aria-current="page"'
  return '<nav class="topnav" aria-label="사이트 메뉴">'+''.join('<a href="%s"%s>%s</a>'%(f,cur_attr if f==cur else '',m) for f,m in items)+'</nav>'
def foot():
  links=' · '.join(f'<a href="{f}">{m}</a>' for f,m,_,_ in PAGES)+f' · <a href="{IG}" rel="noopener">인스타그램 @minors2mvp</a>'
  return f"""<footer>
  <p>{SITE} · 학교, KBO·NPB·MLB 구단, 리그, 대회 이름은 실제 이름을 빌려 왔어요. 각 이름의 권리는 권리자에게 있고, 이 게임은 공식 제휴가 없는 팬 시뮬레이션이에요. 경기 결과와 기록, 계약은 모두 가상이에요.</p>
  <p><a href="./">게임 하기</a> · {links}</p>
</footer>"""
def page(f,title,desc,body,kicker=None):
  ld={"@context":"https://schema.org","@graph":[
      {"@type":"WebPage","name":f"{title} | {SITE}","url":url(f),"description":desc,"inLanguage":"ko","isPartOf":{"@type":"WebSite","name":SITE,"url":BASE+'/'}},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":SITE,"item":BASE+'/'},{"@type":"ListItem","position":2,"name":title,"item":url(f)}]}]}
  import json
  return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} | {SITE}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url(f)}">
<meta name="theme-color" content="#0f2b21">
<meta property="og:type" content="article">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="{SITE}">
<meta property="og:title" content="{title} | {SITE}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url(f)}">
<meta property="og:image" content="{BASE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;500;700&display=swap">
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script>
<style>{STYLE}</style>
</head>
<body>
<div class="wrap">
{nav(f)}
<header class="board">
  <p class="k">{SITE} · {kicker or title}</p>
  <h1>{title}</h1>
  <p>{desc}</p>
</header>
{body}
<a class="cta" href="./">게임 시작하기</a>
{foot()}
</div>
</body>
</html>
"""
S=lambda h,inner:f'<section>\n  <h2>{h}</h2>\n{inner}\n</section>'
# ---------------- 서비스 소개 ----------------
about=S('어떤 게임인가요?','''  <p><b>2군에서 MVP까지</b>는 고교 1학년 유망주로 시작해 신인 드래프트, 2군, 주전 경쟁, 상무 입대, FA와 해외 진출, 국가대표를 거쳐 리그 MVP에 도전하는 야구선수 키우기 웹게임이에요.</p>
  <p>회원가입이나 설치 없이 휴대폰, 태블릿, PC 브라우저에서 바로 플레이할 수 있고, 모든 기능이 무료예요.</p>''')+S('이런 걸 할 수 있어요','''  <ul>
    <li><b>나만의 선수 만들기</b> · 이름, 등번호, 포지션(투수·포수·내야·외야), 투타, 출신 고교를 고르고 키울 능력치를 정해요.</li>
    <li><b>시즌마다 커리어 결정</b> · 드래프트, 계약, 트레이드, 상무 입대, FA, 일본·미국 진출까지 선택에 따라 인생이 달라져요.</li>
    <li><b>3D 빅매치 직접 플레이</b> · 시즌마다 열리는 빅매치와 우승 결정전, 국가대표 결승을 3D 경기장에서 직접 치고 던져요.</li>
    <li><b>승부처 선택</b> · 끝내기 찬스, 만루 위기 같은 순간에 작전을 골라요. 얻는 게 큰 작전일수록 성공 확률은 낮아요.</li>
    <li><b>국가대표</b> · WBC, 프리미어12, 아시안게임, U-18 야구 월드컵에 뽑히면 메달에 도전해요. 아시안게임 금메달은 병역 혜택이 있어요.</li>
    <li><b>실시간 랭킹</b> · 은퇴한 선수는 그날의 랭킹에 올라가 다른 사람들의 선수와 MVP 횟수를 겨뤄요.</li>
  </ul>''')+S('바로 시작하기','''  <div class="cards">
    <a href="./"><b>게임 하기</b><span>지금 바로 선수 만들기</span></a>
    <a href="guide.html"><b>게임 가이드</b><span>처음이라면 여기부터</span></a>
    <a href="tips.html"><b>커리어 공략</b><span>MVP 빨리 받는 법</span></a>
    <a href="patch.html"><b>패치노트</b><span>무엇이 새로 바뀌었나</span></a>
  </div>''')+S('인스타그램','''  <p>공식 인스타그램 <a href="'''+IG+'''"><b>@minors2mvp</b></a>에서 명예의 전당 TOP 3, 새 기능, 이벤트 소식을 가장 먼저 올려요. 팔로우하고 랭킹 1위에 도전해 보세요.</p>''')+S('만든 사람','''  <p>개인 개발자가 만들고 함께 고쳐 나가는 무료 팬 게임이에요. 소스 코드는 <a href="'''+REPO+'''">GitHub</a>에 공개돼 있어요. 버그 제보와 아이디어는 <a href="contact.html">문의</a> 페이지로 보내 주세요.</p>''')
# ---------------- 커리어 공략 ----------------
tips=S('1. 진로 선택 공략','''  <ul>
    <li><b>고졸 프로 직행 vs 대학</b> · 10대 후반~20대 초반이 가장 많이 자라는 시기예요. 이때 많이 뛰는 게 핵심이라, 드래프트에 뽑히면 바로 프로로 가는 쪽이 대체로 유리해요. 대학은 4년 늦게 출발하는 대신 주전으로 뛰며 경험을 쌓을 수 있어요.</li>
    <li><b>강팀 백업보다 약팀 주전</b> · 출전 시간이 많을수록, 수준 높은 리그일수록 더 크게 자라요. 벤치만 지키는 강팀보다 주전으로 뛰는 팀이 성장에 좋아요.</li>
    <li><b>상무 입대 타이밍</b> · 병역을 해결하면서 실전 경기도 뛸 수 있어요. 1군 주전 경쟁에서 밀릴 때 다녀오면 손해가 적어요.</li>
    <li><b>해외 진출</b> · FA나 포스팅으로 일본·미국에 갈 수 있어요. 리그 수준이 높을수록 성장 폭과 연봉이 커지지만 주전 경쟁도 치열해요.</li>
  </ul>''')+S('2. 승부처 공략: 확률과 보상','''  <p>승부처에서는 같은 상황이라도 얻는 게 큰 작전(홈런, 정면 승부, 다이빙 캐치 등)일수록 성공 확률이 낮아요. 대신 성공하면 사기와 명성이 더 많이 오르고, 남은 시즌 활약 보너스도 더 커요.</p>
  <div class="tip">능력치가 받쳐 주면 높은 보상을 노리고, 시즌 초반처럼 실패해도 만회할 시간이 있을 때 과감하게 고르는 게 좋아요. 강심장 특성이면 성공 확률이 조금 더 높아요.</div>''')+S('3. 3D 빅매치 공략','''  <ul>
    <li><b>무조건 직접 플레이</b> · 결과만 보기보다 직접 뛰어서 맹활약(홈런, 멀티히트, 무실점 등)하면 사기·명성과 남은 시즌 보너스가 더 커요.</li>
    <li><b>타격</b> · 화면의 타이밍 안내를 보고 공이 도착하기 조금 전에 스윙하세요. 볼은 그냥 보내는 게 이득이에요. 스윙 세기를 세게 하면 장타가 나오지만 맞히기 어려워져요.</li>
    <li><b>투구</b> · 같은 구종만 계속 던지면 타자가 적응해요. 직구와 변화구를 섞고, 카운트가 유리할 때 유인구를 던지세요.</li>
    <li><b>9회말 끝내기</b> · 지고 있거나 비긴 채 9회말을 맞으면 마지막 타석이 와요. 여기서 역전하면 끝내기 승리예요.</li>
  </ul>''')+S('4. 특성별 운영','''  <div class="tablewrap"><table>
    <tr><th>특성</th><th>특징</th><th>운영 팁</th></tr>
    <tr><td>대기만성</td><td>늦게까지 자라고, 폼이 떨어지는 나이도 늦어요(34세부터).</td><td>20대 중반까지 조급해하지 말고 출전 시간을 챙기세요.</td></tr>
    <tr><td>잦은 부상</td><td>부상 확률이 높아요.</td><td>무리한 일정보다 꾸준히 뛸 수 있는 자리를 고르세요.</td></tr>
    <tr><td>강철 체력</td><td>부상이 적어요.</td><td>많이 뛸수록 이득이라 주전 자리를 적극적으로 노리세요.</td></tr>
    <tr><td>강심장</td><td>승부처와 빅매치에서 조금 더 강해요.</td><td>확률 낮은 고보상 작전을 노려 볼 만해요.</td></tr>
  </table></div>''')+S('5. 나이와 은퇴 관리','''  <ul>
    <li>30대가 되면 주루, 구속, 체력부터 떨어지고 선구안, 제구, 멘탈은 오래 유지돼요.</li>
    <li>32세부터 시즌 폼이 해마다 떨어지고, 성적으로 OVR이 오르는 폭도 줄어요(대기만성은 34세부터).</li>
    <li>그래서 FA 대박이나 해외 진출은 전성기인 20대 후반에 결정하는 게 좋아요.</li>
  </ul>''')+S('6. MVP와 랭킹 1위 노리는 법','''  <ul>
    <li>리그 MVP는 시즌 WAR가 아주 높아야 받아요. 1군 주전으로 한 시즌을 온전히 뛰는 게 먼저예요.</li>
    <li>시즌 성적 등급(S·A·B·C·D)이 높을수록 OVR이 더 올라요. OVR은 최대 99까지 올라가요.</li>
    <li>랭킹은 MVP 횟수 → 개인상 수 → 최고 OVR → 통산 WAR 순으로 매겨져요. MVP를 한 번이라도 더 받는 게 1위의 지름길이에요.</li>
    <li>아시안게임 금메달로 병역을 해결하면 전성기를 끊김 없이 이어갈 수 있어요.</li>
  </ul>''')
# ---------------- 패치노트 ----------------
NOTES=[('2026-10-28',['Blender로 만든 새 3D 선수 모델 적용: 인체 비율, 얼굴, 손, 하체 움직임 개선',
                      '주자와 수비의 이동 거리에 맞춘 보폭, 부드러운 방향 전환과 동작 연결',
                      '시즌마다 3D 빅매치 3경기 추가(개막 시리즈, 라이벌전, 순위 싸움), 선택 승부처는 1번으로 조정',
                      '3D 경기장 조명, 관중석, 잔디 디테일과 투구 물리 개선',
                      '실시간 랭킹 서버 연결, 랭킹에 전체 기간 보기 추가',
                      '사이트 안내 페이지(서비스 소개, 커리어 공략, 패치노트, 개인정보처리방침, 이용약관, 문의, 사이트맵) 추가']),
       ('2026-10-27',['3D 직접 플레이 대규모 개선: 타이밍 타격, 반응형 투구 패널, 실시간 병살·태그아웃, 귀루·재터치 등 주루 판단',
                      '잔디 감속, 바운드, 외야 낙구 후 구르기와 포구 궤적 개선',
                      '변화구 변화폭 확대와 실제 구종 궤적, 투구 경험을 학습하는 타자 AI',
                      '오늘의 랭킹(베스트 나인, 랭킹 100, 나의 기록) 추가',
                      '얻는 게 큰 작전일수록 성공 확률이 낮아지도록 승부처 개편, 나이에 따른 폼 하락 추가',
                      '시즌 성적 등급으로 OVR이 오르고 최대 OVR 99 적용',
                      '리그 MVP 시상식, WBSC 올해의 선수, 승부처 56종, 비시즌 메시지 추가',
                      '실제 구단·리그·대회 이름 적용, 아이패드·PC 넓은 화면 지원',
                      '첫 버전 공개'])]
patch=''.join(S(d,'  <ul>\n'+''.join(f'    <li>{html.escape(x)}</li>\n' for x in xs)+'  </ul>') for d,xs in NOTES)
patch+=S('전체 변경 기록',f'  <p>더 자세한 변경 내역은 <a href="{REPO}/commits/main">GitHub 커밋 기록</a>에서 볼 수 있어요.</p>')
# ---------------- 개인정보처리방침 ----------------
privacy=S('1. 회원가입과 수집하지 않는 정보','''  <p>2군에서 MVP까지는 회원가입이 없고, 이름·전화번호·이메일 같은 개인 식별 정보를 요구하지 않아요. 광고나 방문 분석용 쿠키도 쓰지 않아요.</p>''')+S('2. 기기에 저장되는 정보','''  <p>게임 진행 상황과 설정은 이용자의 브라우저 저장소(localStorage)에만 저장돼요. 서버로 보내지 않으며, 브라우저 데이터를 지우면 함께 사라져요.</p>
  <ul><li>게임 저장 데이터(선수 정보, 시즌 기록)</li><li>나의 은퇴 기록</li><li>소리, 조준 보조, 스윙 세기 같은 설정</li></ul>''')+S('3. 랭킹에 올라가는 정보','''  <p>선수가 은퇴하면 랭킹에 표시하기 위해 아래 정보를 랭킹 서버(Supabase)에 보내고, 랭킹 화면에서 누구나 볼 수 있어요.</p>
  <ul><li>게임 안에서 정한 선수 이름, 포지션, 등번호, 아바타 색</li><li>소속 팀, 최고 OVR, MVP·개인상·트로피 횟수, 통산 WAR, 시즌 수 등 게임 기록</li><li>은퇴한 날짜와 시각</li></ul>
  <div class="tip">선수 이름에 실명이나 연락처 같은 개인정보를 쓰지 마세요. 랭킹 기록 삭제를 원하면 <a href="contact.html">문의</a>로 선수 이름과 은퇴 날짜를 알려 주세요.</div>''')+S('4. 외부 서비스','''  <ul><li>Google Fonts: 글꼴을 불러와요.</li><li>jsDelivr: 3D 경기 화면을 그리는 three.js 라이브러리를 불러와요.</li><li>Supabase: 랭킹 기록을 저장하고 불러와요.</li><li>GitHub Pages, Cloudflare Pages: 웹사이트 파일을 전달해요.</li></ul>
  <p>이 서비스들은 접속 과정에서 IP 주소 같은 기술 정보를 처리할 수 있으며, 각 서비스의 개인정보처리방침을 따라요.</p>''')+S('5. 문의와 변경','''  <p>개인정보와 관련한 문의는 <a href="contact.html">문의</a> 페이지로 보내 주세요. 이 방침이 바뀌면 이 페이지와 <a href="patch.html">패치노트</a>에 알려요.</p>
  <p class="muted">시행일: 2026년 10월 28일</p>''')
# ---------------- 이용약관 ----------------
terms=S('1. 서비스','''  <p>2군에서 MVP까지(이하 "게임")는 누구나 무료로 이용할 수 있는 웹 야구 시뮬레이션 게임이에요. 게임은 있는 그대로 제공되며, 기능은 예고 없이 바뀌거나 중단될 수 있어요.</p>''')+S('2. 실제 이름과 가상 기록','''  <p>게임에 나오는 학교, 구단, 리그, 대회 이름은 실제 이름을 빌려 왔어요. 각 이름의 권리는 권리자에게 있고, 게임은 공식 제휴가 없는 팬 시뮬레이션이에요. 경기 결과와 기록, 계약, 연봉은 모두 가상이에요.</p>''')+S('3. 랭킹 이용 규칙','''  <ul><li>욕설, 혐오 표현, 다른 사람을 사칭하거나 개인정보가 담긴 선수 이름은 쓸 수 없어요.</li><li>기록을 조작하거나 랭킹 서버에 비정상적인 요청을 보내는 행위는 금지돼요.</li><li>규칙을 어긴 기록은 알림 없이 지워질 수 있어요.</li></ul>''')+S('4. 저장 데이터','''  <p>게임 저장 데이터는 이용자의 브라우저에만 있어요. 브라우저 데이터 삭제나 기기 변경으로 사라진 데이터는 복구해 드릴 수 없으니, 설정의 저장 코드를 따로 보관해 주세요.</p>''')+S('5. 후원','''  <p>"개발자 서버비 내주기" 후원은 전적으로 자발적이에요. 후원 여부와 상관없이 모든 기능을 똑같이 쓸 수 있고, 후원으로 게임 안의 혜택을 드리지 않아요.</p>''')+S('6. 약관 변경','''  <p>약관이 바뀌면 이 페이지에 알려요. 바뀐 뒤에도 게임을 계속 이용하면 바뀐 약관에 동의한 것으로 봐요.</p>
  <p class="muted">시행일: 2026년 10월 28일</p>''')
# ---------------- 문의 ----------------
contact=S('문의하는 방법',f'''  <p>가벼운 질문이나 소식은 인스타그램 <a href="{IG}">@minors2mvp</a> DM으로 보내도 돼요. 버그 제보, 기능 제안, 랭킹 기록 삭제 요청은 GitHub 이슈로 받아요. GitHub 계정이 있으면 누구나 글을 남길 수 있어요.</p>
  <div class="cards"><a href="{REPO}/issues/new"><b>새 문의 남기기</b><span>GitHub 이슈 작성</span></a><a href="{REPO}/issues"><b>다른 문의 보기</b><span>이미 올라온 제보와 답변</span></a></div>''')+S('버그를 제보할 때','''  <ul><li>사용한 기기와 브라우저(예: 아이폰 사파리, 갤럭시 크롬)</li><li>어떤 화면에서 무엇을 눌렀는지</li><li>가능하면 화면 캡처</li></ul>
  <p>게임 설정의 저장 코드를 함께 보내 주시면 같은 상황을 재현하기 쉬워요.</p>''')+S('랭킹 기록 삭제 요청','''  <p>선수 이름과 은퇴한 날짜를 알려 주시면 랭킹에서 지워 드려요. 실명이나 연락처는 적지 마세요.</p>''')
# ---------------- 사이트맵 ----------------
smap=S('전체 페이지','  <div class="cards">\n    <a href="./"><b>게임 하기</b><span>2군에서 MVP까지 바로 시작</span></a>\n'+''.join(f'    <a href="{f}"><b>{t}</b><span>{html.escape(d)}</span></a>\n' for f,_,t,d in PAGES if f!='sitemap.html')+'  </div>')
BODY={'about.html':about,'tips.html':tips,'patch.html':patch,'privacy.html':privacy,'terms.html':terms,'contact.html':contact,'sitemap.html':smap}
for f,m,t,d in PAGES:
  if f in BODY:wr(f,page(f,t,d,BODY[f]))
# 404
wr('404.html',page('404.html','페이지를 찾을 수 없어요','주소가 바뀌었거나 없는 페이지예요. 아래에서 원하는 곳으로 이동해 주세요.',smap,'404').replace(f'<link rel="canonical" href="{url("404.html")}">','<meta name="robots" content="noindex">'))
# ---------------- sitemap.xml / robots.txt ----------------
locs=['']+[f for f,_,_,_ in PAGES]
wr('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{url(f)}</loc><lastmod>{TODAY}</lastmod></url>\n' for f in locs)+'</urlset>\n')
wr('robots.txt',f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n')
# ---------------- index.html / guide.html 주소·메뉴 맞추기 ----------------
def fix_urls(s,f):
  s=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="{url(f)}">',s)
  s=re.sub(r'(<meta property="og:url" content=")[^"]*(">)',lambda m:m.group(1)+url(f)+m.group(2),s)
  s=re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(">)',lambda m:m.group(1)+BASE+'/og.png'+m.group(2),s)
  s=re.sub(r'("url":")https://[^"]*?(/?)(")',lambda m:m.group(1)+BASE+'/'+m.group(3),s) if f=='index.html' else s
  s=re.sub(r'("image":")https://[^"]*?/og\.png(")',lambda m:m.group(1)+BASE+'/og.png'+m.group(2),s)
  if 'rel="icon" type="image/png" sizes="192x192"' not in s:
    s=s.replace('<link rel="apple-touch-icon" href="apple-touch-icon.png">','<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">',1)
  return s
idx=fix_urls(rd('index.html'),'index.html')
menu='<nav aria-label="사이트 안내">'+''.join(f'<a href="{f}">{m}</a>' for f,m,_,_ in PAGES)+f'<a href="{IG}" rel="noopener">인스타그램</a><a href="{REPO}">GitHub</a></nav>'
idx=re.sub(r'<nav aria-label="사이트 안내">.*?</nav>',menu,idx,count=1,flags=re.S)
wr('index.html',idx)
g=fix_urls(guide,'guide.html')
if 'class="topnav"' not in g:
  g=g.replace('<style>','<style>\n.topnav{display:flex;gap:6px 14px;flex-wrap:wrap;justify-content:center;font-size:14px;padding:4px 0}\n.topnav a{color:var(--ink2);text-decoration:none}.topnav a[aria-current]{color:var(--navy);font-weight:700}',1)
  g=g.replace('<div class="wrap">','<div class="wrap">\n'+nav('guide.html'),1)
else:
  g=re.sub(r'<nav class="topnav".*?</nav>',nav('guide.html'),g,count=1,flags=re.S)
g=re.sub(r'<footer>.*?</footer>',foot(),g,count=1,flags=re.S)
wr('guide.html',g)
print('ok',BASE,len(PAGES),'pages')
