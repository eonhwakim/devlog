import { auth } from "@/auth";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "로그인이 필요합니다" }), { status: 401 });
  }

  const annualData = await req.json();

  const systemPrompt = `당신은 시니어 개발자의 커리어 어드바이저입니다.
GitHub 연간 활동 데이터를 분석해 연봉협상에서 실제로 쓸 수 있는 성과 리포트를 작성합니다.
- 숫자와 구체적 사실을 최우선으로 사용하세요.
- "~했습니다" 같은 단순 나열을 피하고, 반드시 해석과 의미를 붙이세요.
- 채용 담당자나 기술 리뷰어가 읽는다고 가정하고 영향력을 강조하세요.
- 마크다운 형식으로 작성하세요 (##, ###, **, - 등 사용).
- 한국어로 작성하세요.
- 보고서는 짧은 소개문이 아니라, MBTI/직무진단 리포트처럼 읽히는 상세 분석 문서여야 합니다.
- 각 섹션마다 "사실", "해석", "비즈니스/조직적 의미"가 모두 들어가야 합니다.
- 데이터로 뒷받침되지 않는 과장 표현은 금지합니다.
- 문장은 짧게 끊되, 내용은 충분히 깊고 길게 작성하세요.`;

  const userPrompt = `아래 GitHub 연간 활동 데이터를 분석해 연봉협상용 성과 리포트를 작성해주세요.

## 데이터
\`\`\`json
${JSON.stringify(annualData, null, 2)}
\`\`\`

## 작성 원칙
- 리포트는 "요약본"이 아니라 "정밀 진단 보고서"처럼 작성하세요.
- 숫자를 먼저 제시하고, 그 숫자가 어떤 업무 성향과 역량을 시사하는지 자세히 해석하세요.
- 독자가 "이 사람은 어떤 방식으로 일하는 개발자인가?"를 선명히 이해할 수 있어야 합니다.
- 활동량이 많다/적다 수준에서 끝내지 말고, 일의 스타일, 집중 방식, 협업 패턴, 성장 궤적까지 분석하세요.
- 모든 섹션은 최소 2개 이상의 문단 또는 충분한 불릿으로 작성하세요.
- PR/리뷰/언어/월별 추세/레포 분포를 서로 연결해 입체적으로 해석하세요.

## 리포트 구조 (이 순서대로 자세히 작성)

### 1. 한눈에 보는 총평
- 5~7문장
- 이 개발자의 올해 일하는 방식과 성과를 임팩트 중심으로 요약
- 총 기여, PR, 리뷰, 코드 변경량, 대표 언어, 피크 월을 반드시 포함

### 2. 핵심 성과 진단
- 단순 수치 나열이 아니라 "무엇을 많이 했는가"와 "왜 의미 있는가"를 연결
- 산출량, 범위, 지속성, 난이도 신호를 나눠 해석
- 가장 인상적인 레포/PR/활동 시기를 구체적으로 짚기

### 3. 업무 스타일 프로파일
- 이 개발자가 어떤 방식으로 문제를 푸는지 상세 분석
- 예시 관점: 꾸준형/집중형, 넓게 기여하는 타입인지 깊게 파는 타입인지, 실행 중심인지 품질 중심인지
- 반드시 데이터 근거를 붙여 설명

### 4. 기술 역량 프로파일
- 언어 분포, 레포 분산도, 큰 PR, 코드 변경 규모를 바탕으로 기술적 강점 분석
- 전문성, 적응력, 제품 기여력, 유지보수/개선형 성향을 구분해서 설명
- 단순히 "TypeScript를 많이 씀"에서 끝내지 말고 경력적 의미까지 해석

### 5. 협업 성향 프로파일
- PR 병합률, 리뷰 수, 평균 리뷰 길이, 많이 리뷰받은 PR 등을 바탕으로 분석
- 혼자 잘하는 개발자인지, 팀 안에서 조율 가능한 개발자인지, 피드백 루프를 어떻게 다루는지 해석
- 동료/리드/매니저가 체감할 장점을 묘사

### 6. 성장 궤적 분석
- 월별 활동 변화, 피크 월, 최장 연속 활동일, 최근 흐름을 바탕으로 성장 패턴 분석
- "일시적 스퍼트"인지 "지속 가능한 성장"인지 구분
- 내년 확장 가능성이 높은 방향도 제안

### 7. 연봉협상에서 강하게 말할 포인트 5가지
- 각 포인트는 반드시 다음 구조로 작성
- **관찰된 사실**
- **해석**
- **회사 입장에서의 가치**
- **실제로 말할 수 있는 협상 문장**

### 8. 리스크 또는 보완 포인트
- 약점 지적이 목적이 아니라, 더 높은 평가를 받기 위해 무엇을 보완하면 좋은지 설명
- 데이터 한계도 솔직히 언급

### 9. 최종 평가
- 이 개발자를 한 줄로 정의
- 연봉협상장에서 어떤 포지셔닝으로 가져가면 좋은지 4~6문장으로 정리`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      cache_control: { type: "ephemeral" }, // 5분간 캐시
      messages: [{ role: "user", content: userPrompt }],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: any) {
    console.error("[claude/analyze error]", e);
    return new Response(JSON.stringify({ error: e.message ?? "Claude API 오류" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
