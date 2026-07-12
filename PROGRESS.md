# EcoSphere — Progress & Handoff Report

_Last updated: 2026-07-12 · Branch: `feature/master-data`_

This file is the single source of truth for **what's done**, **how to resume**, and **what's next**. Read this first when continuing work.

---

## 1. How to resume (do this first)

```bash
# 1. Start the database (PostgreSQL in Docker)
docker start ecosphere-pg          # if it exists
# (first-time only) docker run --name ecosphere-pg -e POSTGRES_USER=ecosphere \
#   -e POSTGRES_PASSWORD=ecosphere -e POSTGRES_DB=ecosphere -p 5433:5432 -d postgres:16-alpine

# 2. Start the backend  (terminal 1)
cd server && npm run dev           # http://localhost:4000

# 3. Start the frontend (terminal 2)
cd client && npm run dev           # http://localhost:5173
```

**Login accounts (seeded):**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecosphere.local | Admin@123 |
| Manager | manager@ecosphere.local | Manager@123 |
| Employee | employee@ecosphere.local | Employee@123 |

If the DB is ever empty: `cd server && npx prisma migrate dev && npm run seed`

---

## 2. Tech stack

- **Backend:** Node + Express + TypeScript, Prisma ORM, PostgreSQL (Docker, port 5433), JWT + bcrypt, Zod validation.
- **Frontend:** React + Vite + TypeScript, Tailwind CSS, React Router, Axios.
- **DB:** PostgreSQL 16 in Docker container `ecosphere-pg`.

---

## 3. What is DONE ✅

### Auth & RBAC (complete)
- Signup / Login / `/me` / Logout — bcrypt hashing, JWT, session restore.
- Role middleware: `authenticate` + `authorize(...roles)`.
- Frontend: Login + Signup pages, AuthContext, ProtectedRoute (role-aware), AppShell (sidebar + topbar + logout).

### Reusable CRUD architecture (complete — the key foundation)
- **Backend:** `server/src/modules/master/crud.factory.ts` — pass any Prisma model → full list/search/sort/paginate/get/create/update/delete.
- **Frontend:** `DataTable`, `Pagination`, `Modal`, `EntityForm`, `useCrud` hook, generic `MasterDataPage`. New master module = **1 config file + 1 route line**.

### Master data modules
| Module | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Departments | ✅ | ✅ | Done (hierarchy, head, status) |
| Categories | ✅ | ✅ | Done (type: CSR/Challenge) |

### Settings (complete)
- Singleton config row. Toggles: Auto Emission, Evidence Requirement, Badge Auto-Award.
- ESG weightages (Env/Social/Gov) with **sum=100 validation**. Admin-only writes.

---

## 4. What is LEFT to build (Phase 1 remainder)

Follow the **approved priority order**. Each master module below takes ~10 min using the reusable pattern.

### 4a. Users management (NEXT) — Admin only
- Backend: `server/src/modules/users/` — list/create/update(role,department)/delete. Reuse `crud.factory` but hide `passwordHash`, hash password on create.
- Frontend: config with role + department (async select from `/departments`).
- Route `/users` (Admin only). Sidebar link already exists.

### 4b. Remaining master-data modules (pure pattern reuse)
For EACH: create `server/src/modules/master/<name>/<name>.schema.ts` + `.routes.ts`, wire in `server/src/app.ts`, then `client/src/features/master/configs/<name>.tsx` + route in `client/src/App.tsx` + sidebar link in `AppShell.tsx`.

| Module | Key fields |
|--------|-----------|
| Emission Factors | name, source, unit, factor (Float), status |
| ESG Policies | title, description, version, effectiveDate, status |
| Badges | name, description, unlockRule (XP_THRESHOLD/CHALLENGE_COUNT), threshold, icon, status |
| Rewards | name, description, pointsRequired, stock, status |
| Product ESG Profiles | productName, category, carbonPerUnit, recyclablePct, notes, status |
| Environmental Goals | title, description, targetValue, currentValue, unit, deadline, departmentId, status |

> All these models ALREADY EXIST in `server/prisma/schema.prisma` — no migration needed, just routes + configs.

---

## 5. FUTURE phases (post Phase 1)

From the hackathon brief (`EcoSphere ESG Management Platform.pdf`):

- **Phase 2 — Environmental:** Carbon Transactions, Auto Emission Calculation (uses Settings toggle), department carbon tracking, goals progress, environmental dashboard.
- **Phase 3 — Social:** CSR Activities, Employee Participation (proof upload + approval; Evidence Requirement toggle), diversity + training metrics.
- **Phase 4 — Governance:** Policy Acknowledgements (+ reminders), Audits, Compliance Issues (mandatory Owner + Due Date, overdue flag).
- **Phase 5 — Gamification:** Challenge lifecycle (Draft→Active→Under Review→Completed/Archived), Challenge Participation + XP, Badge auto-award engine, Reward redemption (spend points, stock check), Leaderboards.
- **Phase 6 — Scoring Engine ⭐:** Env/Social/Gov scores per department → Department Total → Overall ESG Score (weighted by Settings). Highest-value feature.
- **Phase 7 — Reports:** Environmental/Social/Governance/Summary reports + Custom Report Builder (filters: Department, Date Range, Module, Employee, Challenge, ESG Category) + export PDF/Excel/CSV.
- **Phase 8 — Notifications & polish:** In-app notifications (compliance issue, approvals, policy reminders, badge unlocks), mobile-responsive pass, seed data.
- **Optional AI (only if time):** Claude-powered report summary (no ML training needed). See conversation notes.

---

## 6. Git & deployment

- Branches: `main` (stable), `develop` (integration), `feature/auth`, `feature/master-data` (current work).
- Remote: https://github.com/shubham5728/ECOSphere-ESG-Management-Platform
- To push current work: `git push origin feature/master-data`
- **Deployment (later, all FREE):** DB → Neon, Backend → Render/Railway, Frontend → Vercel. NOT Hugging Face (that's for static/AI only). Do this near the end.

---

## 7. Important conventions (don't break these)

- **Type-only imports MUST use `import type`** (client has `verbatimModuleSyntax: true`) — otherwise blank white screen at runtime. `tsc` passes but browser crashes.
- API response envelope: `{ success, message, data, meta? }`.
- Validation: Zod schema per module, applied via `validate()` middleware.
- Master modules: read = any authenticated user; write (POST/PATCH/DELETE) = Admin only.
- Verify each module with curl (backend) + `npx tsc --noEmit` (client) before committing.
- `.env` files are gitignored — teammates copy from `.env.example`.
