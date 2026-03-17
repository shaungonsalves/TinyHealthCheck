# DESIGN_DECISIONS

This document outlines the key architectural decisions made for the Tiny Health Check Service, including justifications and tradeoffs where meaningful alternatives existed.

---

## 1. Architecture Split: API Service + Worker Service + Redis

**Justification**  
Separating the API and worker into independent services aligns with common cloud architectures where request/response workloads and background processing scale independently. Redis acts as the shared coordination layer for targets, statuses, and job scheduling.

**Tradeoffs & Alternatives**

| Option | Pros | Cons | Why Not Chosen |
|-------|------|------|----------------|
| **Single Node process with cron** | Simple, fewer containers | API and worker tightly coupled; failures cascade | Limited scalability and isolation |
| **API + Worker + Redis (chosen)** | Clear boundaries, independent scaling | Slightly more setup | Provides clean separation of concerns |
| **API triggers Cloud Tasks / PubSub** | Highly scalable | Requires additional infrastructure | Unnecessary for the scope of this system |

---

## 2. Runtime & Language: Node.js + TypeScript

**Justification**  
TypeScript provides strong typing, safer refactoring, and clearer contracts between the API, worker, and shared models. It improves maintainability and reduces runtime errors.

---

## 3. Web Framework: Fastify

**Justification**  
Fastify offers strong TypeScript support, built‑in schema validation, and high throughput. It encourages explicit route definitions and structured responses.

**Tradeoffs & Alternatives**

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Express** | Familiar, large ecosystem | Weaker TypeScript support, no built‑in schemas | Less structured for typed APIs |
| **NestJS** | Strong architectural patterns | Heavier framework, more boilerplate | More complexity than needed |
| **Fastify (chosen)** | Fast, modern, TS‑first | Smaller ecosystem | Balanced performance and simplicity |

---

## 4. Data Store: Redis for Targets + Status

**Justification**  
Redis is well‑suited for ephemeral, low‑latency data such as health statuses. It avoids schema overhead and provides fast access for both the API and worker.

**Tradeoffs & Alternatives**

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **SQLite/Postgres** | Durable, relational | Requires migrations and schema management | More complexity than needed for ephemeral data |
| **In-memory JS store** | Very simple | No persistence across restarts | Not suitable for multi‑service environments |
| **Redis (chosen)** | Fast, simple, cloud‑aligned | Not durable for long‑term history | Ideal for real‑time status tracking |

---

## 5. Asynchronous Processing: BullMQ

**Justification**  
BullMQ provides a robust queue abstraction with retries, backoff, concurrency, and delayed jobs. It integrates cleanly with Redis and supports predictable background processing.

**Tradeoffs & Alternatives**

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **setInterval in worker** | Simple | No retries or concurrency control | Insufficient for reliable background work |
| **Agenda.js** | Cron-like scheduling | Requires MongoDB | Does not align with Redis-based design |
| **BullMQ (chosen)** | TS‑first, Redis‑backed, reliable | Slightly more setup | Provides strong async processing guarantees |

---

## 6. Frontend Update Model: Server‑Sent Events (SSE) for Real‑Time Streaming

**Justification**  
The dashboard receives health‑check updates through a Server‑Sent Events (SSE) stream. SSE provides a lightweight, browser‑native mechanism for pushing one‑way updates from the server to the client. This matches the system’s event pattern: the worker produces new health‑check results, and the dashboard updates immediately without polling. React state stores the latest statuses and triggers UI updates as events arrive.

**Tradeoffs & Alternatives**

| Approach | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **Fixed-interval polling** | Simple | Higher latency, unnecessary network load | Less efficient for continuous updates |
| **WebSockets** | Full duplex | Requires additional infrastructure and connection management | More complex than needed |
| **SSE (chosen)** | Lightweight, native, ideal for push-only updates | One‑way only | Best fit for streaming health‑check results |

**Notes**  
- SSE integrates cleanly with Redis Pub/Sub, allowing the API to push updates as soon as new results are available.  
- React state ensures the UI updates immediately without manual DOM manipulation.

---

## 7. Frontend: React + Vite SPA

**Justification**  
A React SPA provides a clean, responsive dashboard with strong TypeScript support. Vite offers fast development cycles and efficient bundling.

---

## 8. Containerization: Multi-Service Docker + docker-compose

**Justification**  
Each service (API, worker, frontend, Redis) runs in its own container, orchestrated via `docker-compose`. This provides clear isolation, reproducibility, and a single command to start the entire system.

**Tradeoffs & Alternatives**

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Single Dockerfile** | Simpler | No service isolation | Does not reflect multi‑service architecture |
| **Kubernetes** | Highly scalable | Requires significant setup | Not necessary for this system |
| **docker-compose (chosen)** | Simple, reproducible, multi‑service | Slightly more configuration | Suitable for local orchestration |

---

## 9. CI Pipeline: GitHub Actions for Linting, Type Checking, and Docker Builds

**Justification**  
A GitHub Actions workflow ensures consistent linting, type checking, and Docker builds on pull requests. This maintains code quality and verifies that the system builds cleanly.

---

## 10. Observability: Structured Logging

**Justification**  
Structured logs (e.g., via pino) provide clear visibility into API requests, worker execution, and health‑check results. This supports debugging and operational insight without requiring a full metrics stack.

---
