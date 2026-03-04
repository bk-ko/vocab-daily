# 단어장 (vocab-daily)

초등학생을 위한 AI 기반 일일 어휘 학습 웹앱

## 기술 스택

- **프론트+백엔드**: Next.js 15 (App Router)
- **배포**: Vercel
- **DB + 인증**: Supabase
- **AI**: Claude API (claude-haiku-4-5)
- **스타일**: Tailwind CSS
- **스케줄러**: Vercel Cron Jobs

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 생성 후 값 입력:

```bash
cp .env.local.example .env.local
```

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `ANTHROPIC_API_KEY` | Anthropic API 키 |
| `CRON_SECRET` | Cron 보호용 임의 비밀값 |

### 3. Supabase DB 스키마 설정

Supabase 대시보드 → SQL Editor에서 `supabase-schema.sql` 내용을 실행합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

## 단어 생성 테스트

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/generate
```

## 배포 (Vercel)

1. GitHub에 저장소 생성 후 push
2. Vercel에서 GitHub 저장소 연결
3. 환경 변수 설정 (Project Settings → Environment Variables)
4. `vercel.json`의 Cron이 자동으로 매일 자정 단어를 생성합니다

## 프로젝트 구조

```
vocab-daily/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # 로그인
│   │   └── signup/page.tsx         # 회원가입
│   ├── (main)/
│   │   ├── layout.tsx              # 공통 헤더/네비
│   │   ├── dashboard/              # 오늘의 단어
│   │   ├── word/[id]/              # 단어 상세
│   │   ├── quiz/                   # 4지선다 퀴즈
│   │   └── history/                # 학습 이력
│   └── api/
│       ├── cron/generate/          # Claude 단어 생성 (Cron)
│       └── words/                  # 단어 조회 API
├── components/
│   ├── WordCard.tsx                # 탭하면 뜻 공개되는 카드
│   ├── QuizCard.tsx                # 4지선다 퀴즈 카드
│   └── LogoutButton.tsx
├── lib/
│   ├── supabase/client.ts          # 클라이언트용
│   ├── supabase/server.ts          # 서버용 (SSR)
│   └── claude.ts                   # Claude API 단어 생성
├── middleware.ts                   # 인증 미들웨어
├── supabase-schema.sql             # DB 스키마 + RLS
└── vercel.json                     # Cron 스케줄 설정
```
