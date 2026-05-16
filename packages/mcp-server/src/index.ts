import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { getWeeklySummary } from './tools/weekly-summary.js'
import { getAnnualReport } from './tools/annual-report.js'

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
            description: 'GitHub 유저명 (예: eonhwakim)',
          },
          repo: {
            type: 'string',
            description: '(선택) 특정 레포지토리만 필터링',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'get_annual_report',
      description:
        '연봉협상 모드. 연간 GitHub 성과를 정리해 면접/리뷰 답변 스타일로 요약합니다.',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'GitHub 유저명',
          },
          year: {
            type: 'number',
            description: '분석할 연도 (기본값: 현재 연도)',
          },
        },
        required: ['username'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'get_weekly_summary':
        return await getWeeklySummary(args as { username: string; repo?: string })
      case 'get_annual_report':
        return await getAnnualReport(args as { username: string; year?: number })
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
