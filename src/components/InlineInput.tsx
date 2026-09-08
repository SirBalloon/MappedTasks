import { useEffect, useRef, useState } from 'react';

interface Props {
  /** Accessible name for the field. */
  label: string;
  initial?: string;
  placeholder?: string;
  /**
   * Keep the field mounted and cleared after a commit, so several siblings can
   * be typed in a row. Adds use this; rename does not.
   */
  keepOpen?: boolean;
  /** Called with the trimmed, non-empty value. */
  onCommit: (value: string) => void;
  onCancel: () => void;
}

/**
 * The single text-entry surface for every add and rename in the app.
 *
 * Enter commits, Escape cancels, and focus leaving the row cancels. That last
 * rule is why this is a <form> with the buttons inside it: tapping the commit
 * button blurs the input first, so the blur handler has to distinguish "focus
 * moved somewhere else in this row" from "focus left the row", or the button
 * would unmount before its click ever landed.
 */
export function InlineInput({
  label,
  initial = '',
  placeholder,
  keepOpen = false,
  onCommit,
  onCancel,
}: Props) {
  const [value, setValue] = useState(initial);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => {
    const v = value.trim();
    if (!v) {
      onCancel();
      return;
    }
    onCommit(v);
    if (keepOpen) {
      setValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        commit();
      }}
      onBlur={(e) => {
        if (!formRef.current?.contains(e.relatedTarget as Node | null)) onCancel();
      }}
      className="flex items-center gap-1 py-0.5"
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        enterKeyHint={keepOpen ? 'enter' : 'done'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="min-w-0 flex-1 rounded border border-sky-400 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-200 dark:border-sky-500 dark:bg-slate-800 dark:focus:ring-sky-900"
      />
      <button
        type="submit"
        aria-label={`Save ${label}`}
        className="flex size-9 shrink-0 items-center justify-center rounded text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-700"
      >
        ✓
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label={`Cancel ${label}`}
        className="flex size-9 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        ✕
      </button>
    </form>
  );
}
