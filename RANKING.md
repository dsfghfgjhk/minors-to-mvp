# 전체 랭킹 켜기 (무료 Supabase)

랭킹 화면은 서버 없이도 **이 기기에서 은퇴한 선수들**로 동작해요.
모든 플레이어의 기록을 한곳에 모으는 **전체 랭킹**은 무료 Supabase 프로젝트를 연결하면 켜져요. 5분쯤 걸려요.

## 1. 프로젝트 만들기
1. https://supabase.com 에서 GitHub 계정으로 가입하고 **New project**를 만들어요 (Free 플랜, 지역은 Seoul).
2. 왼쪽 메뉴 **SQL Editor**에 아래 SQL을 붙여 넣고 **Run**을 눌러요.

```sql
create table public.careers (
  id text primary key,
  created_at timestamptz default now(),
  day date not null,
  ts bigint not null,
  name text not null check (char_length(name) between 1 and 12),
  pos text not null check (pos in ('SP','RP','C','1B','2B','3B','SS','LF','CF','RF')),
  ovr int not null check (ovr between 0 and 99),
  mvp int not null check (mvp between 0 and 30),
  aw int not null check (aw between 0 and 300),
  tro int not null check (tro between 0 and 150),
  war real not null check (war between -60 and 300),
  wbsc int not null default 0 check (wbsc between 0 and 30),
  seasons int not null check (seasons between 1 and 40),
  team text check (char_length(team) <= 30),
  one boolean not null default false,
  abroad boolean not null default false,
  ava jsonb,
  col text check (char_length(col) <= 9),
  num int check (num between 0 and 99)
);
create index careers_rank on public.careers (day, mvp desc, aw desc, ovr desc, war desc, ts);
alter table public.careers enable row level security;
create policy "누구나 읽기" on public.careers for select using (true);
create policy "누구나 기록 추가" on public.careers for insert with check (day >= current_date - 1 and day <= current_date + 1);
```

## 2. 게임에 연결하기
1. Supabase **Project Settings → API Keys**에서 **Publishable key**(`sb_publishable_…`)를, **Data API**(또는 Connect 버튼)에서 **Project URL**을 복사해요. 예전 프로젝트라면 **anon public** 키를 써도 돼요.
2. `index.html`에서 `const RANK_CFG={url:'',key:''};` 를 찾아 두 값을 넣어요.

```js
const RANK_CFG={url:'https://xxxx.supabase.co',key:'eyJhbGciOi...'};
```

3. 저장하고 GitHub에 올리면 끝이에요. 랭킹 화면 오른쪽 위에 **● 실시간**이 보이면 연결된 거예요.

Publishable(anon) 키는 공개돼도 되는 키예요. **secret / service_role 키는 절대 넣으면 안 돼요.** 위 정책 때문에 다른 사람은 기록을 **읽기와 추가만** 할 수 있고 고치거나 지울 수 없어요.
기록은 게임 화면에서 보내는 값이라 마음먹고 조작하면 막기 어려워요. 이상한 기록은 Supabase **Table Editor**에서 지우면 돼요.


## 생성 이후의 캐릭터 성장 기록

추가 테이블이나 UPDATE 권한 없이 기존 `careers.ava` JSONB에 버전이 있는 성장 문서를 저장합니다. 기존 피부·머리색 필드는 유지하며, 성장 스냅샷에는 `ava.kind = "journey"`와 `ava.journey`를 넣습니다. 각 문서는 선수 코드, 초기·현재 능력치, 완료한 모든 시즌, 전체 성장 타임라인을 포함합니다. 새 상태는 새 PK로 INSERT하므로 기존 읽기·추가 정책 그대로 동작합니다. 기존 은퇴 행은 수정하지 않습니다.

- 이름 부분 검색: `ava->>kind=eq.journey&name=ilike.%이름%`
- 고유 선수 조회: `ava->>kind=eq.journey&ava->journey->>id=eq.p-…&order=ts.desc,id.desc&limit=1`
- 검색 페이지는 원본 스냅샷 60개씩 조회한 뒤 선수 코드로 합칩니다. **기록 더 불러오기**로 다음 페이지를 조회합니다. 랭킹 상위 100명 목록에 검색 범위를 한정하지 않습니다.
- 서버는 이전 스냅샷도 보존하며, 조회 화면에서는 선수별 가장 최근의 전체 성장 기록을 표시합니다. 과거 시즌 성적·성장 OVR은 최신 문서에도 모두 남습니다.
- `seasons` 컬럼은 기존 SQL의 최소값(1)을 지키기 위한 호환 필드입니다. 완료 시즌이 0인 신인의 실제 시즌 수는 `ava.journey.seasons.length`를 사용합니다.

은퇴 랭킹, 베스트 나인, 통계 페이지, `.github/workflows/hof-data.yml`은 아래 조건으로 성장 스냅샷을 제외합니다. 향후 `careers`를 직접 집계하는 도구에도 같은 필터를 적용해야 합니다.

```text
id=not.like.j-*
```

새 캐릭터 생성 시 이름·성장 기록의 공개를 안내합니다. 전체 이어 하기 저장 코드, 연락처, 숨겨진 잠재력, 랜덤 상태는 보내지 않습니다. 기존 저장에는 자동 등록하지 않습니다. 미전송 문서는 `b2mvp_journeys_v1`에 보관하며, 오프라인 중 여러 상태를 거쳐도 최신 문서 하나에 이전 시즌과 사건이 함께 남습니다. 업로드 성공 전 새 상태가 생긴 경우 새 상태를 전송 완료로 잘못 표시하지 않습니다. 동일 PK 재전송의 409는 이전 업로드의 성공으로 처리합니다.

현재 환경은 Supabase 호스트의 외부 연결을 허용하지 않아 실제 서버 왕복은 검증하지 못했습니다. 단위·브라우저 검증은 기존 SQL 제약과 읽기/INSERT 계약을 재현한 서버 응답으로 수행합니다. 서버에는 기존 `careers` 표와 위 SQL의 JSONB·공개 읽기/추가 정책이 있어야 합니다.

성장 스냅샷 PK는 `j-`로 시작하고 기존 은퇴 기록 PK는 `r`로 시작합니다. 은퇴 집계는 큰 JSON 문서를 조건식에서 읽지 않고 PK 접두사로 성장 스냅샷을 제외합니다.
