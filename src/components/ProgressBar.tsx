interface Props {
  ratio: number;
  label?: string;
}

export function ProgressBar({ ratio, label }: Props) {
  const pct = Math.round(ratio * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 tabular-nums text-xs text-slate-500 dark:text-slate-400">
        {label ?? `${pct}%`}
      </span>
    </div>
  );
}
