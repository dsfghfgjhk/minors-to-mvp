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
1. Supabase **Project Settings → API**에서 **Project URL**과 **anon public** 키를 복사해요.
2. `index.html`에서 `const RANK_CFG={url:'',key:''};` 를 찾아 두 값을 넣어요.

```js
const RANK_CFG={url:'https://xxxx.supabase.co',key:'eyJhbGciOi...'};
```

3. 저장하고 GitHub에 올리면 끝이에요. 랭킹 화면 오른쪽 위에 **● 실시간**이 보이면 연결된 거예요.

anon 키는 공개돼도 되는 키예요. 위 정책 때문에 다른 사람은 기록을 **읽기와 추가만** 할 수 있고 고치거나 지울 수 없어요.
기록은 게임 화면에서 보내는 값이라 마음먹고 조작하면 막기 어려워요. 이상한 기록은 Supabase **Table Editor**에서 지우면 돼요.
