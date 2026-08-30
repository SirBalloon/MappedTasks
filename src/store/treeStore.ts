import { create } from 'zustand';
import type { NodeId, TaskNode } from '../types';
import { childrenOf, descendantIds, rollup } from './selectors';

const uid = (): NodeId =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export interface TreeState {
  /** Flat map. The single source of truth. */
  nodes: Record<NodeId, TaskNode>;
  /** False until IndexedDB has been read once. */
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  /** Replace the whole tree (hydrate, import). */
  replaceAll: (nodes: TaskNode[]) => void;

  addNode: (input: { parentId: NodeId | null; title: string; weight?: number }) => NodeId;
  renameNode: (id: NodeId, title: string) => void;
  setWeight: (id: NodeId, weight: number) => void;
  /**
   * Toggle completion. On a leaf this flips its own `done`. On a parent it bulk
   * sets every descendant leaf: if the subtree is not fully done it becomes all
   * done, otherwise all not-done.
   */
  toggleDone: (id: NodeId) => void;
  /** Remove a node and its entire subtree. */
  removeNode: (id: NodeId) => void;
  /** Re-parent a node (and implicitly its subtree). No-op if it would form a cycle. */
  moveNode: (id: NodeId, newParentId: NodeId | null) => void;
}

function nextOrder(nodes: Record<NodeId, TaskNode>, parentId: NodeId | null): number {
  const siblings = childrenOf(nodes, parentId);
  return siblings.length ? siblings[siblings.length - 1].order + 1 : 0;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  nodes: {},
  hydrated: false,

  setHydrated: (v) => set({ hydrated: v }),

  replaceAll: (list) =>
    set({ nodes: Object.fromEntries(list.map((n) => [n.id, n])) }),

  addNode: ({ parentId, title, weight = 1 }) => {
    const id = uid();
    const now = Date.now();
    set((s) => ({
      nodes: {
        ...s.nodes,
        [id]: {
          id,
          parentId,
          title: title.trim() || 'Untitled',
          done: false,
          weight,
          order: nextOrder(s.nodes, parentId),
          createdAt: now,
          updatedAt: now,
        },
      },
    }));
    return id;
  },

  renameNode: (id, title) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n) return s;
      return { nodes: { ...s.nodes, [id]: { ...n, title: title.trim() || n.title, updatedAt: Date.now() } } };
    }),

  setWeight: (id, weight) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n) return s;
      const w = Math.max(0, Math.min(5, Math.round(weight)));
      return { nodes: { ...s.nodes, [id]: { ...n, weight: w, updatedAt: Date.now() } } };
    }),

  toggleDone: (id) =>
    set((s) => {
      const n = s.nodes[id];
      if (!n) return s;
      const now = Date.now();
      const kids = childrenOf(s.nodes, id);

      if (kids.length === 0) {
        return { nodes: { ...s.nodes, [id]: { ...n, done: !n.done, updatedAt: now } } };
      }

      const target = !rollup(s.nodes, id).complete;
      const next = { ...s.nodes };
      for (const descId of descendantIds(s.nodes, id)) {
        const d = next[descId];
        if (childrenOf(s.nodes, descId).length === 0 && d.done !== target) {
          next[descId] = { ...d, done: target, updatedAt: now };
        }
      }
      return { nodes: next };
    }),

  removeNode: (id) =>
    set((s) => {
      const next = { ...s.nodes };
      delete next[id];
      for (const descId of descendantIds(s.nodes, id)) delete next[descId];
      return { nodes: next };
    }),

  moveNode: (id, newParentId) => {
    if (id === newParentId) return;
    const s = get();
    if (newParentId && descendantIds(s.nodes, id).has(newParentId)) return; // would cycle
    set((st) => {
      const n = st.nodes[id];
      if (!n) return st;
      return {
        nodes: {
          ...st.nodes,
          [id]: { ...n, parentId: newParentId, order: nextOrder(st.nodes, newParentId), updatedAt: Date.now() },
        },
      };
    });
  },
}));
