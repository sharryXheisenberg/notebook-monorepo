# Functional Requirements Document (FRD) — v2
**Project:** All-in-One Developer Notebook
**Supersedes:** FRD v1
**References:** TRD v2, HLD
**Change summary:** Feature set reorganized into MVP / v1.5 / v2 phases to match the roadmap in TRD v2 §4. Supabase/Firebase removed from technical constraints (Java/Spring Boot + Aiven MySQL confirmed instead). WebContainers-based multi-language execution moved to v2, conditional on licensing review.

---

## 1. Executive Summary

The All-in-One Developer Notebook is a unified, block-based workspace for software engineers and learners. It merges rich-text documentation with executable code environments, integrated AI assistance, and built-in code review mechanics, removing the need to switch between a note-taking app, a local IDE, and a separate AI chat window.

## 2. Target Audience

- **Software engineers** — documenting architectures, HLDs, and functional workflows
- **Competitive programmers** — fast, template-driven environments for algorithmic problem-solving
- **Full-stack trainees** — tracking progress across languages and frameworks
- **AI/ML engineers** — collecting and exporting well-formatted code/notes as LLM training data (TOON export)

## 3. Functional Requirements by Phase

### 3.1 MVP

**Block-based editor**
- Slash (`/`) command menu to insert block types
- Rich text blocks with full Markdown (bold, italics, lists, alignment, embeds)
- Structural blocks: Headings (H1–H3), Dividers, Quotes
- Drag-and-drop block reordering within a notebook

**Code blocks**
- Syntax highlighting for major languages (Java, C++, Python, JavaScript)
- Language selector per code block
- Client-side execution for Python via Pyodide, output shown in a collapsible console block
- Execution timeout to prevent infinite-loop resource exhaustion

**Project & file management**
- Create, rename, organize, delete notebooks
- Nested folder structure in a collapsible sidebar
- Global search (Ctrl+K/Cmd+K) across titles and text block contents

**Export & sharing**
- Export a notebook as Markdown or PDF
- Export as JSON and the specialized TOON format (LLM training data pipeline)
- Read-only public share links (no auth required to view)

### 3.2 v1.5 — Differentiating features ("ace points")

**Code Review Mode**
- Highlight code lines → attach threaded comments (GitHub PR-style)
- Ghost-code suggestion UI: proposed edits hover transparently over original text until explicitly accepted or rejected

**AI Prompt Block**
- Connects to OpenRouter free-tier models (Llama, Mistral, etc.)
- Contextual actions: explain code, generate tests, refactor suggestions, summarize notebook
- Rate-limited per user per minute (Bucket4j, server-enforced)

**Skills tracking**
- Per-language/topic mastery levels (Learning / Practicing / Mastered)
- Streak counter tied to notebook activity
- Progress dashboard

**Snippet library**
- Tag and search reusable code snippets across all notebooks

### 3.3 v2 — Deferred, each a standalone subsystem

- **Real-time collaboration** — via a standalone Yjs/y-websocket service (not built into the Spring Boot API)
- **Multi-language in-browser execution** — via WebContainers; **conditional on a licensing review**, since production/non-prototype use requires a StackBlitz commercial license
- **Knowledge graph view** — bi-directional links between notes/snippets
- **Offline-first** — IndexedDB with sync-on-reconnect
- **Mobile-friendly PWA support**
- Embedded live demos / sandboxes, Mermaid/Excalidraw diagrams

## 4. Unique Selling Propositions (USPs)

The combination of inline code review, skill tracking, and a direct LLM-training-data export pipeline elevates this from a note-taking app to a developer growth + data-collection platform — none of Notion, Obsidian, or VS Code combine these three.

## 5. Technical Constraints & Architecture Context

*(Full detail in TRD v2 — summarized here for traceability)*

- **Frontend:** Next.js 15, deployed on Vercel Hobby — **non-commercial use only**, consistent with this being a portfolio project
- **Backend:** Java 17, Spring Boot, deployed on **Render** (confirmed — not Railway, whose free tier is no longer viable for an always-on service)
- **Database:** MySQL via **Aiven's free tier** (confirmed — genuinely free with no time limit)
- **AI:** OpenRouter free-tier models only
- **Edge/serverless:** Cloudflare Workers for the TOON export transform
- **Removed from architecture:** Supabase and Firebase are not used anywhere in this project — auth, data, and storage are all handled by the Spring Boot + Aiven MySQL layer

## 6. Out of Scope (v2, explicitly deferred)

- Real-time, multi-user synchronous collaboration (CRDTs) — until a small dedicated Node/Yjs service is built
- Full server-side execution of heavy backend frameworks inside a notebook block
- Complex Git branch syncing (MVP ships basic version history only)
- Multi-language in-browser execution beyond Python — pending WebContainers licensing decision