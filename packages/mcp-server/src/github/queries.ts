export const WEEKLY_SUMMARY_QUERY = `
  query WeeklySummary($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      name
      login
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        commitContributionsByRepository(maxRepositories: 10) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 20) {
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
              commits(first: 20) {
                nodes {
                  commit { message }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const ANNUAL_REPORT_QUERY = `
  query AnnualReport($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      name
      login
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 20) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 50) {
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
              commits(first: 10) {
                nodes {
                  commit { message }
                }
              }
            }
          }
        }
      }
    }
  }
`
