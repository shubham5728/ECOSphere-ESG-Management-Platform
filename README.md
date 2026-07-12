# EcoSphere — ESG Management Platform

An ESG (Environmental, Social, Governance) management platform built for an 8-hour hackathon.

## Tech Stack
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Database:** PostgreSQL (via Docker) — falls back to SQLite
- **Frontend:** React + Vite + TypeScript + Tailwind (Phase 1b)
- **Auth:** JWT + bcrypt with role-based access control

## Git Workflow
- `main` — stable / demo-ready
- `develop` — integration branch
- `feature/*` — per-feature work (feature/auth, feature/master-data, feature/frontend)

## Development Phases
- **Phase 1** (current): Auth & RBAC, Master Data CRUD, Settings

## Getting Started (server)
```bash
cd server
npm install
# ensure database is running, then:
npx prisma migrate dev
npm run seed
npm run dev
```

## Default Seeded Accounts
| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| Admin    | admin@ecosphere.local    | Admin@123  |
| Manager  | manager@ecosphere.local  | Manager@123|
| Employee | employee@ecosphere.local | Employee@123|
