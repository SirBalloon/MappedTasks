import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ConfirmContext, type Confirm, type ConfirmOptions } from './confirmContext';

/**
 * One modal <dialog> for the whole app, handed out as a promise.
 *
 * Native <dialog> is doing the unglamorous work here: focus trapping, inerting
 * the page behind it, and Escape-to-close. Escape arrives as `cancel`, which we
 * intercept so every exit path resolves the promise exactly once.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // A second request while one is open supersedes it; the old caller gets
        // a `false` rather than a promise that never settles.
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setRequest(options);
      }),
    [],
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (request && !dlg.open) dlg.showModal();
    else if (!request && dlg.open) dlg.close();
  }, [request]);

  const settle = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        onCancel={(e) => {
          e.preventDefault();
          settle(false);
        }}
        onClose={() => {
          if (resolverRef.current) settle(false);
        }}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl backdrop:bg-slate-900/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {request && (
          <div className="flex flex-col gap-3">
            <h2 id="confirm-title" className="text-sm font-semibold">
              {request.title}
            </h2>
            {request.body && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{request.body}</p>
            )}
            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                autoFocus={request.destructive}
                onClick={() => settle(false)}
                className="min-h-9 rounded border border-slate-300 px-3 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                {request.cancelLabel ?? 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus={!request.destructive}
                onClick={() => settle(true)}
                className={`min-h-9 rounded px-3 text-sm font-medium text-white ${
                  request.destructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                {request.confirmLabel ?? 'OK'}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
