import * as github from '@actions/github'
import * as Octokit from '@octokit/rest'
import { get, compact } from 'lodash'
import RepoState from '../RepoState'
import {
  ORG_NAME,
  STAGING_BRANCH,
} from '../consts'

// Return undefined if promise is rejected for 404
function safetyPromise<T>(
  p: Promise<T>,
): Promise<T> {
  return new Promise(async (res, rej) => {
      try {
        res(
          await p
        )
      } catch (e) {
        // @ts-ignore (lodash is inaccurately typed) :(
        if (get(e, 'data.status' == 404)) {
          // If this was rejected for a 404 specifically, resolve undefined
          res(undefined)
          return
        } else {
          rej(e)
        }
      }
  })
}

async function getRepoStateFromRepoName(
  octo: github.GitHub,
  repoName: string,
): Promise<RepoState> {

  const [ stagingBranch, deployTags ] = await Promise.all([
    // If 404, the staging branch will be ignored
    safetyPromise(
      octo.repos.getBranch({
        owner: ORG_NAME,
        repo: repoName,
        branch: STAGING_BRANCH,
      })
    ),
    octo.repos.listTags({
      owner: ORG_NAME,
      repo: repoName,
      // TODO: add pagination support some day
      per_page: 100,
    })
  ])

  const branches = compact([stagingBranch.data]).reduce((acc, val) => ({
    ...acc,
    [val.name]: val.commit.sha,
  }), {})

  const tags = deployTags.data.reduce((acc, val) => ({
    ...acc,
    [val.name]: val.commit.sha,
  }), {})

  return {
    name: repoName,
    tags,
    branches,
  }
}

export default async function getRepoStates(
  octo: github.GitHub,
  repoNames: string[],
): Promise<RepoState[]> {
  const states = await Promise.all(
    repoNames.map(n => getRepoStateFromRepoName(octo, n))
  )

  return states
}
