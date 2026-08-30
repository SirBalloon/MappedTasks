import { z } from 'zod';

/**
 * Zod schemas for the JSON round-trip. Import/export goes through these so a
 * hand-edited or older file is rejected loudly instead of corrupting the store.
 */

export const taskNodeSchema = z.object({
  id: z.string().min(1),
  parentId: z.string().min(1).nullable(),
  title: z.string(),
  done: z.boolean(),
  weight: z.number().int().min(0).max(5),
  order: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const treeDocSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  nodes: z.array(taskNodeSchema),
});

export type TaskNodeInput = z.infer<typeof taskNodeSchema>;
export type TreeDoc = z.infer<typeof treeDocSchema>;

export const TREE_DOC_VERSION = 1 as const;
