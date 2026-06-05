# MASDP — Multi-Agent Autonomous Software Development Platform

> Transform any software idea into a complete planning package — requirements, architecture, database schema, and documentation — powered by AI agents.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%7C%20FastAPI%20%7C%20LangGraph-blue)

## Overview

MASDP is a full-stack AI platform that simulates a software development team. You describe your project idea in plain English, and 5 specialized AI agents collaborate to produce:

- **📋 Requirements** — Functional/non-functional requirements and user stories
- **🗓 Project Plan** — Scope, milestones, risks, and acceptance criteria
- **🏗 Architecture** — System design, tech stack, and Mermaid diagrams
- **🗃 Database Schema** — Normalized tables, ER diagrams, and SQL DDL
- **📄 Documentation** — README, API docs, setup guide, and roadmap

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), ShadCN UI, Tailwind CSS |
| Backend | FastAPI (Python, async) |
| Agents | LangGraph (StateGraph pipeline) |
| LLM Providers | Groq, Gemini, OpenRouter |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Clerk |
| Deployment | Vercel (frontend), Railway (backend) |

## Getting Started

See [docs/local_setup.md](docs/local_setup.md) for detailed setup instructions.

### Quick Start

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
masdp/
├── frontend/          # Next.js 15 application
├── backend/           # FastAPI application
├── database/          # SQL migrations
├── docker/            # Docker Compose configs
├── tests/             # E2E tests (Playwright)
└── docs/              # Documentation
```

## License

MIT
