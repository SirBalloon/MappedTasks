# MappedTasks

Local-first hierarchical task map. A tree of topics/tasks with completion
**rollup** and priority **ranking** as derived state, a list view now and a
radial d3 + React Flow map later, shipped to Play via a PWA + Capacitor shell.

## Stack

| Concern      | Choice |
| ------------ | ------ |
| Build / app  | Vite + React 19 + TypeScript |
| Styling      | Tailwind v4 (`@tailwindcss/vite`, no config file) |
| State        | Zustand — one flat tree store; rollup & ranking are pure selectors |
| Routing      | React Router — `/` map, `/topic/:id` drill-in (gives Android back button) |
| Map (later)  | `d3-hierarchy` for radial positions, `@xyflow/react` renders, Motion for the drill transition |
| Storage      | Dexie over IndexedDB, local-first (Supabase sync later) |
| Validation   | Zod on the JSON import/export round-trip |
| Ship         | `vite-plugin-pwa` service worker + manifest, Capacitor Android wrapper |

## Scripts

```bash
npm run dev        # vite dev server
npm run build      # production build -> dist/
npm run preview    # serve the build
npm run typecheck  # tsc --noEmit
```

## Layout

```
src/
  types.ts                 TaskNode — the flat node shape
  store/
    treeStore.ts           Zustand store: nodes map + mutations
    selectors.ts           childrenOf / rollup / checkState / rankScore / rankedLeaves
  data/
    db.ts                  Dexie database (one `nodes` table)
    persistence.ts         hydrate store from IndexedDB + debounced write-back
    schema.ts              Zod schemas for the export document
    transfer.ts            exportJson / parseImport / downloadJson
    seed.ts                first-run sample tree
  components/
    TreeList.tsx           nested <ul>
    TreeNodeRow.tsx        checkbox (tri-state) + title + weight + add/delete
    ProgressBar.tsx
  routes/
    RootLayout.tsx         header, import/export, <Outlet>
    MapView.tsx            `/`  — daily top 3 + all topics
    TopicView.tsx          `/topic/:id` — breadcrumb + subtree
```

### Rollup & ranking rules (see `store/selectors.ts`)

- A childless node is a leaf; its progress is `done ? 1 : 0`.
- A parent's progress is `doneLeaves / totalLeaves` over its leaf descendants.
- A parent checkbox is **checked** at 100%, **indeterminate** above 0%, else empty.
- Toggling a parent bulk-sets every descendant leaf.
- `rankScore` = `(maxWeightOnAncestryChain + 1) * remainingLeaves`.
- `rankedLeaves` = incomplete leaves, heaviest first — the daily top 3 source.

## Play / Capacitor

The native shell is **not** committed (`/android` is gitignored). Generate it
locally once:

```bash
npm run cap:add:android   # build + npx cap add android
```

then after each web change:

```bash
npm run cap:sync
```

## Not wired yet (deps installed, deliberate)

`d3-hierarchy`, `@xyflow/react`, `motion` — the map is built after the data model
stops moving. Keep node components ignorant of React Flow props so dropping to
plain SVG stays a one-day change.
