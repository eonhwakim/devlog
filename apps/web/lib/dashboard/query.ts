export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface DashboardQueryResult {
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

export const DASHBOARD_QUERY = `
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
