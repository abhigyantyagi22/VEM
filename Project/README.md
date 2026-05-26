# VEM — Vehicle Event Manager

One-line summary

VEM is a full-stack Vehicle Event Manager: a Java Spring Boot backend exposing REST APIs and a React + Vite frontend UI. This README contains everything needed to run, test, and contribute.

Table of contents

- Overview
- Features
- Tech stack
- Prerequisites
- Environment & configuration
- Backend — develop, build, run
- Frontend — develop, build, run
- Database setup
- API reference (summary)
- Testing
- Docker (optional)
- CI / Deployment notes
- Contributing
- License & contact

Overview

VEM provides vehicle, driver, fuel log, maintenance, document, notification, and dashboard management for fleet operations. The API is located under `backend/` and the SPA under `frontend/`.

Features

- User authentication (login/register)
- Vehicle CRUD and workspace
- Driver management
- Fuel logs and maintenance records
- Document uploads
- Notifications and dashboard summaries

Tech stack

- Backend: Java 17, Spring Boot, Maven
- Database: PostgreSQL (development target) — SQL schema in `backend/database_setup.sql`
- Frontend: React, Vite, JavaScript

Prerequisites

- Java 17 or newer
- Maven 3.6+
- Node.js 18+ and npm (or pnpm)
- PostgreSQL (or another DB; update properties accordingly)

Environment & configuration

- Backend configuration: `backend/src/main/resources/application.properties`.
	- Typical properties to set:
		- `spring.datasource.url=jdbc:postgresql://localhost:5432/vemdb`
		- `spring.datasource.username=youruser`
		- `spring.datasource.password=yourpassword`
		- `jwt.secret=some-secret`
	- You can also use environment variables or a `.env` file combined with your run tooling.
- Frontend configuration: `frontend/` holds the Vite app. The frontend calls the backend API; set the base URL in `frontend/src/services/api.js` or via `VITE_API_URL`.

Backend — develop, build, run

1. Change to the backend directory:

```bash
cd backend
```

2. Configure `application.properties` (database and JWT secret).

3. Run in development:

```bash
mvn spring-boot:run
```

4. Build jar and run:

```bash
mvn package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

Notes
- If using a local PostgreSQL instance, create the database and apply the schema in `database_setup.sql` before starting the app.

Frontend — develop, build, run

1. Change to the frontend directory:

```bash
cd frontend
```

2. Install dependencies and start dev server:

```bash
npm install
npm run dev
```

3. Production build:

```bash
npm run build
# Serve `dist/` with a static server (e.g., `npx serve dist`) or integrate into backend static resources.
```

Database setup

- The repository includes `backend/database_setup.sql` which contains schema and seed statements. Example steps:

```sql
-- in psql or your DB tool:
CREATE DATABASE vemdb;
\c vemdb
\i backend/database_setup.sql
```

API reference (summary)

Controllers (backend):

- `AuthController` — endpoints: `/api/auth/login`, `/api/auth/register`
- `VehicleController` — vehicle CRUD and workspace endpoints under `/api/vehicles`
- `DriverController` — driver CRUD under `/api/drivers`
- `FuelLogController` — fuel log endpoints under `/api/fuellogs`
- `MaintenanceController` — maintenance records under `/api/maintenance`
- `DocumentController` — document upload/download under `/api/documents`
- `NotificationController` — notification retrieval under `/api/notifications`
- `DashboardController` — dashboard data under `/api/dashboard`

This README provides a summary — for full request/response shapes, see DTO classes under `backend/src/main/java/com/vem/backend/dto` and the controller methods in `backend/src/main/java/com/vem/backend/controller`.

Authentication

- The backend uses JWT. Obtain a token via `/api/auth/login` and include it as `Authorization: Bearer <token>` for protected endpoints.

Testing

- Backend unit/integration tests (Maven):

```bash
cd backend
mvn test
```

- Frontend tests (if present) via npm (check `package.json`):

```bash
cd frontend
npm test
```

Optional Docker (removed)

Docker-related assets (Dockerfiles and `docker-compose.yml`) were previously added for convenience but have been removed from the repository per project preference. You can still containerize the services later; if you want, I can re-add Dockerfiles and a `docker-compose.yml` that reference secure environment configuration (or provide a guide on how to containerize each service).

CI / Deployment notes

- Suggested steps for CI:
	- Run `mvn -DskipTests package` for backend
	- Lint and test frontend, then `npm run build`
	- Build and push Docker images
	- Run database migrations as part of deployment

Contributing

- Fork, create a feature branch, add tests, and open a PR with a clear description.
- Follow code style of the project. For backend Java code, run `mvn -DskipTests package` before opening a PR to ensure build passes.

License & contact

- Add your preferred license file to the repo (e.g., `LICENSE`).
- For questions, open an issue or contact the maintainers.

If you'd like, I can now:

- Add example environment files (`backend/.env.example`, `frontend/.env.example`)
- Generate a minimal `Dockerfile` for the backend and/or frontend
- Expand the API reference into an OpenAPI spec or a detailed endpoints table

Tell me which of the above you want next and I'll implement it.

Example environment files

I added sample environment files for local development:

- `backend/.env.example` — database URL/creds, `JWT_SECRET`, and `SERVER_PORT`.
- `frontend/.env.example` — `VITE_API_URL` to point the SPA to the backend.

Copy these to `backend/.env` and `frontend/.env` (or export equivalent environment variables) and update values before running.

Example curl requests

Use these quick examples to verify the main authentication flow and a protected endpoint. Adjust host/port and payloads as needed.

1) Register a new user

```bash
curl -X POST http://localhost:8080/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"username":"alice","password":"password123","email":"alice@example.com"}'
```

2) Login and receive a JWT

```bash
curl -X POST http://localhost:8080/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"username":"alice","password":"password123"}'

# Response example (JSON):
#{"token":"eyJhbGciOi..."}
```

3) Call a protected endpoint (get vehicle list)

```bash
TOKEN=<paste-token-from-login>
curl -X GET http://localhost:8080/api/vehicles \
	-H "Authorization: Bearer $TOKEN" \
	-H "Accept: application/json"
```

If you want, I can add these examples as a `docs/` page or generate a Postman collection / OpenAPI spec for easier sharing.
