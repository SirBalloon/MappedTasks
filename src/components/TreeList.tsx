import { useTreeStore } from '../store/treeStore';
import { childrenOf } from '../store/selectors';
import { TreeNodeRow } from './TreeNodeRow';

interface Props {
  parentId: string | null;
}

/**
 * The pre-canvas rendering of the tree: a plain nested `<ul>`. This is where the
 * checkbox + rollup rules get proven before any d3/React Flow work.
 */
export function TreeList({ parentId }: Props) {
  const nodes = useTreeStore((s) => s.nodes);
  const kids = childrenOf(nodes, parentId);

  if (kids.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1 border-l border-slate-200 pl-3 dark:border-slate-700">
      {kids.map((k) => (
        <TreeNodeRow key={k.id} id={k.id} />
      ))}
    </ul>
  );
}
