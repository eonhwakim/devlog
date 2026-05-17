import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-900">devlog</h1>
        <p className="mt-3 text-gray-500">
          GitHub 활동을 Claude가 분석해주는 개발자 리포트
        </p>

        <ul className="mt-8 space-y-2 text-left text-sm text-gray-600">
          {[
            '📊 주간 커밋·PR·리뷰 활동 요약',
            '💰 연봉협상용 연간 성과 리포트',
            '🤝 코드 점수 & 협업 지표 분석',
            '📈 기술 스택 변화 추이',
          ].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <form
          className="mt-8"
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/dashboard' })
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub로 로그인
          </button>
        </form>
      </div>
    </main>
  )
}
