import { graphql } from '@octokit/graphql'
import { VIEWER_LOGIN_QUERY } from './queries.js'

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

export async function resolveGitHubUsername(
  client: GitHubClient,
  username?: string
): Promise<string> {
  if (username?.trim()) return username.trim()

  const data = await client<{ viewer: { login: string } }>(VIEWER_LOGIN_QUERY)
  return data.viewer.login
}
