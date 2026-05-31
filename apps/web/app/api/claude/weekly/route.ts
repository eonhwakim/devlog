import { auth } from "@/auth";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const client = new Anthropic();

// ── 서버 인메모리 캐시 (프로세스 재시작 시 리셋) ─────────────────────────
const serverCache = new Map<string, { text: string; ts: number }>();
const SERVER_CACHE_TTL = 60 * 60 * 1000; // 1시간

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "로그인이 필요합니다" }), { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { stats, topRepos, recentPRs, period } = await req.json();

  // ── 서버 캐시 확인 ─────────────────────────────────────────────────────
  const userId = session.user?.email ?? session.user?.name ?? "unknown";
  const cacheKey = `${userId}_${period?.from}_${period?.to}`;
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < SERVER_CACHE_TTL) {
    return new Response(cached.text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "HIT" },
    });
  }

  const userPrompt = `아래는 GitHub 이번 주 활동 데이터야.

기간: ${period?.from} ~ ${period?.to}
커밋: ${stats?.commits}개 / PR: ${stats?.prs}개 / 리뷰: ${stats?.reviews}개 / 이슈: ${stats?.issues}개

주요 레포:
${(topRepos ?? [])
  .slice(0, 4)
  .map(
    (r: { name: string; commits: number; language?: string }) =>
      `- ${r.name} (${r.commits}커밋, ${r.language ?? "기타"})`,
  )
  .join("\n")}

이번 주 PR:
${(recentPRs ?? [])
  .slice(0, 5)
  .map(
    (pr: {
      state: string;
      title: string;
      repo: string;
      additions: number;
      deletions: number;
      impactScore: number;
    }) =>
      `- [${pr.state}] ${pr.title} (${pr.repo}) +${pr.additions}/-${pr.deletions}, 임팩트 ${pr.impactScore}/100`,
  )
  .join("\n")}

이 데이터를 바탕으로 **이번 주 개발 활동을 3~4문장으로 한국어로 해석**해줘.
- 수치를 단순 나열하지 말고, 이번 주 에너지가 어디에 집중됐는지, 어떤 흐름이 읽히는지 해석해줘.
- 가장 인상적인 PR이나 기여가 있다면 자연스럽게 언급해줘.
- 마크다운 없이 일반 텍스트로 써줘.`;

  try {
    // ── 스트리밍 없이 단일 응답으로 받아 캐시 ────────────────────────────
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";

    // 서버 캐시에 저장
    serverCache.set(cacheKey, { text, ts: Date.now() });

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Cache": "MISS" },
    });
  } catch (e: any) {
    console.error("[claude/weekly error]", e);
    return new Response(JSON.stringify({ error: e.message ?? "Claude API 오류" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
