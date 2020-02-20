import { get } from 'lodash'
import { STAGING_BRANCH } from '../consts'
import ManifestSet from '../ManifestSet'
import Manifest from '../Manifest'
import RepoState from '../RepoState'

const DEPLOY_TAG_RE = /deploy-\d\d\d\d-\d\d-\d\d-\d\d-\d\d-\d\d/

export default function repoStateReducer(mset: ManifestSet, repo: RepoState): ManifestSet {
  const prodDeployTag = Object.keys(repo.tags)
    .filter(t => t.match(DEPLOY_TAG_RE))
    .sort()
    .reverse()[0]
  console.log('tags!')
  console.log(repo.name)
  console.log(repo.tags)
  const prodHash = repo.tags[prodDeployTag]
  const stagingHash = get(repo, `branches.${STAGING_BRANCH}`)

  return {
    ...mset,
    staging: {
      ...mset.staging,
      ...(stagingHash == null) ? null : { [repo.name]: stagingHash.slice(0, 7) },
    },
    production: {
      ...mset.production,
      ...(prodHash == null) ? null : { [repo.name]: prodHash.slice(0, 7) },
    },
  }
}
