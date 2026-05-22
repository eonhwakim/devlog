import { auth } from "@/auth";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPageStateProvider } from "@/components/dashboard/DashboardPageState";
import { redirect } from "next/navigation";

interface DashboardQueryResult {
  viewer: {
    name: string | null;
    login: string;
    contributionsCollection: {
      totalRepositoriesWithContributedCommits: number;
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            contributionCount: number;
            date: string;
          }>;
        }>;
      };
      commitContributionsByRepository: Array<{
        repository: {
          name: string;
          primaryLanguage: { name: string } | null;
        };
        contributions: {
          totalCount: number;
        };
      }>;
      pullRequestContributions: {
        nodes: Array<{
          pullRequest: {
            title: string;
            state: string;
            additions: number;
            deletions: number;
            changedFiles: number;
            mergedAt: string | null;
            baseRepository: { name: string } | null;
            reviews: { totalCount: number };
          };
        }>;
      };
    };
  };
}

function buildPersona(stats: {
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  reposTouched: number;
}) {
  const reviewWeight = stats.reviews * 2;
  const issueWeight = stats.issues * 2 + stats.prs;
  const refactorWeight = stats.commits + stats.reposTouched;

  if (reviewWeight >= issueWeight && reviewWeight >= refactorWeight) {
    return {
      title: "The Kind Reviewer",
      headline: "팀이 지나친 디테일까지도 놓치지 않게 만드는, 신뢰도 높은 리뷰어 흐름입니다.",
      aura: "mint",
      stats: [
        { label: "Clarity", value: `${Math.min(99, 52 + stats.reviews * 4)}` },
        { label: "Care", value: `${Math.min(99, 46 + stats.reviews * 5)}` },
        { label: "Taste", value: `${Math.min(99, 38 + stats.prs * 3)}` },
      ],
      toastCopy:
        "이번 주 당신의 존재감은 코드보다 대화에서 더 크게 드러났습니다. 리뷰로 팀의 판단 비용을 줄여준 타입이에요.",
      roastCopy:
        "리뷰는 훌륭했는데, 이제 본인 코드에도 그 기준을 조금 더 잔인하게 적용할 타이밍일지도 모릅니다.",
    };
  }

  if (issueWeight >= refactorWeight) {
    return {
      title: "The Firefighter",
      headline:
        "문제가 생기면 결국 호출되는 사람처럼, 이슈와 PR을 빠르게 연결하는 주간 흐름입니다.",
      aura: "sunset",
      stats: [
        { label: "Speed", value: `${Math.min(99, 50 + stats.issues * 6)}` },
        { label: "Impact", value: `${Math.min(99, 44 + stats.prs * 5)}` },
        { label: "Nerve", value: `${Math.min(99, 58 + stats.issues * 4)}` },
      ],
      toastCopy:
        "매끄러운 주간은 아니었어도, 중요한 순간마다 판을 안정시킨 사람이었습니다. 팀 입장에선 꽤 든든한 패턴이에요.",
      roastCopy:
        "문제가 생기면 가장 먼저 움직였네요. 다만 너무 자주 소방 출동 중이라면, 어딘가에 불씨를 그냥 두고 있는 걸 수도 있습니다.",
    };
  }

  return {
    title: "The Refactoring Wizard",
    headline:
      "여러 저장소와 커밋 흐름을 보면, 복잡도를 덜어내고 구조를 다듬는 쪽에 강한 개발자 패턴입니다.",
    aura: "ocean",
    stats: [
      { label: "Flow", value: `${Math.min(99, 48 + stats.commits * 2)}` },
      { label: "Depth", value: `${Math.min(99, 40 + stats.reposTouched * 8)}` },
      { label: "Polish", value: `${Math.min(99, 44 + stats.prs * 4)}` },
    ],
    toastCopy:
      "이번 주 기록은 많이 고친 사람보다, 더 나은 상태로 정리한 사람에 가깝습니다. 팀이 나중에 편해질 흔적이 보여요.",
    roastCopy:
      "정리는 잘했는데, 너무 우아하게 다듬다 보면 정작 드라마틱한 한 방이 안 보일 수 있습니다. 가끔은 존재감도 남겨보죠.",
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const { graphql } = await import("@octokit/graphql");

  const DASHBOARD_QUERY = `
    query DashboardSummary($from: DateTime!, $to: DateTime!) {
      viewer {
        name
        login
        contributionsCollection(from: $from, to: $to) {
          totalRepositoriesWithContributedCommits
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 12) {
            repository {
              name
              primaryLanguage { name }
            }
            contributions { totalCount }
          }
          pullRequestContributions(first: 24) {
            nodes {
              pullRequest {
                title
                state
                additions
                deletions
                changedFiles
                mergedAt
                baseRepository { name }
                reviews { totalCount }
              }
            }
          }
        }
      }
    }
  `;

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  });

  const now = new Date();
  const from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const data = await client<DashboardQueryResult>(DASHBOARD_QUERY, {
    from: from.toISOString(),
    to: now.toISOString(),
  });

  const contribution = data.viewer.contributionsCollection;
  const dailyActivity = contribution.contributionCalendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({
      date: day.date,
      count: day.contributionCount,
    }));

  const recentPRs = contribution.pullRequestContributions.nodes.map((node) => ({
    title: node.pullRequest.title,
    repo: node.pullRequest.baseRepository?.name ?? "",
    state: node.pullRequest.state,
    additions: node.pullRequest.additions,
    deletions: node.pullRequest.deletions,
    changedFiles: node.pullRequest.changedFiles,
    mergedAt: node.pullRequest.mergedAt,
    reviews: node.pullRequest.reviews.totalCount,
  }));

  const topRepos = contribution.commitContributionsByRepository.map((repo) => ({
    name: repo.repository.name,
    language: repo.repository.primaryLanguage?.name ?? null,
    commits: repo.contributions.totalCount,
  }));

  const stats = {
    commits: contribution.totalCommitContributions,
    prs: contribution.totalPullRequestContributions,
    reviews: contribution.totalPullRequestReviewContributions,
    issues: contribution.totalIssueContributions,
  };

  const mergedPRs = recentPRs.filter((pr) => pr.state === "MERGED");
  const totalAdditions = recentPRs.reduce((sum, pr) => sum + pr.additions, 0);
  const totalDeletions = recentPRs.reduce((sum, pr) => sum + pr.deletions, 0);
  const activeDays = dailyActivity.filter((day) => day.count > 0).length;

  let longestStreak = 0;
  let currentStreak = 0;
  for (const day of dailyActivity) {
    if (day.count > 0) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const monthlyMap = new Map<string, number>();
  dailyActivity.forEach((day) => {
    const monthKey = day.date.slice(0, 7);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + day.count);
  });
  const peakMonthEntry = [...monthlyMap.entries()].sort((a, b) => b[1] - a[1])[0] ?? [
    from.toISOString().slice(0, 7),
    0,
  ];
  const peakMonthLabel = new Date(`${peakMonthEntry[0]}-01T00:00:00`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  const topLanguage = topRepos[0]?.language ?? null;
  const strongestRepo = topRepos[0] ?? null;
  const highImpactPR =
    [...recentPRs].sort(
      (a, b) =>
        b.additions + b.deletions + b.reviews * 120 - (a.additions + a.deletions + a.reviews * 120),
    )[0] ?? null;

  const averagePRSize =
    recentPRs.length > 0
      ? Math.round(
          recentPRs.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0) / recentPRs.length,
        )
      : 0;

  const insightLines = [
    `${peakMonthLabel}에 가장 높은 밀도로 활동했고, 현재까지 ${activeDays}일 동안 흔적을 남겼습니다.`,
    `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 작게 쪼개기보다는 맥락 있는 단위로 밀어붙이는 패턴이 보입니다.`,
    `${contribution.totalRepositoriesWithContributedCommits}개 레포를 건드리며 ${topLanguage ?? "다양한"} 중심의 작업축을 유지했습니다. PR 해석은 최근 대표 ${recentPRs.length}건 기준입니다.`,
    `총 ${contribution.contributionCalendar.totalContributions.toLocaleString()}회의 기여와 최근 대표 PR ${recentPRs.length}건 기준 머지율 ${recentPRs.length > 0 ? Math.round((mergedPRs.length / recentPRs.length) * 100) : 0}%는 실제로 닫힌 작업 비중을 보여줍니다.`,
  ];
  const summaryCards = [
    { label: "총 커밋", value: contribution.totalCommitContributions.toLocaleString() },
    { label: "활동일", value: activeDays.toLocaleString() },
    {
      label: "기여 레포",
      value: contribution.totalRepositoriesWithContributedCommits.toLocaleString(),
    },
  ];

  const persona = buildPersona({
    ...stats,
    reposTouched: topRepos.length,
  });

  return (
    <DashboardPageStateProvider>
      <div className="dashboard-shell dashboard-theme-toast min-h-screen font-sans">
        <div className="dashboard-noise" />
        <DashboardHeader
          viewer={{
            login: data.viewer.login,
            name: data.viewer.name,
          }}
        />
        <DashboardExperience
          viewer={{
            login: data.viewer.login,
            name: data.viewer.name,
          }}
          periodLabel={`${from.toLocaleDateString("ko-KR")} - ${now.toLocaleDateString("ko-KR")}`}
          totalContributions={contribution.contributionCalendar.totalContributions}
          stats={stats}
          dailyActivity={dailyActivity}
          recentPRs={recentPRs}
          topRepos={topRepos}
          summaryCards={summaryCards}
          insightLines={insightLines}
          persona={persona}
        />
      </div>
    </DashboardPageStateProvider>
  );
}
