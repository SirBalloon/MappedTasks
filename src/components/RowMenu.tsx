import { useEffect, useId, useRef, useState } from 'react';

export interface RowMenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

interface Props {
  label: string;
  items: RowMenuItem[];
}

/**
 * Overflow menu for a tree row. Keeps rarely-used and destructive actions one
 * deliberate tap away instead of sitting next to the add button, where a
 * mis-tap on a touch screen costs a whole subtree.
 */
export function RowMenu({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        title={label}
        className="rounded px-1.5 text-sm text-slate-500 hover:bg-slate-100 pointer-coarse:min-h-11 pointer-coarse:min-w-11 dark:hover:bg-slate-700"
      >
        ⋯
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 min-w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm pointer-coarse:min-h-11 ${
                item.destructive
                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
