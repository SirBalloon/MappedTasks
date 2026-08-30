import type { NodeId, TaskNode } from '../types';
import { useTreeStore } from '../store/treeStore';
import { db } from './db';
import { seedNodes } from './seed';

let started = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Wire the store to IndexedDB. Call once, before render.
 *
 *  1. read every node out of Dexie (seed on first run)
 *  2. push it into the store and flip `hydrated`
 *  3. subscribe: on any change to `nodes`, debounce a write-back
 *
 * The write is a full replace inside one transaction. Crude, but the dataset is
 * tiny and it keeps deletes correct without diffing.
 */
export async function hydrateStore(): Promise<void> {
  if (started) return;
  started = true;

  const rows = await db.nodes.toArray();
  if (rows.length === 0) {
    const seeded = seedNodes();
    useTreeStore.getState().replaceAll(seeded);
    await flush(useTreeStore.getState().nodes);
  } else {
    useTreeStore.getState().replaceAll(rows);
  }
  useTreeStore.getState().setHydrated(true);

  useTreeStore.subscribe((state, prev) => {
    if (state.nodes === prev.nodes) return;
    clearTimeout(saveTimer);
    const snapshot = state.nodes;
    saveTimer = setTimeout(() => void flush(snapshot), 250);
  });
}

async function flush(nodes: Record<NodeId, TaskNode>): Promise<void> {
  const list = Object.values(nodes);
  await db.transaction('rw', db.nodes, async () => {
    await db.nodes.clear();
    if (list.length) await db.nodes.bulkPut(list);
  });
}
