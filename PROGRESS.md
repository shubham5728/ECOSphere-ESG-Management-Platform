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

### Master data modules (100% complete)
| Module | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Departments | ✅ | ✅ | Done (hierarchy, head, status) |
| Categories | ✅ | ✅ | Done (type: CSR/Challenge) |
| Users | ✅ | ✅ | Done (custom password hashing and exclude hash) |
| Emission Factors | ✅ | ✅ | Done (name, source, unit, factor, status) |
| ESG Policies | ✅ | ✅ | Done (title, description, version, effectiveDate, status) |
| Badges | ✅ | ✅ | Done (name, description, unlockRule, threshold, icon, status) |
| Rewards | ✅ | ✅ | Done (name, description, pointsRequired, stock, status) |
| Product ESG Profiles | ✅ | ✅ | Done (productName, category, carbonPerUnit, recyclablePct, notes, status) |
| Environmental Goals | ✅ | ✅ | Done (title, description, targetValue, currentValue, unit, deadline, departmentId, status) |

### Settings (complete)
- Singleton config row. Toggles: Auto Emission, Evidence Requirement, Badge Auto-Award.
- ESG weightages (Env/Social/Gov) with **sum=100 validation**. Admin-only writes.

---

## 4. What is LEFT (Phase 1 complete · Phase 2 complete)

Phase 1 and Phase 2 are **100% complete, verified (tsc + runtime)**.

---

## 5. FUTURE phases

From the hackathon brief (`EcoSphere ESG Management Platform.pdf`):

- **Phase 2 — Environmental ✅ DONE:** OperationalRecord + CarbonTransaction models, auto-emission calculation (linked to Settings toggle), `/environmental/dashboard` API with aggregations, frontend: Environmental Dashboard page, Operations log page, Carbon Ledger page. Also upgraded main Dashboard.
- **Phase 3 — Social (NEXT):** CSR Activities, Employee Participation (proof upload + approval; Evidence Requirement toggle), diversity + training metrics.
- **Phase 4 — Governance:** Policy Acknowledgements (+ reminders), Audits, Compliance Issues (mandatory Owner + Due Date, overdue flag).
- **Phase 5 — Gamification:** Challenge lifecycle (Draft→Active→Under Review→Completed/Archived), Challenge Participation + XP, Badge auto-award engine, Reward redemption (spend points, stock check), Leaderboards.
- **Phase 6 — Scoring Engine ⭐:** Env/Social/Gov scores per department → Department Total → Overall ESG Score (weighted by Settings). Highest-value feature.
- **Phase 7 — Reports:** Environmental/Social/Governance/Summary reports + Custom Report Builder + export PDF/Excel/CSV.
- **Phase 8 — Notifications & polish:** In-app notifications, mobile-responsive pass, seed data.
- **Optional AI (only if time):** Claude-powered report summary.

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
