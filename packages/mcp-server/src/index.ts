import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { getWeeklySummary } from './tools/weekly-summary.js'
import { getAnnualReport } from './tools/annual-report.js'
import { getCollaborationScore } from './tools/collaboration-score.js'
import { getTechStackTrend } from './tools/tech-stack-trend.js'

const server = new Server(
  { name: 'devlog-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_weekly_summary',
      description:
        'GitHub 주간 활동 요약. 커밋, PR, 리뷰, 이슈를 분석해 한국어 인사이트를 제공합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'GitHub 유저명 (생략 시 현재 인증된 GitHub 계정)',
          },
          repo: {
            type: 'string',
            description: '(선택) 특정 레포지토리만 필터링',
          },
        },
      },
    },
    {
      name: 'get_annual_report',
      description:
        '연봉협상 모드. 연간 GitHub 성과를 정리해 면접/리뷰 답변 스타일로 요약합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'GitHub 유저명 (생략 시 현재 인증된 GitHub 계정)' },
          year: { type: 'number', description: '분석할 연도 (기본값: 현재 연도)' },
        },
      },
    },
    {
      name: 'get_collaboration_score',
      description:
        '코드 점수 분석. PR 본문 명확성, 커밋 메시지 가독성, 코드 리뷰 참여도와 어조를 종합해 개발자 코드 점수를 산출합니다. "코드 점수", "개발 점수", "협업 점수" 관련 요청에 사용하세요.',
      inputSchema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'GitHub 유저명 (생략 시 현재 인증된 GitHub 계정)' },
          weeks: { type: 'number', description: '분석 기간 (기본값: 4주)' },
        },
      },
    },
    {
      name: 'get_tech_stack_trend',
      description:
        '기술 스택 변화 추이. 월별 언어/기술 사용 패턴을 시각화해 성장 방향을 분석합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'GitHub 유저명 (생략 시 현재 인증된 GitHub 계정)' },
          months: { type: 'number', description: '분석 기간 (기본값: 6개월)' },
        },
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'get_weekly_summary':
        return await getWeeklySummary(args as { username?: string; repo?: string })
      case 'get_annual_report':
        return await getAnnualReport(args as { username?: string; year?: number })
      case 'get_collaboration_score':
        return await getCollaborationScore(args as { username?: string; weeks?: number })
      case 'get_tech_stack_trend':
        return await getTechStackTrend(args as { username?: string; months?: number })
      default:
        return {
          content: [{ type: 'text' as const, text: `알 수 없는 툴: ${name}` }],
          isError: true,
        }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: 'text' as const, text: `오류: ${message}` }],
      isError: true,
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
