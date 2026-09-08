import { useEffect } from 'react';
import { useToastStore, type Toast } from '../store/toastStore';

/** Errors stay long enough to actually read a validation message. */
const LIFETIME_MS: Record<Toast['tone'], number> = { info: 4000, error: 9000 };

function ToastRow({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), LIFETIME_MS[toast.tone]);
    return () => clearTimeout(t);
  }, [toast.id, toast.tone, dismiss]);

  const tone =
    toast.tone === 'error'
      ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100'
      : 'border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg ${tone}`}
    >
      <span className="min-w-0 flex-1 break-words">{toast.message}</span>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="-my-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded text-current opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Bottom-anchored transient messages. Mounted once by RootLayout; anything can
 * post to it through `toast()` in `store/toastStore`.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </div>
  );
}
