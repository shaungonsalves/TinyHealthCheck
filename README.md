# Tiny Health Check Service

A microservice ecosystem that monitors the availability of user-defined websites.  
The system consists of a Fastify API, a background worker using BullMQ, a React frontend with real‑time updates via SSE, and Redis for data storage and coordination.

## Features

- **Register URLs** via a simple REST endpoint.
- **Background health checks** every configurable interval (default 30 seconds).
- **Real‑time dashboard** showing status (up/down), latency, and last check time.
- **Server‑Sent Events (SSE)** for instant updates without polling.
- **Configurable check interval** directly from the frontend.
- **Docker Compose** orchestration for easy local deployment.
- **GitHub Actions CI** pipeline for linting and building.

## Architecture Overview

The system is split into four main components:

1. **Backend API** (Fastify + TypeScript) – exposes REST endpoints and SSE stream.
2. **Worker** (BullMQ + Redis) – performs periodic health checks and publishes updates.
3. **Frontend** (React + Material UI) – dashboard with form and live status table.
4. **Redis** – stores targets, latest health status, and acts as a message broker.

All services are containerised and can be started with a single `docker compose up` command.

For detailed architectural decisions, see [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) (or `docker compose` plugin)
- Node.js 24 (only for local development without Docker)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tiny-health-check.git
   cd tiny-health-check
   ```

2. Create the configuration files (or use the provided examples):
   ```bash
   cp config/backend.example.json config/backend.json
   cp config/worker.example.json config/worker.json
   cp frontend/public/config.example.json frontend/public/config.json
   ```
   Adjust values as needed.

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. Access the dashboard at [http://localhost](http://localhost)  
   - Backend API is available at `http://localhost:8080` (or via `/api` proxy)
   - Redis Commander for debugging: [http://localhost:8081](http://localhost:8081)

## Configuration

Configuration is externalised in JSON files:

- **Backend**: `config/backend.json` – Redis connection, server port, log level.
- **Worker**: `config/worker.json` – Redis connection, default check interval, log level.
- **Frontend**: `frontend/public/config.json` – API base path, reconnect parameters, available intervals.

Mount these files as volumes in `docker-compose.yml` to change settings without rebuilding.

## API Endpoints

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| POST   | `/targets`          | Register a new URL to monitor        |
| GET    | `/status`           | Get latest status for all URLs       |
| GET    | `/events`           | SSE stream of real‑time updates      |
| POST   | `/config/interval`  | Update health check interval (worker)|

For full API documentation, see [BACKEND.md](BACKEND.md).

## Frontend

The dashboard is a single‑page application built with React and Material UI.  
Features include:
- Add new URLs with inline validation.
- Live status table with colour‑coded indicators.
- Configurable check interval via dropdown.
- Persistent connection alert when SSE is lost.
- Manual refresh button.

See [FRONTEND.md](FRONTEND.md) for UI/UX details and component structure.

## Development (Without Docker)

Each service can be run locally for development:

```bash
# Backend
cd backend
yarn install
yarn dev

# Worker (in another terminal)
cd worker
yarn install
yarn dev

# Frontend
cd frontend
yarn install
yarn dev
```

Ensure Redis is running locally (e.g., `docker run -p 6379:6379 redis:7-alpine`).

## CI/CD

A GitHub Actions workflow is included (`.github/workflows/main.yml`) that:
- Runs on pull requests to `main`.
- Installs dependencies for all services.
- Runs TypeScript type checking and ESLint.
- Builds Docker images.

## License

This project is provided as a technical assessment and is not licensed for production use.

---
