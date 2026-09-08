import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTreeStore } from '../store/treeStore';
import { checkState, childrenOf, descendantIds, rollup } from '../store/selectors';
import { TreeList } from './TreeList';
import { InlineInput } from './InlineInput';
import { useConfirm } from './confirmContext';

interface Props {
  id: string;
}

export function TreeNodeRow({ id }: Props) {
  const nodes = useTreeStore((s) => s.nodes);
  const toggleDone = useTreeStore((s) => s.toggleDone);
  const addNode = useTreeStore((s) => s.addNode);
  const removeNode = useTreeStore((s) => s.removeNode);
  const renameNode = useTreeStore((s) => s.renameNode);
  const setWeight = useTreeStore((s) => s.setWeight);
  const confirm = useConfirm();

  const node = nodes[id];
  const checkRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const kids = node ? childrenOf(nodes, id) : [];
  const hasKids = kids.length > 0;
  const state = node ? checkState(nodes, id) : 'unchecked';
  const r = node ? rollup(nodes, id) : null;

  useEffect(() => {
    if (checkRef.current) checkRef.current.indeterminate = state === 'indeterminate';
  }, [state]);

  if (!node) return null;

  const onDelete = async () => {
    const buried = descendantIds(nodes, id).size;
    const ok = await confirm({
      title: `Delete "${node.title}"?`,
      body: buried
        ? `This also deletes ${buried} nested ${buried === 1 ? 'item' : 'items'}.`
        : undefined,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) removeNode(id);
  };

  return (
    <li className="py-0.5">
      {renaming ? (
        <InlineInput
          label="Rename"
          initial={node.title}
          onCommit={(title) => {
            renameNode(id, title);
            setRenaming(false);
          }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <div className="group flex items-center gap-2">
          <input
            ref={checkRef}
            type="checkbox"
            checked={state === 'checked'}
            onChange={() => toggleDone(id)}
            className="size-4 shrink-0 accent-sky-500"
            aria-label={`Toggle ${node.title}`}
          />

          {hasKids ? (
            <Link
              to={`/topic/${id}`}
              className="font-medium text-slate-800 hover:text-sky-600 hover:underline dark:text-slate-100"
            >
              {node.title}
            </Link>
          ) : (
            <span
              className={
                state === 'checked'
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-200'
              }
              onDoubleClick={() => setRenaming(true)}
            >
              {node.title}
            </span>
          )}

          {hasKids && r && (
            <span className="tabular-nums text-xs text-slate-400 dark:text-slate-500">
              {r.doneLeaves}/{r.leaves}
            </span>
          )}

          <span className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <label className="text-xs text-slate-400">
              w
              <select
                value={node.weight}
                onChange={(e) => setWeight(id, Number(e.target.value))}
                className="ml-0.5 rounded border border-slate-200 bg-transparent text-xs dark:border-slate-600"
              >
                {[0, 1, 2, 3, 4, 5].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="rounded px-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Add subtask"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => void onDelete()}
              className="rounded px-1.5 text-sm text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
              title="Delete"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {(hasKids || adding) && (
        <div className="ml-2 mt-1">
          {hasKids && <TreeList parentId={id} />}
          {adding && (
            <div className="border-l border-slate-200 pl-3 dark:border-slate-700">
              <InlineInput
                label="New subtask"
                placeholder="New subtask"
                keepOpen
                onCommit={(title) => addNode({ parentId: id, title })}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
