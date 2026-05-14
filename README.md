# 🚀 KnowFlow

**KnowFlow** is a scalable, AI-powered document processing backend built with a modern TypeScript stack. It enables users to upload documents, process them asynchronously, generate AI summaries, and (soon) perform intelligent question answering using Retrieval-Augmented Generation (RAG).

---

## 🧠 Features

- 📄 Upload and manage documents
- ⚡ Asynchronous processing using BullMQ + Redis
- 🤖 AI-powered document summarization (OpenAI)
- 🧩 Chunking pipeline for large documents
- 🔄 Real-time status updates via WebSockets + Redis Pub/Sub
- 🗄️ PostgreSQL with Drizzle ORM
- 🧱 Monorepo architecture using Turborepo
- 🔐 User-scoped data access (secure by design)

---

## 🏗️ Architecture Overview

```
Client → API (Express)
            ↓
        PostgreSQL
            ↓
        Redis Queue (BullMQ)
            ↓
        Worker (Processing)
            ↓
        AI (Summarization / Embeddings)
            ↓
        Redis Pub/Sub → WebSocket → Client (Real-time updates)
```

---

## 📦 Monorepo Structure

```
apps/
  api/        → Express backend (routes, controllers, services)
  worker/     → Background job processor (BullMQ)

packages/
  db/         → Drizzle schema & database client
  queue/      → BullMQ configuration
  redis/      → Redis client + pub/sub
  ai/         → AI logic (summarization, chunking, embeddings)
```

---

## ⚙️ Tech Stack

- **Runtime**: Bun
- **Backend**: Express (TypeScript)
- **Database**: PostgreSQL (Drizzle ORM)
- **Queue**: BullMQ + Redis
- **AI**: OpenAI (gpt-4o-mini)
- **Validation**: Zod
- **Realtime**: WebSockets + Redis Pub/Sub
- **Monorepo**: Turborepo

---

## 🔄 Document Processing Flow

1. User uploads a document
2. Metadata stored in PostgreSQL (`PENDING`)
3. Job added to Redis queue
4. Worker processes document:
   - Extract text
   - Split into chunks
   - Summarize each chunk (parallel)
   - Combine summaries

5. Final summary stored in DB (`COMPLETED`)
6. Real-time update sent via WebSocket

---

## 📡 API Endpoints

### Documents

- `POST /documents` → Upload document
- `GET /documents` → List user documents
- `GET /documents/:id` → Get document details
- `DELETE /documents/:id` → Delete document

### AI (Upcoming)

- `POST /ai/ask` → Ask questions on documents (RAG)

---

## ⚡ Real-Time Updates

KnowFlow uses **Redis Pub/Sub + WebSockets** to push updates instantly:

- `PROCESSING`
- `COMPLETED`
- `FAILED`

No polling required 🚀

---

## 🧠 AI Pipeline

### ✔️ Chunking Strategy

- Large documents are split into overlapping chunks
- Prevents token overflow
- Preserves context

### ✔️ Map-Reduce Summarization

- Chunk → summarize → combine
- Scalable for large PDFs

---

## 🔐 Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/knowflow
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

---

## 🚀 Getting Started

### 1. Clone the repo

```
git clone https://github.com/your-username/knowflow.git
cd knowflow
```

### 2. Install dependencies

```
bun install
```

### 3. Setup database

```
bun run db:push
```

### 4. Start services

```
# Start API
bun run dev:api

# Start Worker
bun run dev:worker
```

---

## 🧪 Development Tips

- Keep business logic in **services**
- Controllers should only handle `req/res`
- Always scope queries with `userId`
- Never block API — use queues
- Use Redis for caching and pub/sub

---

## 🛠️ Future Improvements

- 🔍 RAG-based question answering (pgvector)
- 📊 Document insights dashboard
- ☁️ S3 integration for file storage
- 🔐 JWT authentication
- 📈 Progress tracking (chunk-level updates)
- 🧵 Streaming AI responses

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

---

## 📜 License

MIT License

---

## 💡 Inspiration

KnowFlow is inspired by systems like:

- Notion AI
- ChatPDF
- Perplexity AI

---

## 👨‍💻 Author

Built with ❤️ by Charan
