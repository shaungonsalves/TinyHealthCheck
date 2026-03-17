# Backend Overview
This document describes the backend architecture for the Tiny Health Check Service. It covers the system design, exposed endpoints, background workflows, and error‑handling strategy.

---

# 1. High‑Level Architecture

The backend consists of three core components:

### **API Service (Fastify + TypeScript)**
- Exposes REST endpoints for managing targets and retrieving status.
- Exposes an SSE endpoint for streaming real‑time updates to the frontend.
- Publishes and subscribes to Redis channels for event propagation.

### **Worker Service (BullMQ + Redis)**
- Periodically checks the health of registered URLs.
- Measures latency and availability.
- Writes results to Redis and publishes update events.

### **Redis**
- Stores:
  - List of tracked URLs
  - Latest health status per URL
- Acts as:
  - Backend for BullMQ queues
  - Pub/Sub channel for streaming updates to the API

This separation allows the API and worker to scale independently and keeps responsibilities clear.

---

# 2. Data Model (Redis)

### **Keys**
- `targets:list`  
  List of all registered URLs.

- `status:{url}`  
  Hash containing:
  - `up`: `"true"` or `"false"`
  - `latency`: number (ms)
  - `lastChecked`: ISO timestamp

### **Pub/Sub Channels**
- `health:update`  
  Worker publishes `{ url, up, latency, lastChecked }` messages.

---

# 3. API Endpoints

## **POST /targets**
Registers a new URL for monitoring.

### **Request Body**
```json
{ "url": "https://example.com" }
```

### **Behavior**
1. Validate URL format.
2. Add URL to `targets:list` if not already present.
3. Return success response.

### **Responses**
- **201 Created** — URL registered
- **400 Bad Request** — invalid or missing URL
- **409 Conflict** — URL already tracked
- **500 Internal Server Error** — unexpected failure

---

## **GET /status**
Returns the latest health status for all tracked URLs.

### **Behavior**
1. Read all URLs from `targets:list`.
2. Fetch each `status:{url}` hash.
3. Return aggregated list.

### **Responses**
- **200 OK** — always returns an array (possibly empty)
- **500 Internal Server Error** — Redis failure

---

## **GET /events (SSE)**
Streams real‑time health updates to the frontend.

### **Behavior**
1. Establish an SSE connection.
2. Subscribe to Redis `health:update` channel.
3. Push events to the client as they arrive.

### **Event Payload**
```json
{ "url": "...", "up": true, "latency": 123, "lastChecked": "..." }
```

### **Responses**
- **200 OK** — SSE stream
- **500 Internal Server Error** — subscription failure

---

# 4. Worker Workflow

The worker uses BullMQ to schedule periodic health checks.

### **Workflow**
1. A repeating BullMQ job runs every N seconds.
2. Worker fetches all URLs from `targets:list`.
3. For each URL:
   - Perform an HTTP GET with timeout.
   - Measure latency.
   - Determine `up` status based on HTTP 200.
4. Write results to `status:{url}`.
5. Publish update event to `health:update` channel.

### **Failure Handling**
- Network errors → `up = false`, `latency = null`
- Timeouts → `up = false`
- Redis write failures → logged and retried by BullMQ

---

# 5. Error & Exception Handling

### **Validation Errors**
- Invalid URL format → **400 Bad Request**
- Missing required fields → **400 Bad Request**

### **Conflict Errors**
- URL already exists → **409 Conflict**

### **Operational Errors**
- Redis unavailable → **500 Internal Server Error**
- Worker job failure → logged + retried with exponential backoff

### **SSE Errors**
- Lost connection → client reconnects automatically
- Redis Pub/Sub failure → server logs and attempts reconnection

### **Logging**
All errors are logged with:
- timestamp  
- request ID  
- error type  
- stack trace (internal only)

---

# 6. Backend Responsibilities Summary

| Component | Responsibilities |
|----------|------------------|
| **API** | Manage targets, expose status, stream updates |
| **Worker** | Perform periodic health checks, publish updates |
| **Redis** | Store state, coordinate events, back BullMQ |

---

# 7. Future Extensions (Optional)

- Per‑URL check intervals  
- Historical time‑series storage  
- Authentication for API endpoints  
- Multi‑worker scaling  
- Prometheus metrics endpoint  

```

---