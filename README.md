# devlog

> GitHub 활동을 Claude가 분석해주는 MCP 서버 + 웹 대시보드

내가 이번 주 뭘 했는지, 1년 동안 어떻게 성장했는지 — Claude가 읽고 사람 말로 정리해준다.

## 주요 기능

- **주간 요약** — 커밋, PR, 리뷰 활동을 자연어로 정리
- **연봉협상 모드** — 연간 성과를 PDF 한 장으로
- **코드 친절함 점수** — PR 본문, 커밋 메시지, 리뷰 어조 분석
- **Privacy Shield** — 로컬에서만 실행, 회사 코드 외부 유출 없음

## 구조

```
devlog/
├── packages/
│   └── mcp-server/   # Claude Desktop MCP 서버 (npm 배포)
└── apps/
    └── web/          # Next.js 웹 대시보드 (예정)
```

## 빠른 시작

### 1. GitHub Personal Access Token 발급

[GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens)

필요 권한: `repo` (읽기), `user` (읽기)

### 2. MCP 서버 설치

```bash
cd packages/mcp-server
pnpm install
cp .env.example .env
# .env에 GITHUB_TOKEN 입력
pnpm dev
```

### 3. Claude Desktop 연동

`~/Library/Application Support/Claude/claude_desktop_config.json` 파일에 추가:

```json
{
  "mcpServers": {
    "devlog": {
      "command": "npx",
      "args": ["tsx", "/절대경로/devlog/packages/mcp-server/src/index.ts"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 4. Claude Desktop에서 사용

```
"지난 주 내 GitHub 활동 요약해줘"
"올해 성과 정리해서 연봉협상 자료 만들어줘"
"내 코드 친절함 점수 분석해줘"
```

## 기술 스택

- **MCP 서버**: TypeScript, `@modelcontextprotocol/sdk`, `@octokit/graphql`
- **GitHub API**: GraphQL v4 (필요한 필드만 정확히 요청)
- **Data Compactor**: diff 원문 제거, 토큰 90% 절감
- **웹 대시보드** (예정): Next.js 15, NextAuth.js, Vercel Postgres

## 아키텍처 원칙

- **정량 데이터** (커밋 수, 그래프): DB + Recharts — LLM 환각 방지
- **정성 데이터** (임팩트 해석, 인사이트): Claude API 전담
- **Privacy Shield**: Phase 1 로컬 MCP는 코드가 외부 서버로 나가지 않음
