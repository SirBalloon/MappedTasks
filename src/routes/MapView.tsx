import { useTreeStore } from '../store/treeStore';
import { rootNodes } from '../store/selectors';

export function MapView() {
  const nodes = useTreeStore((s) => s.nodes);
  const roots = rootNodes(nodes);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <p className="text-sm font-medium text-slate-500">Map view coming soon</p>
      <p className="max-w-md text-xs text-slate-400">
        The radial d3-hierarchy + React Flow canvas will render the same store
        ({roots.length} {roots.length === 1 ? 'topic' : 'topics'}) once the rollup
        rules feel right. Use the Tasks view for now.
      </p>
    </div>
  );
}
