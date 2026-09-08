import { useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTreeStore } from '../store/treeStore';
import { downloadJson, exportJson, parseImport } from '../data/transfer';

export function RootLayout() {
  const hydrated = useTreeStore((s) => s.hydrated);
  const addNode = useTreeStore((s) => s.addNode);
  const replaceAll = useTreeStore((s) => s.replaceAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    const { nodes } = useTreeStore.getState();
    downloadJson(`mappedtasks-${new Date().toISOString().slice(0, 10)}.json`, exportJson(nodes));
  };

  const onImportFile = async (file: File) => {
    try {
      replaceAll(parseImport(await file.text()));
    } catch (err) {
      window.alert(`Import failed:\n${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <Link to="/" className="font-semibold tracking-tight">
          MappedTasks
        </Link>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              const t = window.prompt('New topic');
              if (t) addNode({ parentId: null, title: t });
            }}
            className="rounded bg-sky-500 px-2.5 py-1 font-medium text-white hover:bg-sky-600"
          >
            + Topic
          </button>
          <button
            type="button"
            onClick={onExport}
            className="rounded border border-slate-300 px-2.5 py-1 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded border border-slate-300 px-2.5 py-1 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImportFile(f);
              e.target.value = '';
            }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {hydrated ? <Outlet /> : <p className="text-sm text-slate-500">Loading…</p>}
      </main>
    </div>
  );
}
