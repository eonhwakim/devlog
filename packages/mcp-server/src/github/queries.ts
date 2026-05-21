export const WEEKLY_SUMMARY_QUERY = `
  query WeeklySummary(
    $username: String!,
    $from: DateTime!,
    $to: DateTime!,
    $pullRequestCursor: String
  ) {
    user(login: $username) {
      name
      login
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 100, after: $pullRequestCursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
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
  query CollaborationScore(
    $username: String!,
    $from: DateTime!,
    $to: DateTime!
  ) {
    user(login: $username) {
      login
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`

export const COLLABORATION_PR_QUERY = `
  query CollaborationPullRequests(
    $username: String!,
    $from: DateTime!,
    $to: DateTime!,
    $pullRequestCursor: String
  ) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestContributions(first: 100, after: $pullRequestCursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
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
      }
    }
  }
`

export const COLLABORATION_REVIEW_QUERY = `
  query CollaborationReviews(
    $username: String!,
    $from: DateTime!,
    $to: DateTime!,
    $reviewCursor: String
  ) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        pullRequestReviewContributions(first: 100, after: $reviewCursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
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
        commitContributionsByRepository(maxRepositories: 100) {
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
  query AnnualReport(
    $username: String!,
    $from: DateTime!,
    $to: DateTime!,
    $pullRequestCursor: String
  ) {
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
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 100, after: $pullRequestCursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
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
