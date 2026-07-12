# Testing Strategy
**Project:** All-in-One Developer Notebook
**References:** TRD v2, LLD (folder layout already includes `src/test/java/.../controller|service|repository`)

---

## 1. Testing Pyramid

```
        /\
       /  \    E2E (few) — Playwright, critical user flows only
      /----\
     /      \  Integration (some) — MockMvc + H2, controller↔service↔repo
    /--------\
   /          \ Unit (many) — JUnit5 + Mockito (backend), Jest (frontend)
  /____________\
```

Weight effort toward the bottom of the pyramid — as a solo project, a large E2E suite is expensive to maintain relative to the value it gives you. A handful of E2E tests covering the flows in HLD §6 (create notebook, execute code, AI prompt, share link) covers the highest-risk paths.

## 2. Backend Testing (matches your existing `src/test/java/com/notebook/api/` layout)

| Layer | Tool | What it covers |
|---|---|---|
| `repository/` | `@DataJpaTest` + H2 in-memory DB | Query correctness, entity relationships, cascade behavior |
| `service/` | JUnit5 + Mockito | Business logic in isolation — mock repositories, verify rate limiter is checked before AI calls (HLD §6.3) |
| `controller/` | `@WebMvcTest` + MockMvc | Request validation, status codes, auth enforcement (JWT required vs `permitAll()` on `/share/**`) |

**Specific cases worth testing given this project's design:**
- `AiRateLimiter` — verify the 6th request within a minute returns 429, not a call to OpenRouter (mock OpenRouter client and assert `verify(openRouterClient, never())...` on the denied case)
- `ShareService.resolve()` — expired slug throws `ResourceNotFoundException`; valid slug returns read-only payload with no user-identifying data leaked
- `BlockService.reorder()` — reordering doesn't produce duplicate `order_index` values
- Flyway migrations — a CI step that runs migrations against a fresh H2/MySQL instance on every PR, catching broken `V*.sql` scripts before merge

## 3. Frontend Testing

| Layer | Tool | What it covers |
|---|---|---|
| Components | Jest + React Testing Library | Block renderers, toolbar, slash menu behavior |
| API client | Jest with mocked fetch | Request shaping, error handling for 401/429 |
| Pyodide execution | Jest, mocking the Web Worker boundary | Code runs, output/error is captured and displayed |
| E2E | Playwright (small suite) | Login → create notebook → add code block → execute → see output; create share link → open in incognito → confirm read-only |

## 4. CI Integration (GitHub Actions)

Two workflows, path-filtered as set up in the monorepo structure:

- `backend-ci-cd.yml`: on push to `apps/backend/**` → `mvn test` → build Docker image → deploy to Render
- `frontend-ci-cd.yml`: on push to `apps/frontend/**` → `npm test` → `next build` → deploy to Vercel

Both should fail the pipeline (block merge) on any test failure — don't deploy on red.

## 5. Coverage Targets

Coverage percentage is a weak signal on its own — pair it with the "specific cases" list in §2 so you're not just chasing a number:

- Service layer: ~70% line coverage as a floor, but 100% of the rate-limiter and share-link expiry logic specifically (these are the two places a bug becomes a security or cost problem)
- Controllers: every endpoint has at least one 2xx and one 4xx test case
- Frontend components: cover the block editor's core interactions (add, reorder, delete) — skip exhaustive snapshot testing of static UI, it's low value and brittle

## 6. Manual Testing Checklist (free-tier-specific)

Automated tests won't catch these — check manually before each deploy milestone:

- [ ] Cold start: hit the Render URL after 20+ minutes idle, confirm the frontend shows a loading state rather than a broken error during the 30–90s spin-up
- [ ] Rate limiter resets correctly after the refill window (manually send 6 AI prompts within a minute, confirm the 6th is denied and a later request succeeds)
- [ ] Share link works in an incognito window with zero cookies/auth state
- [ ] Cloudflare Worker TOON export still works if the Spring Boot service is mid cold-start (decide: should the Worker retry, or fail fast with a clear message?)