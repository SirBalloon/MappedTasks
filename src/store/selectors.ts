import type { NodeId, TaskNode } from '../types';

/**
 * Pure, stateless derivations over the flat node map.
 *
 * Nothing here is stored. The map view (d3-hierarchy + React Flow) and the list
 * view both read the tree exclusively through these functions, so the shape of
 * "progress" and "priority" lives in exactly one place.
 *
 * These recompute on every call. That is deliberate for v1 — the tree is small
 * and the rules are still moving. Wrap the hot ones in a memo keyed by the
 * `nodes` reference once the data model settles.
 */

type NodeMap = Record<NodeId, TaskNode>;

const byOrder = (a: TaskNode, b: TaskNode): number =>
  a.order - b.order || a.createdAt - b.createdAt;

export function childrenOf(nodes: NodeMap, parentId: NodeId | null): TaskNode[] {
  const out: TaskNode[] = [];
  for (const id in nodes) {
    if (nodes[id].parentId === parentId) out.push(nodes[id]);
  }
  return out.sort(byOrder);
}

export function rootNodes(nodes: NodeMap): TaskNode[] {
  return childrenOf(nodes, null);
}

/** Every id strictly below `id` (children, grandchildren, ...). Cycle-safe. */
export function descendantIds(nodes: NodeMap, id: NodeId): Set<NodeId> {
  const seen = new Set<NodeId>();
  const stack = childrenOf(nodes, id).map((n) => n.id);
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const c of childrenOf(nodes, cur)) stack.push(c.id);
  }
  return seen;
}

/** Root -> ... -> parent chain for `id` (excludes `id` itself). */
export function ancestorChain(nodes: NodeMap, id: NodeId): TaskNode[] {
  const chain: TaskNode[] = [];
  const seen = new Set<NodeId>();
  let cur = nodes[id]?.parentId ?? null;
  while (cur && nodes[cur] && !seen.has(cur)) {
    seen.add(cur);
    chain.unshift(nodes[cur]);
    cur = nodes[cur].parentId;
  }
  return chain;
}

export interface Rollup {
  /** Count of leaf descendants (a childless node counts as 1 leaf: itself). */
  leaves: number;
  doneLeaves: number;
  /** 0..1 */
  ratio: number;
  complete: boolean;
}

export function rollup(nodes: NodeMap, id: NodeId): Rollup {
  const node = nodes[id];
  if (!node) return { leaves: 0, doneLeaves: 0, ratio: 0, complete: false };

  const kids = childrenOf(nodes, id);
  if (kids.length === 0) {
    const done = node.done ? 1 : 0;
    return { leaves: 1, doneLeaves: done, ratio: done, complete: node.done };
  }

  let leaves = 0;
  let doneLeaves = 0;
  for (const k of kids) {
    const r = rollup(nodes, k.id);
    leaves += r.leaves;
    doneLeaves += r.doneLeaves;
  }
  return {
    leaves,
    doneLeaves,
    ratio: leaves === 0 ? 0 : doneLeaves / leaves,
    complete: leaves > 0 && doneLeaves === leaves,
  };
}

export type CheckState = 'checked' | 'indeterminate' | 'unchecked';

export function checkState(nodes: NodeMap, id: NodeId): CheckState {
  const r = rollup(nodes, id);
  if (r.complete) return 'checked';
  if (r.doneLeaves > 0) return 'indeterminate';
  return 'unchecked';
}

/** Highest weight found on `id` or any of its ancestors. */
export function effectiveWeight(nodes: NodeMap, id: NodeId): number {
  let w = nodes[id]?.weight ?? 0;
  for (const a of ancestorChain(nodes, id)) w = Math.max(w, a.weight);
  return w;
}

/**
 * Priority score for a subtree: heavier and less-finished ranks higher.
 * Used to order topics on the map.
 */
export function rankScore(nodes: NodeMap, id: NodeId): number {
  const r = rollup(nodes, id);
  const remaining = r.leaves - r.doneLeaves;
  return (effectiveWeight(nodes, id) + 1) * remaining;
}

/**
 * The actionable shortlist — incomplete *leaves* only, most important first.
 * Feed the top 3 of this into the daily notification later.
 */
export function rankedLeaves(nodes: NodeMap): TaskNode[] {
  const leaves: TaskNode[] = [];
  for (const id in nodes) {
    const n = nodes[id];
    if (!n.done && childrenOf(nodes, id).length === 0) leaves.push(n);
  }
  return leaves.sort(
    (a, b) =>
      effectiveWeight(nodes, b.id) - effectiveWeight(nodes, a.id) ||
      a.updatedAt - b.updatedAt,
  );
}
