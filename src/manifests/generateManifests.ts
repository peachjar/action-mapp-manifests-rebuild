import ManifestSet from '../ManifestSet'
import RepoState from '../RepoState'
import repoStateReducer from './repoStateReducer'

export default function generateManifests(states: RepoState[]): ManifestSet {
  return states.reduce(repoStateReducer, {})
}
