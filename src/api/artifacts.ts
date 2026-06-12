export class ArtifactApiClient {
  async generate() { return { status: 'success' }; }
  async list() { return []; }
  async retry() { return { status: 'success' }; }
}
