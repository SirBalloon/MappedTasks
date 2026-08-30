import Dexie, { type Table } from 'dexie';
import type { TaskNode } from '../types';

/**
 * Local-first storage. One table, keyed by node id, with a secondary index on
 * `parentId` for when the map view wants to page children lazily later.
 *
 * Supabase sync can be layered on top of this later; nothing else in the app
 * talks to IndexedDB directly.
 */
class MappedTasksDB extends Dexie {
  nodes!: Table<TaskNode, string>;

  constructor() {
    super('mappedtasks');
    this.version(1).stores({
      nodes: 'id, parentId, order',
    });
  }
}

export const db = new MappedTasksDB();
