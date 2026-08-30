import type { TaskNode } from '../types';

/**
 * First-run sample tree. Only used when IndexedDB is empty. Mirrors the actual
 * build plan so the rollup/ranking rules have something realistic to chew on.
 */
export function seedNodes(): TaskNode[] {
  const now = Date.now();
  let n = 0;
  const out: TaskNode[] = [];

  const mk = (
    id: string,
    parentId: string | null,
    title: string,
    opts: { done?: boolean; weight?: number } = {},
  ): string => {
    out.push({
      id,
      parentId,
      title,
      done: opts.done ?? false,
      weight: opts.weight ?? 1,
      order: n++,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  };

  const ship = mk('ship', null, 'Ship MappedTasks v1', { weight: 3 });

  const data = mk('data', ship, 'Data model', { weight: 3 });
  mk('data-store', data, 'Tree store', { done: true });
  mk('data-rollup', data, 'Rollup selectors', { done: true });
  mk('data-rank', data, 'Ranking selectors', { done: true });

  const persist = mk('persist', ship, 'Persistence', { weight: 2 });
  mk('persist-dexie', persist, 'Dexie schema', { done: true });
  mk('persist-json', persist, 'JSON import / export', { done: true });
  mk('persist-sync', persist, 'Supabase sync (later)', { weight: 0 });

  const map = mk('map', ship, 'Map view', { weight: 2 });
  mk('map-layout', map, 'd3-hierarchy radial layout');
  mk('map-flow', map, 'React Flow node rendering');
  mk('map-drill', map, 'Drill-down transition (Motion)');

  const play = mk('play', ship, 'Ship to Play', { weight: 1 });
  mk('play-pwa', play, 'vite-plugin-pwa service worker', { done: true });
  mk('play-cap', play, 'Capacitor shell');
  mk('play-notif', play, 'Daily top 3 notification');

  const personal = mk('personal', null, 'Personal', { weight: 1 });
  mk('p-dentist', personal, 'Call dentist', { weight: 2 });
  mk('p-groceries', personal, 'Groceries');

  return out;
}
