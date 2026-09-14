import { ZodError } from 'zod';
import type { NodeId, TaskNode } from '../types';
import { TREE_DOC_VERSION, treeDocSchema, type TreeDoc } from './schema';

/** Serialise the whole tree to a validated, pretty JSON string. */
export function exportJson(nodes: Record<NodeId, TaskNode>): string {
  const doc: TreeDoc = {
    version: TREE_DOC_VERSION,
    exportedAt: Date.now(),
    nodes: Object.values(nodes),
  };
  return JSON.stringify(treeDocSchema.parse(doc), null, 2);
}

/**
 * Parse + validate an exported file. Throws (ZodError / SyntaxError) on anything
 * that is not a well-formed v1 document — callers show that to the user.
 */
export function parseImport(text: string): TaskNode[] {
  const doc = treeDocSchema.parse(JSON.parse(text));
  return doc.nodes;
}

/**
 * Turn whatever `parseImport` threw into one line a person can act on. A raw
 * ZodError stringifies to a wall of JSON, which was tolerable in an alert() and
 * is not in a toast.
 */
export function importErrorMessage(err: unknown): string {
  if (err instanceof ZodError) {
    const [first, ...rest] = err.issues;
    if (!first) return 'Not a valid MappedTasks file.';
    const where = first.path.join('.') || 'document';
    const more = rest.length ? ` (+${rest.length} more)` : '';
    return `Not a valid MappedTasks file — ${where}: ${first.message}${more}`;
  }
  if (err instanceof SyntaxError) return 'That file is not valid JSON.';
  return err instanceof Error ? err.message : String(err);
}

/** Browser download helper for the toolbar. */
export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
