import { graphql } from '@octokit/graphql'

export type GitHubClient = typeof graphql

export function createGitHubClient(): GitHubClient {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN 환경변수가 필요합니다.\n' +
      '발급: https://github.com/settings/tokens'
    )
  }
  return graphql.defaults({
    headers: { authorization: `token ${token}` },
  })
}
