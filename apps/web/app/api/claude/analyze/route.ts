import { auth } from '@/auth'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return new Response(JSON.stringify({ error: '로그인이 필요합니다' }), { status: 401 })
  }

  const annualData = await req.json()

  const systemPrompt = `당신은 시니어 개발자의 커리어 어드바이저입니다.
GitHub 연간 활동 데이터를 분석해 연봉협상에서 실제로 쓸 수 있는 성과 리포트를 작성합니다.
- 숫자와 구체적 사실을 최우선으로 사용하세요.
- "~했습니다" 같은 나열보다 임팩트 중심으로 서술하세요.
- 채용 담당자나 기술 리뷰어가 읽는다고 가정하고 영향력을 강조하세요.
- 마크다운 형식으로 작성하세요 (##, ###, **, - 등 사용).
- 한국어로 작성하세요.`

  const userPrompt = `아래 GitHub 연간 활동 데이터를 분석해 연봉협상용 성과 리포트를 작성해주세요.

## 데이터
\`\`\`json
${JSON.stringify(annualData, null, 2)}
\`\`\`

## 리포트 구조 (이 순서대로 작성)

### 1. 핵심 성과 요약 (Executive Summary)
- 3~4문장으로 이 개발자가 올해 무엇을 이뤄냈는지 임팩트 중심으로 요약
- 총 기여 횟수, 코드 변경량(+추가/-삭제), 주요 언어 등 핵심 수치 포함

### 2. 정량적 성과
- 커밋, PR, 코드 리뷰, 이슈 처리 수치를 구체적으로
- 코드 추가/삭제 규모 분석
- 기여 레포지토리 수 및 주요 레포

### 3. 기술 스택 & 성장
- 사용 언어 분포와 강점 분석
- 다양성 또는 전문성 측면에서 강점 서술

### 4. 협업 & 코드 품질 지표
- PR 병합률, 리뷰 참여도 분석
- 협업 능력 및 코드 기여 방식 해석

### 5. 연봉협상 포인트 (3가지)
- 위 데이터를 근거로 협상 테이블에서 꺼낼 수 있는 구체적 포인트 3가지
- 각 포인트는 "숫자/사실 → 의미 → 가치" 구조로 작성`

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      stream: true,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
        } catch (e) {
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (e: any) {
    console.error('[claude/analyze error]', e)
    return new Response(
      JSON.stringify({ error: e.message ?? 'Claude API 오류' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
