import { Link, useLocation } from 'react-router-dom';

/**
 * Sliding two-segment switch for the primary view. Lives in the header's
 * top-left. `/map` is the Map view; anything else (including topic drill-in)
 * counts as Tasks.
 */
export function ViewToggle() {
  const { pathname } = useLocation();
  const isMap = pathname === '/map';

  return (
    <div className="relative flex rounded-full border border-slate-300 bg-slate-100 p-0.5 text-xs font-medium dark:border-slate-600 dark:bg-slate-800">
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0.5 left-0.5 w-16 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-slate-600 ${
          isMap ? 'translate-x-16' : 'translate-x-0'
        }`}
      />
      <Link
        to="/"
        aria-current={isMap ? undefined : 'page'}
        className={`relative z-10 w-16 rounded-full py-1 text-center transition-colors ${
          isMap ? 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300' : 'text-slate-900 dark:text-white'
        }`}
      >
        Tasks
      </Link>
      <Link
        to="/map"
        aria-current={isMap ? 'page' : undefined}
        className={`relative z-10 w-16 rounded-full py-1 text-center transition-colors ${
          isMap ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        Map
      </Link>
    </div>
  );
}
