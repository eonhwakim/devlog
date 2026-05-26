import { auth, signIn } from "@/auth";
import { NeuralBloom } from "@/components/landing/NeuralBloom";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030508] text-white">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 flex translate-x-4 items-center justify-center opacity-40 md:translate-x-8 lg:translate-x-12">
        <div className="scale-[1.1] md:scale-[1.3] lg:scale-[1.5]">
          <NeuralBloom />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_36%,rgba(73,195,255,0.12),transparent_16%),radial-gradient(circle_at_66%_58%,rgba(89,101,255,0.15),transparent_24%),radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.06),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black_36%,transparent_100%)] bg-[size:110px_110px] opacity-30" />
      <div className="pointer-events-none absolute top-[14%] left-[52%] z-0 h-[34rem] w-[34rem] rounded-full bg-cyan-300/8 blur-[140px]" />
      <div className="pointer-events-none absolute top-[26%] right-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-blue-500/12 blur-[140px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        {/* <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 shadow-[0_10px_35px_rgba(0,0,0,0.25)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.45)]">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-black tracking-tight text-white">devlog-mcp</span>
              <span className="text-white/30">/</span>
              <span className="font-medium text-white/70">wrapped</span>
            </div>
          </div>
        </header> */}

        <section className="relative z-10 flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="flex max-w-[720px] flex-col items-center">
            <p className="text-[11px] font-black tracking-[0.34em] text-cyan-200/58 uppercase">
              Animated GitHub Intelligence
            </p>

            <h1 className="mt-6 text-6xl leading-[0.96] font-black tracking-[-0.04em] text-white md:text-[6.5rem]">
              The Code <br />
              <span
                className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 24px rgba(103,232,249,0.18))" }}
              >
                Behind You.
              </span>
            </h1>

            <p className="mt-7 max-w-[500px] text-base leading-8 text-white/66 md:text-lg">
              당신의 GitHub 기여를 살아 숨 쉬는 뉴럴 네트워크로 만나보세요. <br />
              1년간의 개발 여정을 새로운 시각으로 분석합니다.
            </p>

            <form
              className="mt-10"
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="group inline-flex w-full max-w-[320px] items-center justify-center gap-3 rounded-2xl border border-cyan-300/16 bg-gradient-to-r from-cyan-300 to-sky-400 px-6 py-4 text-base font-black text-[#041018] shadow-[0_12px_40px_rgba(34,211,238,0.24)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_18px_50px_rgba(34,211,238,0.34)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub로 시작하기
              </button>
            </form>

            <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-2">
              <div className="group relative overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-cyan-950/20 p-6 backdrop-blur-md transition-all hover:bg-cyan-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">
                  01 / 나만의 대시보드
                </p>
                <p className="mt-2 text-lg font-bold text-white">12개월 활동 한눈에</p>
                <p className="mt-1 text-sm leading-relaxed text-cyan-100/60">
                  365일 커밋이 뉴런처럼 발화하는 Neural Map, 시간대별 골든 타임, 언어 분포, AI 협업
                  스코어까지. 내 GitHub가 어떻게 살아있었는지 보여줍니다.
                </p>
                <ul className="mt-3 space-y-1">
                  {[
                    "Neural Activity Map — 마우스로 반응하는 뉴럴 시각화",
                    "24시간 Activity Pattern · 언어 비중 분석",
                    "AI 협업 스코어 · 연봉 협상 레포트",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5 text-[11px] text-cyan-200/50"
                    >
                      <span className="mt-0.5 text-cyan-400/60">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:bg-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">
                  02 / 퍼스널 페이지
                </p>
                <p className="mt-2 text-lg font-bold text-white">나만의 GitHub Wrapped</p>
                <p className="mt-1 text-sm leading-relaxed text-white/50">
                  5개 씬을 스크롤하며 펼쳐지는 몰입형 경험. Epic PR 스토리부터 생체리듬 분석, 코드
                  소울메이트까지 — 뉴런이 반응하는 인터랙티브 공간입니다.
                </p>
                <ul className="mt-3 space-y-1">
                  {[
                    "Epic PR — 올해 가장 뜨거웠던 PR 한 편",
                    "생체리듬 — 나는 새벽형인가, 저녁형인가",
                    "소울메이트 — 가장 많이 내 코드를 봐준 동료",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] text-white/35">
                      <span className="mt-0.5 text-white/25">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
