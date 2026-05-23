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
      title: "Review-Driven",
      headline: "코드 작성보다 리뷰와 피드백에서 존재감이 더 크게 드러나는 흐름입니다.",
      aura: "mint",
      stats: [
        { label: "Clarity", value: `${Math.min(99, 52 + stats.reviews * 4)}` },
        { label: "Care", value: `${Math.min(99, 46 + stats.reviews * 5)}` },
        { label: "Taste", value: `${Math.min(99, 38 + stats.prs * 3)}` },
      ],
      toastCopy:
        "이번 기간에는 직접 구현한 양보다 리뷰와 의견 정리에서 더 강한 기여가 보입니다. 팀이 판단을 빠르게 내리도록 돕는 역할에 가까웠습니다.",
      roastCopy:
        "리뷰의 기준은 분명한 편이라, 이제 그 밀도를 본인 작업 기록에도 그대로 남기면 더 설득력이 커질 것 같습니다.",
    };
  }

  if (issueWeight >= refactorWeight) {
    return {
      title: "Issue Resolver",
      headline:
        "이슈를 빠르게 받아 정리하고, 실제 작업으로 연결하는 대응형 패턴이 강하게 보입니다.",
      aura: "sunset",
      stats: [
        { label: "Speed", value: `${Math.min(99, 50 + stats.issues * 6)}` },
        { label: "Impact", value: `${Math.min(99, 44 + stats.prs * 5)}` },
        { label: "Nerve", value: `${Math.min(99, 58 + stats.issues * 4)}` },
      ],
      toastCopy:
        "중요한 이슈가 생겼을 때 빠르게 반응하고 작업을 닫는 쪽에서 강점이 보입니다. 운영이나 안정화 국면에서 특히 믿고 맡기기 쉬운 흐름입니다.",
      roastCopy:
        "대응 속도는 강점이지만, 비슷한 유형의 일이 반복된다면 해결 자체보다 원인 정리까지 함께 가져가는 편이 더 좋습니다.",
    };
  }

  return {
    title: "System Builder",
    headline:
      "작업량 자체보다 구조를 다듬고 전체 흐름을 정리하는 쪽의 강점이 더 선명하게 보입니다.",
    aura: "ocean",
    stats: [
      { label: "Flow", value: `${Math.min(99, 48 + stats.commits * 2)}` },
      { label: "Depth", value: `${Math.min(99, 40 + stats.reposTouched * 8)}` },
      { label: "Polish", value: `${Math.min(99, 44 + stats.prs * 4)}` },
    ],
    toastCopy:
      "이번 기간의 기록은 단순히 많이 처리한 사람이라기보다, 나중에 유지보수하기 좋은 상태로 정리한 사람에 가깝습니다.",
    roastCopy:
      "정리와 구조화는 강점이지만, 바깥에서 보이는 성과로 연결되도록 대표 작업을 조금 더 선명하게 남기면 좋겠습니다.",
  };
}

function describeActivityDensity(activeDays: number, longestStreak: number) {
  if (activeDays >= 220) {
    return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 흐름이 있어, 짧은 스퍼트보다 꾸준히 누적하는 패턴에 가깝습니다.`;
  }
  if (activeDays >= 140) {
    return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 구간이 보여, 특정 시점에 몰아치기보다 주기적으로 흔적을 남기는 편으로 읽힙니다.`;
  }
  return `현재까지 ${activeDays}일 활동했고 최장 ${longestStreak}일 연속 구간이 보여, 강한 집중 구간이 있을 때 밀도를 높이는 타입에 더 가깝습니다.`;
}

function describePrSize(averagePRSize: number) {
  if (averagePRSize === 0) {
    return "최근 대표 PR 데이터가 많지 않아 PR 크기 패턴은 아직 뚜렷하게 읽히지 않습니다.";
  }
  if (averagePRSize < 120) {
    return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 작은 단위로 자주 나누며 리뷰 친화적으로 가져가는 경향이 보입니다.`;
  }
  if (averagePRSize < 320) {
    return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 과하게 잘게 쪼개지도 한 번에 너무 크게 묶지도 않는 균형형 패턴에 가깝습니다.`;
  }
  return `평균 PR 규모는 ${averagePRSize.toLocaleString()} lines로, 한 번에 다루는 변경 범위를 비교적 크게 가져가며 맥락 단위로 정리하는 흐름이 보입니다.`;
}

function describeRepoSpread(repoCount: number, topLanguage: string | null, recentPrCount: number) {
  if (repoCount >= 8) {
    return `${repoCount}개 레포를 오가며 ${topLanguage ?? "여러 기술"} 중심의 작업축을 유지해, 한 영역에만 머물기보다 맥락 전환이 잦은 편으로 보입니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
  }
  if (repoCount >= 4) {
    return `${repoCount}개 레포를 다루며 ${topLanguage ?? "주요 기술축"} 중심의 작업을 이어가, 깊이와 확장을 함께 가져가는 중간 폭의 패턴으로 읽힙니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
  }
  return `${repoCount}개 레포에 비교적 집중하며 ${topLanguage ?? "현재 작업축"} 위에서 맥락을 깊게 파고드는 흐름이 보입니다. PR 해석은 최근 대표 ${recentPrCount}건 기준입니다.`;
}

function describeDelivery(totalContributions: number, mergedCount: number, recentPrCount: number) {
  if (recentPrCount === 0) {
    return `총 ${totalContributions.toLocaleString()}회의 기여가 쌓였고, 최근 대표 PR 표본이 적어 머지 패턴은 조금 더 데이터가 모이면 선명해질 것 같습니다.`;
  }

  const mergeRate = Math.round((mergedCount / recentPrCount) * 100);
  const deliveryTone =
    mergeRate >= 80
      ? "열린 작업보다 실제로 닫힌 작업 비중이 높은 편입니다."
      : mergeRate >= 50
        ? "탐색과 완료가 함께 섞인 균형형 흐름으로 볼 수 있습니다."
        : "진행 중이거나 검토 중인 작업의 비중이 비교적 높은 편입니다.";

  return `총 ${totalContributions.toLocaleString()}회의 기여와 최근 대표 PR ${recentPrCount}건 기준 머지율 ${mergeRate}%를 보면, ${deliveryTone}`;
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
    `${peakMonthLabel}에 가장 높은 밀도로 활동했고, ${describeActivityDensity(activeDays, longestStreak)}`,
    describePrSize(averagePRSize),
    describeRepoSpread(
      contribution.totalRepositoriesWithContributedCommits,
      topLanguage,
      recentPRs.length,
    ),
    describeDelivery(
      contribution.contributionCalendar.totalContributions,
      mergedPRs.length,
      recentPRs.length,
    ),
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
