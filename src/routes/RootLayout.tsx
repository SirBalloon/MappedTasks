import { useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTreeStore } from '../store/treeStore';
import { toast } from '../store/toastStore';
import { downloadJson, exportJson, importErrorMessage, parseImport } from '../data/transfer';
import { ViewToggle } from '../components/ViewToggle';
import { ConfirmProvider } from '../components/ConfirmDialog';
import { InlineInput } from '../components/InlineInput';
import { Toaster } from '../components/Toaster';

export function RootLayout() {
  const hydrated = useTreeStore((s) => s.hydrated);
  const addNode = useTreeStore((s) => s.addNode);
  const replaceAll = useTreeStore((s) => s.replaceAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [addingTopic, setAddingTopic] = useState(false);

  const onExport = () => {
    const { nodes } = useTreeStore.getState();
    downloadJson(`mappedtasks-${new Date().toISOString().slice(0, 10)}.json`, exportJson(nodes));
  };

  const onImportFile = async (file: File) => {
    try {
      const nodes = parseImport(await file.text());
      replaceAll(nodes);
      toast(`Imported ${nodes.length} ${nodes.length === 1 ? 'node' : 'nodes'}.`);
    } catch (err) {
      toast(importErrorMessage(err), 'error');
    }
  };

  return (
    <ConfirmProvider>
      <div className="flex min-h-full w-full flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
          <Link to="/" className="font-semibold tracking-tight">
            MappedTasks
          </Link>
          <ViewToggle />
          <div className="ml-auto flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setAddingTopic(true)}
              aria-expanded={addingTopic}
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

        {addingTopic && (
          <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
            <InlineInput
              label="New topic"
              placeholder="New topic"
              keepOpen
              onCommit={(title) => addNode({ parentId: null, title })}
              onCancel={() => setAddingTopic(false)}
            />
          </div>
        )}

        <main className="flex-1 px-4 py-4">
          {hydrated ? <Outlet /> : <p className="text-sm text-slate-500">Loading…</p>}
        </main>

        <Toaster />
      </div>
    </ConfirmProvider>
  );
}
