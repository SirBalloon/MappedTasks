import { Link } from 'react-router-dom';
import { useTreeStore } from '../store/treeStore';
import { rankedLeaves, rootNodes } from '../store/selectors';
import { TreeList } from '../components/TreeList';

export function TasksView() {
  const nodes = useTreeStore((s) => s.nodes);
  const roots = rootNodes(nodes);
  const top3 = rankedLeaves(nodes).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Daily top 3
        </h2>
        {top3.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing outstanding. 🎉</p>
        ) : (
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm">
            {top3.map((n) => (
              <li key={n.id}>
                <span className="text-slate-700 dark:text-slate-200">{n.title}</span>
                {n.parentId && nodes[n.parentId] && (
                  <Link
                    to={`/topic/${n.parentId}`}
                    className="ml-2 text-xs text-slate-400 hover:text-sky-600 hover:underline"
                  >
                    in {nodes[n.parentId].title}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          All topics
        </h2>
        {roots.length === 0 ? (
          <p className="text-sm text-slate-500">No topics yet — add one from the header.</p>
        ) : (
          <TreeList parentId={null} />
        )}
      </section>
    </div>
  );
}
