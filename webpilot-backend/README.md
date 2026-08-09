# WebPilot

WebPilot is a local, full-stack AI workspace application. Users can create and switch between conversations, send natural-language requests to an AI agent, modify a visual workspace through structured tool calls, and render generated HTML artifacts in an isolated preview.

The repository contains:

- `webpilot-frontend` — React 19 application served by Vite.
- `webpilot-backend` — Spring Boot 4.1 application using Java 21, PostgreSQL, JPA, and Flyway.
- `docker-compose.yml` — PostgreSQL 15 development database.

## Current capabilities

- Conversation creation, listing, loading, title generation, and deletion.
- Persistent user messages and AI responses.
- Local default user (`local_user`) for the MVP; authentication is not implemented.
- Light and dark theme persistence in PostgreSQL, with browser `localStorage` fallback.
- AI-controlled workspace operations:
  - Set a solid background color.
  - Set a background gradient.
  - Change the application theme.
  - Add, remove, or update supported UI elements.
  - Show workspace notifications.
  - Clear the generated workspace.
- Generated UI artifacts: an AI response containing a fenced `html` block is displayed in an iframe with `sandbox="allow-scripts"`.
- Backend health checking from the frontend.

## Architecture

```text
Browser
  │
  │ VITE_API_BASE_URL
  ▼
React/Vite frontend
  ├─ App and layout components
  ├─ useChat state and API integration
  ├─ conversation sidebar and chat panels
  ├─ workspace reducer and AI component canvas
  └─ generated HTML artifact iframe
  │
  │ HTTP/JSON
  ▼
Spring Boot backend
  ├─ REST controllers
  ├─ conversation, message, theme, and user services
  ├─ Spring Data JPA repositories
  ├─ Flyway database migrations
  └─ Gemma REST client
  │
  ├──────────────► PostgreSQL
  └──────────────► Google Generative Language API
```

## Technology stack

### Frontend

- React `19.2.8`
- React DOM `19.2.8`
- Vite `8.2.0`
- ESLint `10.8.0` with React Hooks and React Refresh rules
- Plain JavaScript/JSX and CSS; no frontend router or state-management package is used.

### Backend

- Java `21`
- Spring Boot `4.1.0`
- Spring Web MVC
- Spring Data JPA / Hibernate
- PostgreSQL JDBC driver
- Flyway migrations
- Spring validation
- Google GenAI dependency is declared, while the current `GemmaClient` calls the Generative Language REST endpoint using Spring `RestClient`.

## Repository layout

```text
Build/
├─ .gitignore
├─ README.md
├─ docker-compose.yml
├─ webpilot-backend/
│  ├─ .env
│  ├─ pom.xml
│  ├─ mvnw / mvnw.cmd
│  └─ src/
│     ├─ main/java/com/webpilot/
│     │  ├─ WebpilotBackendApplication.java
│     │  ├─ client/GemmaClient.java
│     │  ├─ controller/
│     │  ├─ dto/
│     │  ├─ entity/
│     │  ├─ repository/
│     │  └─ service/
│     ├─ main/resources/
│     │  ├─ application.properties
│     │  └─ db/migration/
│     └─ test/java/
└─ webpilot-frontend/
   ├─ .env
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      ├─ App.jsx
      ├─ components/
      ├─ hooks/useChat.js
      ├─ services/api.js
      ├─ agent/
      └─ utils/artifactParser.js
```

## Prerequisites

Install the following before starting the application:

- JDK 21 with `JAVA_HOME` configured.
- Node.js and npm compatible with the installed Vite version.
- Docker Desktop, or a local PostgreSQL 15-compatible server.
- A Google Generative Language API key for AI requests.

## Configuration

All backend configuration parameters are consolidated in `webpilot-backend/src/main/resources/application.properties`.

### Backend environment

The backend imports an optional `.env` file from its working directory through `spring.config.import=optional:file:.env[.properties]`. Create `webpilot-backend/.env` for local development:

```properties
DB_URL=jdbc:postgresql://localhost:5432/webpilot
DB_USERNAME=postgres
DB_PASSWORD=postgresql
FRONTEND_URL=http://localhost:5173
GOOGLE_API_KEY=your_google_api_key
```

Configured variables:

| Variable | Purpose | Local Example |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/webpilot` |
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgresql` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `GOOGLE_API_KEY` | Google Generative Language API key | `your_google_api_key` |

The configured AI model is `gemma-4-26b-a4b-it`. A valid `GOOGLE_API_KEY` is required for AI model calls to succeed.

### Frontend environment

Create `webpilot-frontend/.env`:

```properties
VITE_API_BASE_URL=http://localhost:8080
```

Vite exposes only variables prefixed with `VITE_` to browser code. The frontend calls backend routes by appending paths such as `/api/theme` and `/api/conversations` to this base URL.

### Local Development vs. Production Configuration

