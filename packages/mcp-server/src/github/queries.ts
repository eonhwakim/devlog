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
              body
              state
              additions
              deletions
              changedFiles
              mergedAt
              baseRepository { name }
              reviews { totalCount }
              commits(first: 30) {
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

export const VIEWER_LOGIN_QUERY = `
  query ViewerLogin {
    viewer {
      login
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
        pullRequestContributions(first: 100) {
          nodes {
            pullRequest {
              title
              body
              commits(first: 50) {
                nodes {
                  commit { message }
                }
              }
            }
          }
        }
        pullRequestReviewContributions(first: 100) {
          nodes {
            pullRequestReview {
              body
              state
              comments(first: 10) {
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
        commitContributionsByRepository(maxRepositories: 30) {
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
        commitContributionsByRepository(maxRepositories: 30) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 100) {
          nodes {
            pullRequest {
              title
              body
              state
              additions
              deletions
              changedFiles
              mergedAt
              baseRepository { name }
              reviews { totalCount }
              commits(first: 30) {
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
