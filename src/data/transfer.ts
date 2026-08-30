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
