export type NodeId = string;

/**
 * A single node in the task tree.
 *
 * The tree is stored flat as `Record<NodeId, TaskNode>` in the Zustand store
 * (see `store/treeStore.ts`). Everything hierarchical — child lists, completion
 * rollup, ranking — is a *derived selector* over that flat map, never stored.
 */
export interface TaskNode {
  id: NodeId;
  /** `null` for a root topic. */
  parentId: NodeId | null;
  title: string;
  /**
   * Leaf completion flag. For a node that has children this flag is ignored on
   * display — effective completion is rolled up from descendant leaves. Toggling
   * a parent bulk-sets `done` on every leaf under it.
   */
  done: boolean;
  /** Manual priority, 0–5. Feeds the ranking selector. */
  weight: number;
  /** Sort position among siblings (ascending). */
  order: number;
  createdAt: number;
  updatedAt: number;
}
