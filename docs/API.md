# API Reference
**Project:** All-in-One Developer Notebook
**Base URL:** `https://<your-render-service>.onrender.com/api/v1`
**References:** LLD §3 (endpoint table), HLD §6 (flows)

---

## Authentication

All endpoints except those marked **Public** require a JWT bearer token:

```
Authorization: Bearer <token>
```

Tokens are issued by `POST /auth/login` and expire per `JwtTokenProvider` config (default: 24h — adjust in `application-prod.yml`).

---

## Auth

### `POST /auth/register`
**Auth:** Public

Request:
```json
{ "username": "saurabh_dev", "email": "you@example.com", "password": "..." }
```
Response `201`:
```json
{ "token": "eyJ...", "user": { "id": "uuid", "username": "saurabh_dev" } }
```

### `POST /auth/login`
**Auth:** Public

Request:
```json
{ "email": "you@example.com", "password": "..." }
```
Response `200`: same shape as register.

---

## Notebooks

### `GET /notebooks`
**Auth:** JWT
Response `200`:
```json
[ { "id": "uuid", "title": "Python Fundamentals", "parentFolderId": null, "createdAt": "..." } ]
```

### `POST /notebooks`
**Auth:** JWT
Request:
```json
{ "title": "New notebook", "parentFolderId": null }
```
Response `201`: `NotebookRes`

### `PUT /notebooks/{id}`
**Auth:** JWT — request/response same shape as create.

### `DELETE /notebooks/{id}`
**Auth:** JWT — response `204`.

---

## Blocks

### `GET /notebooks/{id}/blocks`
**Auth:** JWT
Response `200`:
```json
[
  { "id": "uuid", "blockType": "TEXT", "orderIndex": 0, "content": { "markdown": "## Overview" } },
  { "id": "uuid", "blockType": "CODE", "orderIndex": 1, "language": "python",
    "content": { "source": "print('hi')", "lastOutput": "hi" } }
]
```

### `POST /notebooks/{id}/blocks`
**Auth:** JWT
Request:
```json
{ "blockType": "CODE", "language": "python", "content": { "source": "" } }
```
Response `201`: `BlockRes`

### `PATCH /blocks/{id}/reorder`
**Auth:** JWT
Request:
```json
{ "newIndex": 2 }
```
Response `204`

---

## Code Review

### `POST /reviews/{blockId}/comments`
**Auth:** JWT
Request:
```json
{ "lineNumber": 4, "body": "Consider validating this input" }
```
Response `201`: `ReviewCommentRes`

### `PATCH /reviews/comments/{id}`
**Auth:** JWT
Request:
```json
{ "status": "ACCEPTED" }
```
Response `200`: `ReviewCommentRes`

---

## AI

### `POST /ai/prompt`
**Auth:** JWT
**Rate limit:** 5 requests/minute/user (Bucket4j). Exceeding it returns `429`.

Request:
```json
{ "prompt": "Explain this function", "targetBlockId": "uuid" }
```
Response `200`:
```json
{ "response": "This function calculates...", "model": "meta-llama/llama-3-8b" }
```
Response `429`:
```json
{ "error": "rate_limited", "retryAfterSeconds": 42 }
```

---

## Skills

### `GET /skills/progress`
**Auth:** JWT
Response `200`:
```json
[ { "skillName": "Python", "masteryLevel": "PRACTICING", "streakCount": 6 } ]
```

---

## Sharing

### `POST /notebooks/{id}/share`
**Auth:** JWT
Request:
```json
{ "expiresAt": null }
```
Response `201`:
```json
{ "slug": "a1b2c3", "url": "https://<frontend>/share/a1b2c3" }
```

### `GET /share/{slug}`
**Auth:** Public — no JWT required. Returns `404` if slug is invalid or expired.
Response `200`:
```json
{ "title": "Python Fundamentals", "blocks": [ /* read-only block list */ ] }
```

---

## Export

### `POST /export/{notebookId}?format=md|pdf|json`
**Auth:** JWT — returns a file stream (`Content-Disposition: attachment`).

### `POST /export/{notebookId}?format=toon`
**Auth:** Called only by the Cloudflare Worker with a service credential, not a user JWT — see HLD §6.5. Not intended to be called directly from the frontend.

---

## Standard Error Shape

All errors (except validation) follow:
```json
{ "error": "not_found", "message": "Notebook not found" }
```

Validation errors additionally include a `fields` map:
```json
{ "error": "validation_failed", "fields": { "title": "must not be blank" } }
```

See LLD §9 for the full exception → status mapping.