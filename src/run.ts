import { promises as fs } from 'fs'
import { promisify } from 'util'
import { exec as execCb } from 'child_process'
const exec = promisify(execCb)
import { get } from 'lodash'
import { AxiosInstance, AxiosError } from 'axios'
import { Context } from '@actions/github/lib/context'
import * as Core from '@actions/core'
import * as Github from '@actions/github'
import getRepoNames from './octo/getRepoNames'
import getRepoStates from './octo/getRepoStates'
import generateManifests from './manifests/generateManifests'

export default async function run(
  context: Context,
  core: typeof Core,
): Promise<void> {
  try {
    // Init GH api
    core.debug('hello world')
    const token = core.getInput('token')
    const octokit = new Github.GitHub(token)

    // Build manifests from repo state
    core.info('Generating manifests...')
    const repoNames = await getRepoNames(octokit, core)
    core.info(`MAPP repos: ${repoNames.join(', ')}`)
    const repoStates = await getRepoStates(octokit, repoNames)
    const manifests = generateManifests(repoStates)
    core.info(JSON.stringify(manifests))

    // Write to local fs
    core.info('Writing manifests to FS')
    const outputDir = core.getInput('outputDir')
    await exec(`mkdir -p ${outputDir}`)
    for (const k of Object.keys(manifests)) {
      await fs.writeFile(
        `${outputDir}/${k}.json`,
        // TODO: make this JSON stable:
        JSON.stringify(manifests[k]),
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
