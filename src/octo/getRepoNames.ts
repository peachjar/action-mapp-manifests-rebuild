import * as github from '@actions/github'
import * as Core from '@actions/core'
import { ORG_NAME } from '../consts'

const REPO_NAME_RE = /^(mapp-|stargate-).*$/

// Returns an array of repo names that will be included in the manifest
export default async function getRepoNames(
  octo: github.GitHub,
  core: typeof Core
): Promise<string[]> {
  const repos = await octo.repos.listForOrg({
    org: ORG_NAME,
    sort: 'pushed',
    per_page: 100,
  })

  const repoNames = repos.data
    .map(r => r.name)
    .filter(name => {
      core.debug(`repo name: ${name}`)
      return REPO_NAME_RE.exec(name) !== null
    })

  return repoNames
}
