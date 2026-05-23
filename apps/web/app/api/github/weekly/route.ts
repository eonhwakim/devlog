import { auth } from "@/auth";
import { graphql } from "@octokit/graphql";
import { NextResponse } from "next/server";

const WEEKLY_QUERY = `
  query WeeklySummary($from: DateTime!, $to: DateTime!) {
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
        commitContributionsByRepository(maxRepositories: 8) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 10) {
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

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  });

  const now = new Date();
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const data = await client<any>(WEEKLY_QUERY, {
    from: from.toISOString(),
    to: now.toISOString(),
  });

  const c = data.viewer.contributionsCollection;

  // 최근 7일 일별 활동 (chart용)
  const dailyActivity = c.contributionCalendar.weeks
    .flatMap((w: any) => w.contributionDays)
    .slice(-7)
    .map((d: any) => ({ date: d.date, count: d.contributionCount }));

  return NextResponse.json({
    username: data.viewer.login,
    name: data.viewer.name,
    period: {
      from: from.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    },
    stats: {
      commits: c.totalCommitContributions,
      prs: c.totalPullRequestContributions,
      reviews: c.totalPullRequestReviewContributions,
      issues: c.totalIssueContributions,
    },
    dailyActivity,
    topRepos: c.commitContributionsByRepository.map((r: any) => ({
      name: r.repository.name,
      language: r.repository.primaryLanguage?.name ?? null,
      commits: r.contributions.totalCount,
    })),
    recentPRs: c.pullRequestContributions.nodes
      .map((n: any) => {
        const pr = n.pullRequest;
        const churn = pr.additions + pr.deletions;
        const reviews = pr.reviews?.totalCount ?? 0;
        const impactScore = Math.round(
          Math.min(
            100,
            Math.min(70, churn / 50) +
              Math.min(15, reviews * 5) +
              (pr.state === "MERGED" ? 15 : pr.state === "OPEN" ? 8 : 0),
          ),
        );
        return {
          title: pr.title,
          repo: pr.baseRepository?.name ?? "",
          state: pr.state,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changedFiles ?? 0,
          reviews,
          mergedAt: pr.mergedAt,
          impactScore,
        };
      })
      .sort((a: any, b: any) => b.impactScore - a.impactScore),
  });
}
