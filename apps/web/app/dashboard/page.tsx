import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPageStateProvider } from "@/components/dashboard/DashboardPageState";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { redirect } from "next/navigation";

interface DashboardQueryResult {
  viewer: {
    name: string | null;
    login: string;
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      contributionCalendar: {
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
            mergedAt: string | null;
            baseRepository: { name: string } | null;
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
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 6) {
            repository {
              name
              primaryLanguage { name }
            }
            contributions { totalCount }
          }
          pullRequestContributions(first: 8) {
            nodes {
              pullRequest {
                title
                state
                additions
                deletions
                mergedAt
                baseRepository { name }
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
    mergedAt: node.pullRequest.mergedAt,
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
          stats={stats}
          dailyActivity={dailyActivity}
          recentPRs={recentPRs}
          topRepos={topRepos}
          persona={persona}
        />
      </div>
    </DashboardPageStateProvider>
  );
}