- **Local Development:** Create `.env` files in `webpilot-backend/` and `webpilot-frontend/` using local development values. Local `.env` files are included in `.gitignore` and must never be committed to Git.
- **Production Deployment:** Do not deploy local `.env` files. In production (e.g. AWS, Render, Heroku, Docker containers), configure environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_URL`, `GOOGLE_API_KEY`, `VITE_API_BASE_URL`) directly via the deployment platform's environment settings or secrets manager.

## Start the database

From the repository root:

```powershell
docker compose up -d db
```

The compose file creates:

- Database: `webpilot`
- Username: `postgres`
- Password: `postgresql`
- Host port: `5432`
- Container: `webpilot_db`
- Persistent volume: `webpilot_pgdata`

Stop the database with:

```powershell
docker compose down
```

Use `docker compose down -v` only when you intentionally want to delete the persisted database volume.

## Run the backend

Open a terminal in `webpilot-backend`:

```powershell
cd webpilot-backend
.\mvnw.cmd spring-boot:run
```

The backend starts on Spring Boot's default port, `8080`. The Windows Maven wrapper is `mvnw.cmd`; the equivalent Unix command is `./mvnw spring-boot:run`.

To build and test:

```powershell
.\mvnw.cmd clean test
```

## Run the frontend

Open another terminal in `webpilot-frontend`:

```powershell
cd webpilot-frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

Start the backend before using conversations or AI features. The frontend initially checks `/api/theme`; it marks the backend as disconnected if that request fails.

## REST API

All routes are under the `/api` prefix. JSON timestamps are returned as `LocalDateTime` values by Spring's default serialization.

### Health

| Method | Path | Description | Response |
|---|---|---|---|
| `GET` | `/api/health` | Verifies that the backend process is running. | Plain text: `WebPilot backend is running` |

### Theme

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/theme` | — | Returns `{ "theme": "dark" }` or the saved theme. |
| `POST` | `/api/theme` | `{ "theme": "light" }` | Saves and returns `light` or `dark`. Other values are rejected. |

### Conversations

| Method | Path | Body | Description |
|---|---|---|---|
| `GET` | `/api/conversations` | — | Lists the default user's conversations, newest updated first. |
| `GET` | `/api/conversations/{id}` | — | Returns conversation metadata and messages ordered oldest first. |
| `POST` | `/api/conversations` | `{ "title": "Optional title" }` | Creates a conversation. Missing or blank titles become `New Conversation`. |
| `DELETE` | `/api/conversations/{id}` | — | Deletes a conversation and cascades its messages. |

### Agent

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/agent` | `{ "conversationId": 1, "message": "Make the background blue" }` | Persists the user message, calls Gemma, persists the AI response, and returns a JSON string describing a message or tool calls. |

Typical agent response shapes are:

```json
{"type":"message","message":"..."}
```

```json
{"type":"tool_calls","actions":[{"tool":"set_background_color","args":{"color":"#2563eb"}}],"message":"..."}
```

The frontend executes tool calls locally through `toolDispatcher`; workspace changes are not persisted by the backend.

## Data model and migrations

Flyway applies migrations from `webpilot-backend/src/main/resources/db/migration`:

1. `V1__create_users.sql` — creates users.
2. `V2__create_conversations.sql` — creates conversations belonging to users and indexes user/update time.
3. `V3__create_messages.sql` — creates messages belonging to conversations and cascades deletes.
4. `V4__create_user_settings.sql` — creates one theme settings row per user.

The backend uses `spring.jpa.hibernate.ddl-auto=validate`; schema changes should be introduced through new Flyway migrations rather than Hibernate auto-creation.

## AI and workspace flow

1. The frontend loads the default user's conversations and theme during initialization.
2. A user sends a message to `POST /api/agent`.
3. The backend saves the user message and sends the prompt to Google Generative Language API.
4. `GemmaClient` supplies the system instruction and eight declared workspace tools.
5. The backend normalizes the model response into either `type: message` or `type: tool_calls` JSON.
6. The backend saves the normalized AI response as an `ai` message.
7. The frontend either displays the message, dispatches tool calls into `workspaceReducer`, or extracts a fenced HTML artifact.
8. HTML artifacts are previewed in a sandboxed iframe and can be refreshed, copied, full-screened, or closed.

Supported workspace element types are `button`, `heading`, `text`, `input`, `card`, `badge`, and `divider`.

## Testing and verification

Current automated coverage includes a Spring context-load test in `webpilot-backend/src/test`. The frontend has build and lint scripts but no configured test runner.

A basic verification sequence is:

1. Start PostgreSQL.
2. Start the backend and confirm `GET http://localhost:8080/api/health`.
3. Start the frontend.
4. Create a conversation.
5. Send a normal question.
6. Send a workspace request such as `Set the background to blue`.
7. Send a complex request such as `Build a calculator` and verify that the generated HTML appears in the artifact panel.
8. Toggle the theme and reload both applications.

## Important implementation notes

- This is an MVP with a single automatically-created local user. There is no authentication, authorization, user isolation, or account management.
- `FRONTEND_URL` is used as one exact CORS origin. It must match the browser origin, including the port.
- The model response is stored as the AI message exactly as returned by the backend, including the normalized JSON envelope.
- Workspace components, notifications, and background changes exist only in frontend React state and are cleared when switching conversations.
- Generated artifact JavaScript is allowed by the iframe sandbox. Treat model-generated HTML as untrusted content and review the security model before exposing the application beyond local development.
- The backend currently logs prompts and AI failures to standard output. Avoid using sensitive prompts in development logs.
- Conversation and message lookup errors currently surface as `IllegalArgumentException`; there is no dedicated global error response format.

## License

No license file or license declaration is currently present in the repository.
