export default interface RepoState {
  name: string,
  branches: Record<string, string>,
  tags: Record<string, string>,
}
