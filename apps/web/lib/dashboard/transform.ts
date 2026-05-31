import {
  describeActivityDensity,
  describeDelivery,
  describePrSize,
  describeRepoSpread,
} from "./insights";
import { buildPersona } from "./persona";
import type { DashboardQueryResult } from "./query";

export function buildDashboardViewModel(data: DashboardQueryResult, from: Date, now: Date) {
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

  const viewer = {
    login: data.viewer.login,
    name: data.viewer.name,
  };

  return {
    viewer,
    periodLabel: `${from.toLocaleDateString("ko-KR")} - ${now.toLocaleDateString("ko-KR")}`,
    totalContributions: contribution.contributionCalendar.totalContributions,
    stats,
    dailyActivity,
    recentPRs,
    topRepos,
    summaryCards,
    insightLines,
    persona,
  };
}
