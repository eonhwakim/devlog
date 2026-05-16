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

export const COLLABORATION_SCORE_QUERY = `
  query CollaborationScore($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      login
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestContributions
        totalPullRequestReviewContributions
        pullRequestContributions(first: 30) {
          nodes {
            pullRequest {
              title
              body
              commits(first: 30) {
                nodes {
                  commit { message }
                }
              }
            }
          }
        }
        pullRequestReviewContributions(first: 30) {
          nodes {
            pullRequestReview {
              body
              state
              comments(first: 5) {
                nodes { body }
              }
            }
          }
        }
      }
    }
  }
`

export const MONTHLY_LANG_QUERY = `
  query MonthlyLang($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 20) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
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
