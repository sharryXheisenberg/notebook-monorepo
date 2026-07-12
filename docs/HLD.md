# High-Level Design (HLD)
**Project:** All-in-One Developer Notebook
**References:** FRD, TRD v2
**Scope covered:** MVP + v1.5. v2 items (realtime collaboration, knowledge graph, offline-first, multi-language execution) are called out separately and excluded from the flows below.

---

## 1. Purpose

Define the logical architecture, component responsibilities, and key data flows for the notebook platform, so backend/frontend scaffolding in the next phase follows one agreed shape instead of being decided ad hoc per file.

## 2. Actors

| Actor | Description |
|---|---|
| End user | Authenticated developer/learner — owns notebooks, writes blocks, runs code, requests AI help |
| Anonymous viewer | Accesses a notebook only via a public read-only share link, no auth |
| AI provider (OpenRouter) | External system, called by the backend, never called directly from the frontend |
| GitHub Actions | CI/CD actor — builds, tests, deploys on push |

## 3. System Context

```mermaid
graph TD
    U[End user - browser] -->|HTTPS| FE[Next.js frontend - Vercel]
    V[Anonymous viewer] -->|HTTPS, read-only| FE
    FE -->|REST + JWT| BE[Spring Boot API - Render]
    BE -->|JDBC| DB[(Aiven MySQL)]
    BE -->|HTTPS| AI[OpenRouter API]
    FE -->|HTTPS| CW[Cloudflare Worker - TOON export]
    CW -->|REST, read-only| BE
    GH[GitHub Actions] -->|deploy| FE
    GH -->|deploy| BE
```

## 4. Logical Architecture Layers

| Layer | Contains | Notes |
|---|---|---|
| Presentation | Next.js editor UI, block renderers, skills dashboard, public share viewer | Talks to backend only via typed REST client in `lib/api/` |
| API | Spring Boot controllers | Thin — validation + delegation to services, no business logic here |
| Business logic | Service layer (Notebook, Block, Review, AI, Skill, Share) | All rules, rate limiting, and orchestration live here |
| Data | Aiven MySQL via Spring Data JPA | Single source of truth; no data duplicated in a second store |
| Infrastructure | Cloudflare Worker (export transform), OpenRouter (AI), Pyodide (client-side execution) | Each is replaceable independently of the others |

## 5. Component Responsibilities

| Component | Responsibility | Notes |
|---|---|---|
| NotebookService | CRUD for notebooks, folder hierarchy | Owns `parent_folder_id` tree logic |
| BlockService | CRUD + reorder for blocks inside a notebook | Owns `order_index` maintenance |
| ReviewService | Threaded line comments, ghost-code suggestion lifecycle | Comment resolution state machine: `PENDING → ACCEPTED/REJECTED` |
| AiService | Wraps OpenRouter calls, applies rate limiter, shapes prompts per block type | Only component allowed to call OpenRouter |
| SkillService | Tracks per-user mastery + streaks | Reads block language/topic tags, no direct AI dependency |
| ShareService | Issues/validates read-only share links | No auth check on the read path — validity check only |
| Export pipeline | Notebook JSON → MD/PDF/JSON in-process; JSON → TOON via Cloudflare Worker | Worker never touches the DB directly — always goes through `ExportController` |

## 6. Key Data Flows

### 6.1 Create notebook and add a block

```mermaid
sequenceDiagram
    participant U as User (browser)
    participant FE as Next.js
    participant BE as Spring Boot API
    participant DB as Aiven MySQL
    U->>FE: Click "New notebook"
    FE->>BE: POST /api/v1/notebooks
    BE->>DB: INSERT notebook
    BE-->>FE: 201 NotebookRes
    U->>FE: Click "+" → Code block
    FE->>BE: POST /api/v1/notebooks/{id}/blocks
    BE->>DB: INSERT block (order_index = last+1)
    BE-->>FE: 201 BlockRes
```

### 6.2 Execute a Python code block (client-side, MVP)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant PY as Pyodide (Web Worker)
    U->>FE: Click "Execute"
    FE->>PY: postMessage(code)
    PY->>PY: run in WASM sandbox
    PY-->>FE: stdout/stderr
    FE-->>U: render in output console
