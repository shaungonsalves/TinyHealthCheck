# Frontend Overview

This document describes the frontend architecture for the Tiny Health Check Service. It covers the system design, UI behavior, data‑flow patterns, and error‑handling strategy.

---

# 1. High‑Level Architecture

The frontend is a lightweight Single Page Application built with:

- **React + TypeScript** for component structure and state management  
- **Vite** for fast development and bundling  
- **SSE (Server‑Sent Events)** for real‑time updates  
- **REST API calls** for target registration and initial status loading  

The dashboard provides:

- A form to register new URLs  
- A real‑time table of monitored URLs, their availability, and latency  
- Automatic updates via SSE without polling  

The frontend is intentionally minimal, focusing on clarity and responsiveness.

---

# 2. Data Flow Overview

### **Initial Load**
1. On mount, the app fetches `/status` to populate the initial table.
2. React state stores the list of URLs and their latest health data.

### **Real‑Time Updates**
1. The app opens an SSE connection to `/events`.
2. Each incoming event contains `{ url, up, latency, lastChecked }`.
3. React merges the update into local state.
4. The UI re-renders automatically.

### **Adding a New Target**
1. User submits a URL via the form.
2. The app sends `POST /targets`.
3. On success:
   - The new URL appears immediately in the table (optimistic update).
   - The worker will begin checking it on the next cycle.
4. On failure:
   - The UI displays an error message.

---

# 3. UI Components

### **App**
- Initializes SSE connection  
- Loads initial status  
- Holds global state for all targets  

### **TargetForm**
- Input field for URL  
- Submits to `/targets`  
- Displays validation or server errors  

### **StatusTable**
- Displays all tracked URLs  
- Shows:
  - URL
  - Availability indicator (green/red)
  - Latency
  - Last checked timestamp  

### **StatusRow**
- Renders a single URL’s status  
- Updates automatically when parent state changes  

---

# 4. API Interactions

## **POST /targets**
Used when the user adds a new URL.

### **Frontend Behavior**
- Validate URL format before sending
- Send JSON payload
- On success: update local state
- On error: show inline message

### **Error Handling**
- **400** → invalid URL → show validation error  
- **409** → already exists → show conflict message  
- **500** → generic error → show retry option  

---

## **GET /status**
Used on initial page load.

### **Frontend Behavior**
- Fetch once on mount
- Populate initial table
- If SSE is delayed, this ensures the UI is not empty

### **Error Handling**
- **500** → show fallback error banner  
- Retry button may be displayed  

---

## **GET /events (SSE)**
Used for real‑time updates.

### **Frontend Behavior**
- Open `EventSource` connection
- Listen for `message` events
- Parse JSON payload
- Merge into React state

### **Error Handling**
- Automatic reconnection handled by browser  
- If connection repeatedly fails:
  - Show “Reconnecting…” indicator  
  - Continue retrying in background  

---

# 5. State Management

The frontend uses simple React state:

```ts
const [statuses, setStatuses] = useState<Record<string, Status>>();
```

Updates come from:

- Initial `/status` fetch  
- SSE events  
- Optimistic updates after `POST /targets`  

State updates are shallow merges to avoid unnecessary re-renders.

---

# 6. Error & Exception Handling

### **Form Errors**
- Invalid URL format → inline message  
- Server validation errors → displayed near input  

### **Network Errors**
- Fetch failures → banner with retry  
- SSE disconnect → non-blocking reconnect indicator  

### **Unexpected Errors**
- Logged to console for debugging  
- User-facing message kept minimal to avoid noise  

### **HTTP Status Codes**
| Code | Meaning | Frontend Behavior |
|------|---------|------------------|
| **200** | Success | Update UI normally |
| **201** | Created | Add new target to table |
| **400** | Bad Request | Show validation error |
| **409** | Conflict | Show “already exists” |
| **500** | Server Error | Show error banner |

---

# 7. Frontend Responsibilities Summary

| Component | Responsibilities |
|----------|------------------|
| **React App** | State management, SSE subscription, initial load |
| **TargetForm** | URL submission, validation, error display |
| **StatusTable** | Render list of statuses |
| **SSE Client** | Real‑time updates from backend |
| **REST Client** | POST /targets, GET /status |

---

# 8. Future Extensions (Optional)

- Per‑URL configuration (intervals, thresholds)  
- Sorting and filtering in the dashboard  
- Historical charts (latency over time)  
- Authentication for write operations  
- Dark mode / UI theming  

```

---