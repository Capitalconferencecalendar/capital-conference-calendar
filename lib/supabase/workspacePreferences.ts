export type WorkspaceIdentity = string | "anonymous";

export function workspacePreferenceKey(identity: WorkspaceIdentity, name: string) {
  return `ccc_workspace_v1:${identity}:${name}`;
}
