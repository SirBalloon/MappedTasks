import { Link, Navigate, useParams } from 'react-router-dom';
import { useTreeStore } from '../store/treeStore';
import { ancestorChain, rollup } from '../store/selectors';
import { TreeList } from '../components/TreeList';
import { ProgressBar } from '../components/ProgressBar';

export function TopicView() {
  const { id = '' } = useParams();
  const nodes = useTreeStore((s) => s.nodes);
  const addNode = useTreeStore((s) => s.addNode);

  const node = nodes[id];
  if (!node) return <Navigate to="/" replace />;

  const trail = ancestorChain(nodes, id);
  const r = rollup(nodes, id);

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
        <Link to="/" className="hover:text-sky-600 hover:underline">
          Map
        </Link>
        {trail.map((a) => (
          <span key={a.id} className="flex items-center gap-1">
            <span>/</span>
            <Link to={`/topic/${a.id}`} className="hover:text-sky-600 hover:underline">
              {a.title}
            </Link>
          </span>
        ))}
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold tracking-tight">{node.title}</h1>
        <ProgressBar ratio={r.ratio} label={`${r.doneLeaves}/${r.leaves}`} />
      </header>

      <button
        type="button"
        onClick={() => {
          const t = window.prompt('New subtask');
          if (t) addNode({ parentId: id, title: t });
        }}
        className="self-start rounded border border-slate-300 px-2.5 py-1 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
      >
        + Subtask
      </button>

      <TreeList parentId={id} />
    </div>
  );
}
