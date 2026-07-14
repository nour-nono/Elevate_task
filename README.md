# Elevate Task — Notes API Backend

A robust Node.js backend application built with **TypeScript**, **Express 5**, **Mongoose 9**, and **GraphQL**, implementing the Repository Pattern with a strict Service Layer separation of concerns.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [JWT Key Pair Generation](#jwt-key-pair-generation)
- [API Endpoints](#api-endpoints)
- [GraphQL API](#graphql-api)
- [Security Features](#security-features)
- [Performance Considerations](#performance-considerations)
- [Postman Collection](#postman-collection)

---

## Architecture

The application follows a **layered architecture** with strict separation of concerns:

```txt
┌──────────────────────────────────────────────────┐
│                  Express Router                  │  Route definitions + middleware wiring
├──────────────────────────────────────────────────┤
│                   Controller                     │  Thin HTTP handlers — parse req, call service, send res
├──────────────────────────────────────────────────┤
│                   Service Layer                  │  Business logic (Auth, User, Note, Password, Token, Email)
├──────────────────────────────────────────────────┤
│                 Repository Layer                 │  Data access abstraction (Base + entity repositories)
├──────────────────────────────────────────────────┤
│                   Mongoose Models                │  Schema definitions + hooks (bcrypt, timestamps, indexes)
├──────────────────────────────────────────────────┤
│                    MongoDB                       │  Persistent storage
└──────────────────────────────────────────────────┘
```

**Key design principles:**

- **Repository Pattern**: All database queries are encapsulated in repository classes. Services never touch Mongoose models directly.
- **Service Layer**: All business logic (authentication, password resets, OTP verification, ownership checks) lives in services. Controllers are thin HTTP adapters.
- **Dependency flow**: Controller → Service → Repository → Model → Database (one direction, no circular dependencies).
- **Single Responsibility**: Each file has one clear purpose.

---

## Tech Stack

| Concern              | Technology                                      |
|----------------------|-------------------------------------------------|
| Runtime              | Node.js (>=20)                                  |
| Language             | TypeScript 7                                    |
| Web Framework        | Express 5                                       |
| Database             | MongoDB via Mongoose 9                          |
| API Paradigm         | REST + GraphQL (Apollo Server v5)               |
| Authentication       | Asymmetric JWT (RS256) with token revocation    |
| Password Hashing     | bcrypt (Mongoose pre-save middleware)           |
| Input Validation     | Joi                                             |
| Email/OTP            | nodemailer (Ethereal for dev, SMTP for prod)    |
| File Uploads         | multer (local `uploads/` folder)                |
| Security             | helmet, cors, express-rate-limit                |
| Compression          | compression                                     |
| Environment Config   | dotenv                                          |

---

## Project Structure

```txt
Elevate_task/
├── keys/                           # RSA keypair (generated, gitignored)
│   ├── private.pem
│   └── public.pem
├── uploads/                        # Uploaded profile pictures (gitignored)
├── scripts/
│   └── generateKeys.ts             # RSA keypair generation script
├── src/
│   ├── config/                     # Configuration layer
│   │   ├── cors.ts                 # CORS options
│   │   ├── db.ts                   # MongoDB connection management
│   │   └── env.ts                  # Centralized environment variable config
│   ├── controllers/                # Thin HTTP controllers
│   │   ├── authController.ts       # Auth endpoints (register, login, logout, etc.)
│   │   └── notesController.ts      # Note endpoints (CRUD)
│   ├── graphql/                    # GraphQL layer
│   │   ├── context.ts              # GraphQL context builder (auth)
│   │   ├── resolvers.ts            # GraphQL resolvers
│   │   └── schema.ts               # GraphQL type definitions
│   ├── middlewares/                # Express middleware
│   │   ├── asyncWrapper.ts         # Async error catcher
│   │   ├── auth.ts                 # JWT verification + revocation check
│   │   ├── error.ts                # Global error + 404 handlers
│   │   ├── upload.ts               # multer file upload config
│   │   └── validate.ts             # Joi validation middleware
│   ├── models/                     # Mongoose schemas
│   │   ├── note.ts                 # Note schema (with text index, compound index)
│   │   ├── passwordReset.ts        # Password reset OTP records (TTL index)
│   │   ├── revokedToken.ts         # Revoked JWT tokens (TTL index)
│   │   └── user.ts                 # User schema (bcrypt pre-save hook)
│   ├── repositories/               # Repository Pattern
│   │   ├── baseRepository.ts       # Generic CRUD + pagination base class
│   │   ├── noteRepository.ts       # Note-specific queries (filter, ownership)
│   │   ├── passwordResetRepository.ts  # OTP upsert/verify/mark-used
│   │   ├── revokedTokenRepository.ts   # Token revocation storage
│   │   └── userRepository.ts       # User-specific queries
│   ├── routes/                     # Express route definitions
│   │   ├── authRoutes.ts           # /api/v1/auth/*
│   │   └── notesRoutes.ts          # /api/v1/notes/*
│   ├── services/                   # Service Layer (business logic)
│   │   ├── authService.ts          # Login, logout, token revocation
│   │   ├── emailService.ts         # OTP email via nodemailer
│   │   ├── noteService.ts          # Note creation, deletion, querying
│   │   ├── passwordService.ts      # Forgot/reset password with OTP
│   │   ├── tokenService.ts         # JWT issue/verify/revoke
│   │   └── userService.ts          # Registration, profile, password update
│   ├── types/
│   │   └── express.d.ts            # Express Request augmentation (req.user)
│   ├── utils/                      # Shared utilities
│   │   ├── apiError.ts             # Centralized error class
│   │   ├── httpStatus.ts           # HTTP status code constants
│   │   ├── jwt.ts                  # RS256 sign/verify utilities
│   │   ├── logger.ts               # Lightweight logger
│   │   └── otp.ts                  # OTP generation + hashing + expiry
│   ├── app.ts                      # Express app factory (middleware + routes + GraphQL)
│   └── index.ts                    # Server entry point (DB connect + listen)
├── .env.example                    # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Setup

### Prerequisites

- Node.js >= 20
- MongoDB (running locally or a connection URI)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Elevate_task

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and SMTP settings

# 4. Generate RSA keypair for JWT signing
npm run keys

# 5. Start the development server
npm run dev
```

### Available Scripts

| Script               | Description                                      |
|----------------------|--------------------------------------------------|
| `npm run dev`        | Start dev server with hot reload (tsx + nodemon) |
| `npm run build`      | Compile TypeScript to `dist/`                    |
| `npm start`          | Run compiled server from `dist/`                 |
| `npm run keys`       | Generate RS256 RSA keypair in `keys/`            |
| `npm run typecheck`  | Type-check without emitting                      |
| `npm run watch`      | Watch-compile TypeScript                         |
| `npm run format`     | Format code with Prettier                        |

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable              | Description                                      | Default                          |
|-----------------------|--------------------------------------------------|----------------------------------|
| `NODE_ENV`            | Environment (`development` / `production`)       | `development`                    |
| `PORT`                | Server port                                      | `3000`                           |
| `MONGO_URI`           | MongoDB connection string                        | `mongodb://127.0.0.1:27017/elevate_task` |
| `JWT_ACCESS_TTL`      | Access token TTL in seconds                      | `3600`                           |
| `JWT_PRIVATE_KEY_PATH`| Path to RSA private key                          | `keys/private.pem`               |
| `JWT_PUBLIC_KEY_PATH` | Path to RSA public key                           | `keys/public.pem`                |
| `SMTP_HOST`           | SMTP host (use `ethereal` for test emails)       | `smtp.ethereal.email`            |
| `SMTP_PORT`           | SMTP port                                        | `587`                            |
| `SMTP_USER`           | SMTP username (leave empty for Ethereal)         | —                                |
| `SMTP_PASS`           | SMTP password (leave empty for Ethereal)         | —                                |
| `OTP_LENGTH`          | OTP digit count                                  | `6`                              |
| `OTP_TTL_MINUTES`     | OTP expiry in minutes                            | `10`                             |
| `RATE_LIMIT_MAX`      | Max requests per rate-limit window               | `100`                            |

---

## JWT Key Pair Generation

This application uses **asymmetric JWT (RS256)** — tokens are signed with a private key and verified with a public key. This means the signing key never leaves the auth server.

```bash
npm run keys
```

This generates a 2048-bit RSA keypair:

- `keys/private.pem` — used to **sign** tokens (server-only, never shared)
- `keys/public.pem` — used to **verify** tokens (can be shared with other services)

Both files are gitignored and must never be committed.

---

## API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint              | Auth Required | Description                                             |
|--------|-----------------------|---------------|---------------------------------------------------------|
| POST   | `/register`           | No            | Register a new user (email + password)                  |
| POST   | `/login`              | No            | Login and receive RS256 JWT                             |
| POST   | `/logout`             | Yes           | Revoke the current token                                |
| PATCH  | `/upload-profile-pic` | Yes           | Upload profile picture (multipart/form-data)            |
| POST   | `/forget-password`    | No            | Request OTP for password reset (anti-enumeration)       |
| POST   | `/reset-password`     | No            | Reset password with OTP + new password                  |
| GET    | `/profile`            | Yes           | Get authenticated user's profile                        |

### Note Endpoints (`/api/v1/notes`)

| Method | Endpoint     | Auth Required | Description                                             |
|--------|--------------|---------------|---------------------------------------------------------|
| GET    | `/`          | Yes           | List notes (query params: `userId`, `title`, `startDate`, `endDate`, `page`, `limit`) |
| POST   | `/`          | Yes           | Create a new note                                       |
| DELETE | `/:id`       | Yes           | Delete a note (only if owned by authenticated user)     |

### Other Endpoints

| Method | Endpoint   | Description               |
|--------|------------|---------------------------|
| GET    | `/health`  | Health check              |
| POST   | `/graphql` | GraphQL endpoint          |

---

## GraphQL API

The GraphQL endpoint is available at `http://localhost:3000/graphql`.

### Schema

```graphql
type User {
  id: ID!
  email: String!
  profilePic: String
}

type Note {
  id: ID!
  title: String!
  content: String!
  owner: User!
  createdAt: String!
  updatedAt: String!
}

type NotePage {
  items: [Note!]!
  total: Int!
  page: Int!
  limit: Int!
  totalPages: Int!
  hasNextPage: Boolean!
  hasPrevPage: Boolean!
}

input NoteFilterInput {
  userId: ID
  title: String
  startDate: String
  endDate: String
}

type Query {
  notes(filter: NoteFilterInput, page: Int = 1, limit: Int = 10): NotePage!
  noteById(id: ID!): Note
}
```

### Example Queries

**Get notes filtered by title with pagination:**

```graphql
query {
  notes(filter: { title: "meeting" }, page: 1, limit: 10) {
    items {
      id
      title
      content
      createdAt
      owner {
        id
        email
      }
    }
    total
    page
    totalPages
    hasNextPage
  }
}
```

**Get notes filtered by date range:**

```graphql
query {
  notes(filter: { startDate: "2025-01-01", endDate: "2025-12-31" }) {
    items { id title }
    total
  }
}
```

**Get a single note by ID:**

```graphql
query {
  noteById(id: "507f1f77bcf86cd799439011") {
    id
    title
    content
    owner { id email }
  }
}
```

> All GraphQL queries require a Bearer token in the `Authorization` header.

---

## Security Features

1. **Asymmetric JWT (RS256)**: Tokens are signed with a private key and verified with a public key. The private key never leaves the server.

2. **Token Revocation**: On logout, the token's `jti` (JWT ID) is stored in a `RevokedToken` collection with a TTL index. The auth middleware checks this collection on every protected request. Expired revocation records are auto-deleted by MongoDB's TTL index.

3. **Password Hashing**: bcrypt hashing is performed automatically via Mongoose `pre('save')` middleware. Passwords are never stored in plaintext and are excluded from query results (`select: false`).

4. **Anti-Enumeration**: The forgot-password endpoint returns the same response regardless of whether the email exists, preventing user enumeration attacks.

5. **OTP Security**: OTPs are hashed with SHA-256 before storage. Rate-limited to 5 attempts. OTPs expire after 10 minutes (configurable). Used OTPs are marked as consumed.

6. **Input Validation**: All endpoints validate input with Joi schemas before processing. Validation errors return detailed field-level messages.

7. **Helmet**: Sets security HTTP headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.).

8. **CORS**: Configurable allowed origins. Permissive in development, restrictive in production.

9. **Rate Limiting**: 100 requests per 15-minute window (configurable). Prevents brute-force attacks.

10. **File Upload Safety**: Only image MIME types allowed. 5MB max file size. Filenames sanitized with timestamp + random bytes to prevent overwrites.

---

## Performance Considerations

1. **Database-Level Pagination**: Notes are paginated using `skip` + `limit` at the MongoDB query level — no in-memory slicing. The `findPaginated` method runs the count and data queries in parallel via `Promise.all`.

2. **Compound Indexes**: The Note model has a compound index on `{ userId: 1, createdAt: -1 }` for efficient user-scoped, time-ordered queries. A text index on `title` accelerates title searches.

3. **TTL Indexes**: Both `RevokedToken` and `PasswordReset` collections use MongoDB TTL indexes (`expireAfterSeconds: 0`) — MongoDB automatically deletes expired documents without application-level cleanup queries.

4. **Response Compression**: All responses are compressed with the `compression` middleware.

5. **Lean Population**: Notes queries populate the owner with a field projection (`select: 'email profilePic'`) to minimize data transfer.

6. **Connection Pooling**: Mongoose uses a default connection pool; `serverSelectionTimeoutMS` is set to fail fast.

7. **Async Error Handling**: The `asyncWrapper` middleware catches all async errors without try/catch boilerplate, reducing overhead and ensuring no unhandled rejections.

---

## Postman Collection

A Postman collection is included at `postman/Elevate_Task.postman_collection.json`. Import it into Postman to test all endpoints. The collection includes:

- Environment variable setup (`{{baseUrl}}`, `{{accessToken}}`)
- Auto-capturing of the access token from login response
- All auth endpoints
- Note CRUD endpoints
- GraphQL query examples
