# notebook-frontend

Next.js 15 (App Router) frontend for the All-in-One Developer Notebook.
See `/docs` in the monorepo root for FRD, TRD v2, HLD, LLD, API.md, and Testing_Strategy.md.

## Local setup

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your local backend
npm run dev
```

Runs on `http://localhost:3000`. Requires the backend running locally on `:8080`
(see `apps/backend/README.md`) — the frontend doesn't work standalone since every
page except the public share view needs the API.

## Architecture notes

- **Auth**: JWT stored in a regular (non-httpOnly) cookie — see `lib/auth/cookies.ts` for why,
  and its stated tradeoff.
- **Block editor**: each block in a notebook is an independent React component keyed by
  `block.blockType`, not one shared Tiptap document — see the comment in
  `components/editor/blocks/TextBlock.tsx` for why.
- **Code execution**: Python only runs client-side via Pyodide (`lib/execution/pyodideRunner.ts`
  + `public/workers/pyodide.worker.js`). Other languages store/highlight but don't execute yet —
  see FRD v2 §3.3 on why multi-language execution is a v2, licensing-gated decision.
- **Types**: hand-written in `types/`, mirroring the backend's DTOs. TRD v2 flagged generating
  these from the OpenAPI spec (springdoc) instead — worth doing once the API stabilizes, since
  hand-syncing two codebases is the first thing that silently drifts.

## Known gaps
- Block content changes are saved to local state (`useBlockStore`) on every keystroke but not
  yet persisted to the backend — needs a debounced PATCH call wired into `BlockEditor.tsx`.
- No block delete/duplicate endpoint wired up yet (`Toolbar.tsx`'s delete button is a no-op).
- `SlashMenu` only offers TEXT/CODE/AI_PROMPT — REVIEW and DIAGRAM block types exist on the
  backend but aren't insertable from the UI yet.
