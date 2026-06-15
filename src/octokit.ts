import type { Octokit } from '@octokit/core';

export async function hasWriteAccess(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string,
): Promise<boolean> {
  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/collaborators/{username}/permission',
    { owner, repo, username },
  );

  return data.permission === 'admin' || data.permission === 'write';
}
