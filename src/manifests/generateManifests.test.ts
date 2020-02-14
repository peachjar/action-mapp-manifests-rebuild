import generateManifests from './generateManifests'
import RepoState from '../RepoState'

describe('generateManifests()', () => {
  it('generates manifests from a RepoState', () => {
    const repoStates: RepoState[] = [
      {
        name: 'mapp-masquerade',
        branches: {
          master: 'cab09a0aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'another-tag': 'ef012341234567717c03a473369ec520cbb65e81',
          'deploy-2020-01-04-10-10-00': 'abcdef01234567717c03a473369ec520cbb65e81',
          'deploy-2019-03-04-10-10-00': 'bbcdef01234567717c03a473369ec520cbb65e81',
          'deploy-2020-02-04-10-10-00': 'cbcdef01234567717c03a473369ec520cbb65e81',
          'deploy-2020-01-01-10-10-00': 'dbcdef01234567717c03a473369ec520cbb65e81',
          'zanother-tag': 'ef012341234567717c03a473369ec520cbb65e81',
        },
      },
    ]

    expect(generateManifests(repoStates)).toEqual({
      production: {
        'mapp-masquerade': 'cbcdef0',
      },
      staging: {
        'mapp-masquerade': 'cab09a0',
      },
    })
  })

  it('generates manifests from several RepoStates', () => {
    const repoStates: RepoState[] = [
      {
        name: 'mapp-masquerade',
        branches: {
          master: 'cab09a0aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'deploy-2020-02-04-10-10-00': 'abcdef01234567717c03a473369ec520cbb65e81',
        },
      },
      {
        name: 'mapp-approval-center',
        branches: {
          master: '1234567aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'deploy-2018-02-04-10-10-00': '23456781234567717c03a473369ec520cbb65e81',
        },
      },
      {
        name: 'mapp-2dfruity',
        branches: {
          master: '4567890aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'deploy-2020-01-04-10-10-00': '56789011234567717c03a473369ec520cbb65e81',
        },
      },
    ]

    expect(generateManifests(repoStates)).toEqual({
      production: {
        'mapp-masquerade': 'abcdef0',
        'mapp-approval-center': '2345678',
        'mapp-2dfruity': '5678901',
      },
      staging: {
        'mapp-masquerade': 'cab09a0',
        'mapp-approval-center': '1234567',
        'mapp-2dfruity': '4567890',
      },
    })
  })

  it('filters out mapps with no prod deploy tag from prod manifest', () => {
    const repoStates: RepoState[] = [
      {
        name: 'mapp-masquerade',
        branches: {
          master: 'cab09a0aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'another-tag': 'ef012341234567717c03a473369ec520cbb65e81',
        },
      },
    ]

    expect(generateManifests(repoStates)).toEqual({
      production: {},
      staging: {
        'mapp-masquerade': 'cab09a0',
      },
    })
  })

  it('filters out mapps with no master branch from staging manifest', () => {
    const repoStates: RepoState[] = [
      {
        name: 'mapp-masquerade',
        branches: {
          not_master: 'cab09a0aa8f7cf717c03a473369ec520cbb65e81',
        },
        tags: {
          'deploy-2020-01-04-10-10-00': '56789011234567717c03a473369ec520cbb65e81',
        },
      },
    ]

    expect(generateManifests(repoStates)).toEqual({
      production: {
        'mapp-masquerade': '5678901',
      },
      staging: {},
    })
  })
})
