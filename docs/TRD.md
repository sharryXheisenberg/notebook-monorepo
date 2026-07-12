# Technical Requirements Document (TRD) — v2
**Project:** All-in-One Developer Notebook
**Supersedes:** TRD v1
**Change summary:** Backend confirmed as Java/Spring Boot. Deployment target changed from Railway → Render (Railway's free tier is no longer viable for an always-on service). Supabase/Firebase/Node backend options dropped in favor of the existing Spring Boot scaffold. WebContainers flagged as a licensing-conditional v2 item, not an MVP dependency. Feature set expanded and phased into MVP / v1.5 / v2.

---

## 1. Confirmed Technology Stack (Zero-Budget)

| Layer | Technology | Hosting | Cost status |
|---|---|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind + shadcn/ui | Vercel (Hobby) | Free — non-commercial use only |
| Block editor | Tiptap (custom block extensions) | — | Free, open source |
| Code editor | Monaco Editor | — | Free, open source |
| State | Zustand + TanStack Query | — | Free, open source |
| Backend API | Java 17, Spring Boot, Spring MVC, Spring Data JPA, Spring Security (JWT) | Render (free web service) | Free — expect 15-min spin-down, 30–90s cold start |
| Database | MySQL | Aiven for MySQL (free tier) | Free, no time limit, 1GB RAM/storage |
| Edge/serverless | Cloudflare Workers (JSON → TOON export) | Cloudflare | Free — 100K requests/day |
| AI integration | OpenRouter API (Llama, Mistral, other free-tier models) | — | Free-tier models, rate-limited |
| In-browser execution (Python) | Pyodide (WASM) | Client-side only | Free, open source |
| In-browser execution (multi-language, v2 only) | WebContainers (StackBlitz) | Client-side only | Free for prototypes/POCs only — commercial license required beyond that |
| Diagrams | Mermaid.js | Client-side only | Free, open source |
| Real-time collaboration (v2 only) | Yjs + y-websocket, small standalone Node service | Render (separate free service) | Free |
| CI/CD | GitHub Actions | GitHub | Free — unlimited on public repos |
| Rate limiting | Bucket4j | In-process (Spring Boot) | Free, open source |
| DTO mapping | MapStruct | Compile-time (Spring Boot) | Free, open source |
| DB migrations | Flyway | In-process (Spring Boot) | Free, open source |

**Dropped from earlier drafts:** Railway (no longer meaningfully free), Supabase (redundant with the existing Spring Boot + MySQL auth/data layer), Firebase (same reason).

---

## 2. Backend — Updated Directory Structure

Base structure is unchanged from your original scaffold (it already follows solid Spring Boot layering). Additions are marked `# NEW`, changes are marked `# CHANGE`.

```
notebook-backend/
├── .github/workflows/
│   └── backend-ci-cd.yml            # CHANGE: deploy target → Render (Docker), not Railway
├── src/main/java/com/notebook/api/
│   ├── NotebookApplication.java
│   │
│   ├── config/
│   │   ├── AppConfig.java
│   │   ├── OpenApiConfig.java
│   │   └── SecurityConfig.java
│   │
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── NotebookController.java
│   │   ├── BlockController.java
│   │   ├── ExportController.java
│   │   ├── ReviewController.java      # NEW — threaded line comments, ghost-code suggestions
│   │   ├── AiController.java          # NEW — AI Prompt Block: explain / refactor / generate tests
│   │   ├── SkillController.java       # NEW — skills dashboard, streaks, mastered concepts
│   │   └── ShareController.java       # NEW — public read-only share links (no auth required)
│   │
│   ├── dto/
│   │   ├── request/
│   │   ├── response/
│   │   └── mapper/                    # NEW — MapStruct interfaces, replaces manual entity↔DTO code
│   │
│   ├── entity/
│   │   ├── User.java
│   │   ├── Notebook.java
│   │   ├── Block.java
│   │   ├── CodeReview.java
│   │   ├── ReviewComment.java         # NEW — threaded comment per line
│   │   ├── ShareLink.java             # NEW — uuid slug, optional expiry, view-only flag
│   │   ├── Skill.java                 # NEW — language/topic taxonomy
│   │   └── UserSkillProgress.java     # NEW — per-user mastery + streak tracking
│   │
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── UnauthorizedException.java
│   │
│   ├── ratelimit/                     # NEW package
│   │   └── AiRateLimiter.java         # Bucket4j — enforces "AI prompts per minute per user" (TRD §5)
│   │
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── NotebookRepository.java
│   │   ├── BlockRepository.java
│   │   ├── ReviewCommentRepository.java   # NEW
│   │   ├── ShareLinkRepository.java       # NEW
│   │   └── SkillRepository.java           # NEW
│   │
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtTokenProvider.java
│   │   └── CustomUserDetailsService.java
│   │
│   ├── service/  (+ impl/)
│   │   ├── AuthService.java
│   │   ├── NotebookService.java
│   │   ├── BlockService.java
│   │   ├── ReviewService.java         # NEW
│   │   ├── AiService.java             # NEW — OpenRouter client wrapper
│   │   ├── SkillService.java          # NEW
│   │   └── ShareService.java          # NEW
│   │
│   └── util/
│       ├── BlockTypeEnum.java         # extend: TEXT, CODE, AI_PROMPT, REVIEW, DIAGRAM
│       └── ValidationUtil.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml           # CHANGE: Render service URL + Aiven MySQL URI (remove Railway)
│   └── db/migration/
│       ├── V1__Init_Schema.sql
│       ├── V2__Add_CodeReview.sql
│       ├── V3__Add_Share_Links.sql    # NEW
│       └── V4__Add_Skills.sql         # NEW
│
├── src/test/java/com/notebook/api/
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── Dockerfile
├── pom.xml
├── .gitignore
└── README.md
```

---

## 3. Frontend — Directory Structure (New)

```
notebook-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (workspace)/
│   │   ├── notebooks/[id]/page.tsx    # main editor route
│   │   └── skills/page.tsx            # skills dashboard
│   └── share/[slug]/page.tsx          # public read-only view, no auth
│
├── components/
│   ├── editor/
│   │   ├── blocks/                    # TextBlock, CodeBlock, AiPromptBlock, ReviewBlock
│   │   ├── toolbar/
│   │   └── slash-menu/
│   ├── review/                        # ThreadedComment, GhostCodeOverlay
│   └── ui/                            # shadcn components
│
├── lib/
│   ├── api/                           # typed fetch client for the Spring Boot API
│   ├── execution/
│   │   └── pyodideRunner.ts           # worker-based, keeps main thread free
│   ├── store/                         # zustand slices: notebook, blocks, ai
│   └── auth/                          # JWT cookie handling (mirrors Spring Security, not Supabase)
│
├── types/                             # generate from OpenAPI spec (springdoc) to stay in sync
├── middleware.ts                      # route guard reading the JWT cookie
├── next.config.ts
└── package.json
```

**Monorepo option:** if you want the `docs/` folder from your feature list alongside both apps, wrap both in Turborepo:

```
notebook-monorepo/
├── apps/
│   ├── frontend/     (notebook-frontend above)
│   └── backend/      (notebook-backend above)
├── packages/
│   └── shared-types/ # optional — only if you don't generate types from OpenAPI
├── docs/
│   ├── FRD.md
│   ├── TRD.md   ← this file
│   ├── HLD.md
│   ├── LLD.md
│   ├── API.md
│   └── Testing_Strategy.md
└── turbo.json
```

---

## 4. Phased Roadmap

| Phase | Scope | Rationale |
|---|---|---|
| **MVP** | Block editor, code blocks + Pyodide (Python only), notebook CRUD, JWT auth, MD/PDF/JSON export, read-only share links | This is your original FRD, functionally unchanged |
| **v1.5** | Code review threads + ghost code, AI Prompt Block (OpenRouter, rate-limited via Bucket4j), skills dashboard + streaks, snippet library | Your differentiating "ace points" — ship these next since they're what makes the resume story land |
| **v2** | Real-time collaboration (separate Yjs/y-websocket Node service, not inside Spring Boot), knowledge graph view, offline-first/PWA, multi-language execution (revisit WebContainers licensing before committing) | Each is a substantial subsystem on its own — sequencing prevents scope stall |

**Note on v2 collaboration:** Yjs's CRDT sync ecosystem (`y-websocket`, awareness protocol) is JS-native. Rather than reimplementing CRDT logic in Java, run a small standalone Node service just for the realtime socket layer, deployed as its own free Render service. Keep Spring Boot focused on the core API, auth, and data — which is also where the Java/Spring resume signal lives.

---

## 5. Security & Rate Limiting (carried over from TRD v1, updated)

- Authentication: Spring Security, stateless JWT
- AI Prompt Block rate limiting: Bucket4j, per-user, in-process (no external rate-limiting service needed)
- Code sandboxing: client-side execution stays inside Web Workers (Pyodide) — no server-side arbitrary code execution in MVP
- Share links: read-only by design, optionally time-limited via `ShareLink.expiresAt`

---

## 6. Open Decisions Carried Forward

1. **WebContainers licensing** — confirm at v2 planning time whether the project's usage still qualifies as non-commercial, or budget for the commercial license.
2. **Render cold starts** — decide whether to accept them or add a free uptime-monitor keep-alive.
3. **Vercel commercial-use boundary** — no action needed today; revisit only if the project is ever monetized.