```
No backend involvement — this is fully client-side by design, per TRD §5 sandboxing rules.

### 6.3 AI Prompt Block request

```mermaid
sequenceDiagram
    participant FE as Next.js
    participant BE as Spring Boot API
    participant RL as AiRateLimiter (Bucket4j)
    participant AI as OpenRouter
    FE->>BE: POST /api/v1/ai/prompt
    BE->>RL: tryConsume(userId)
    alt bucket has tokens
        RL-->>BE: allowed
        BE->>AI: forward prompt
        AI-->>BE: completion
        BE-->>FE: 200 AiPromptRes
    else bucket empty
        RL-->>BE: denied
        BE-->>FE: 429 Too Many Requests
    end
```

### 6.4 Code review thread

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant BE as Spring Boot API
    participant DB as Aiven MySQL
    U->>FE: Highlight line, add comment
    FE->>BE: POST /api/v1/reviews/{blockId}/comments
    BE->>DB: INSERT review_comment (status=PENDING)
    BE-->>FE: 201 ReviewCommentRes
    U->>FE: Accept ghost-code suggestion
    FE->>BE: PATCH /api/v1/reviews/comments/{id}
    BE->>DB: UPDATE status=ACCEPTED
```

### 6.5 Export to TOON

```mermaid
sequenceDiagram
    participant FE as Next.js
    participant CW as Cloudflare Worker
    participant BE as Spring Boot API
    FE->>CW: POST /export/toon?notebookId=x
    CW->>BE: GET /api/v1/notebooks/{id}/blocks (internal, read-only)
    BE-->>CW: blocks JSON
    CW->>CW: transform JSON → TOON
    CW-->>FE: stream .toon file
```
Bypasses the Java server's CPU for the transform itself — matches TRD §4.2 (save compute cycles).

### 6.6 Public share link access

```mermaid
sequenceDiagram
    participant V as Anonymous viewer
    participant FE as Next.js
    participant BE as Spring Boot API
    V->>FE: GET /share/{slug}
    FE->>BE: GET /api/v1/share/{slug}
    BE->>BE: validate slug + expiry, no auth check
    BE-->>FE: 200 read-only notebook payload
    FE-->>V: render view-only editor
```

## 7. Deployment View

```mermaid
graph LR
    subgraph Vercel
        FE[Next.js frontend]
    end
    subgraph Render
        BE[Spring Boot API]
        WS[y-websocket service - v2 only]
    end
    subgraph Aiven
        DB[(MySQL - free tier)]
    end
    subgraph Cloudflare
        CW[Worker - TOON export]
    end
    OR[OpenRouter API]
    FE --> BE
    BE --> DB
    FE --> CW
    CW --> BE
    BE --> OR
```

## 8. Non-Functional Requirements

| Concern | Decision |
|---|---|
| Performance | Render free tier cold start (30–90s) accepted for MVP; mitigate with a free uptime pinger if demo-readiness matters |
| Security | Stateless JWT auth; all client-side code execution sandboxed in Web Workers/WASM; no server-side arbitrary code execution in MVP |
| Scalability | Single-node free tier by design — this is a portfolio project, not a production SLA. Aiven/Render both support one-click paid upgrade with no migration if ever needed |
| Availability | Render sleep-on-idle is an accepted trade-off, not a defect, for a zero-budget deployment |
| API versioning | All endpoints prefixed `/api/v1/` to allow non-breaking evolution later |

## 9. Cross-Cutting Concerns

- **Error handling:** centralized via `GlobalExceptionHandler` (`@ControllerAdvice`) — every custom exception maps to one HTTP status and one error body shape (see LLD §9).
- **Rate limiting:** only the AI Prompt endpoint is rate-limited in MVP; extend `AiRateLimiter` if other endpoints need it later.
- **Auditability:** `created_at`/`updated_at` on every entity — required for skills streak calculation and version history later.

## 10. Traceability (FRD → HLD component)

| FRD requirement | HLD component |
|---|---|
| §3.1 Block-based editor | Presentation layer, BlockService |
| §3.2 Code execution | Pyodide (client), BlockService |
| §3.3 Project/file management | NotebookService |
| §3.4 Export/interoperability | Export pipeline |
| §4.1 Inline code review | ReviewService |
| §4.2 AI integration | AiService, AiRateLimiter |
| Skills tracking (feature list) | SkillService |
| Sharing (this conversation) | ShareService |