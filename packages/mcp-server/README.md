# @eonhwakim/devlog-mcp

> GitHub 활동을 Claude가 분석해주는 MCP 서버

[![npm version](https://badge.fury.io/js/@eonhwakim%2Fdevlog-mcp.svg)](https://www.npmjs.com/package/@eonhwakim/devlog-mcp)

---

## 뭘 할 수 있나요?

Claude Desktop 채팅창에서 말로 물어보면 됩니다 (각 블록 우측 상단의 복사 버튼으로 그대로 붙여넣기 가능):

```text
지난 주 내 GitHub 활동 요약해줘
```

```text
올해 성과 정리해서 연봉협상 자료 만들어줘
```

```text
내 코드 점수 분석해줘
```

```text
최근 6개월 기술 스택 변화 보여줘
```

| 툴                        | 설명                               |
| ------------------------- | ---------------------------------- |
| `get_weekly_summary`      | 지난 7일 커밋·PR·리뷰 활동 요약    |
| `get_annual_report`       | 연간 성과 정리 (연봉협상 모드)     |
| `get_collaboration_score` | PR 품질·커밋 가독성·리뷰 어조 점수 |
| `get_tech_stack_trend`    | 월별 기술 스택 변화 추이           |

---

## 어떻게 쓰나요?

### 1단계 — GitHub Token 발급

[GitHub Settings → Developer settings → Tokens (classic)](https://github.com/settings/tokens/new)

- Note: `devlog-mcp`
- 권한: `repo` 체크, `read:user` 체크
- **Generate token** → 토큰 복사 (다시 못 봄!)

### 2단계 — Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json` 파일을 열어 아래 내용 추가:

```json
{
  "mcpServers": {
    "devlog": {
      "command": "npx",
      "args": ["-y", "@eonhwakim/devlog-mcp"],
      "env": {
        "GITHUB_TOKEN": "여기에_토큰_입력"
      }
    }
  }
}
```

### 3단계 — Claude Desktop 재시작

Claude Desktop을 완전히 종료(Cmd+Q) 후 다시 실행하면 망치(🔨) 아이콘이 생깁니다.

---

## 안전한가요? (Privacy Shield)

Phase 1 MCP 서버는 **로컬 환경에서만 실행**됩니다.

```
내 컴퓨터
├── Claude Desktop
├── devlog-mcp (로컬 실행)
└── GitHub API (직접 통신)
    ↑
외부 서버 없음 — 코드가 밖으로 나가지 않음
```

회사 Private Repository를 분석해도 소스코드가 외부 서버로 전송되지 않습니다.

---

## 아키텍처

- **GitHub GraphQL v4** — 필요한 필드만 정확히 요청, over-fetching 없음
- **Data Compactor** — PR diff 원문 제거, 토큰 비용 90% 절감
- **정량/정성 분리** — 수치는 코드가, 해석은 Claude가 (LLM 환각 방지)

---

## 기여 / 이슈

[GitHub Repository](https://github.com/eonhwakim/devlog)에서 이슈와 PR 환영합니다.
