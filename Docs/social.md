# 🤝 Social Module

> This module handles the company's **"S" (Social)** activities — CSR activities (community service), employee participation, and diversity/training/safety metrics.

---

## 1. What does this module do? (Simple explanation)

The company organizes good deeds — like a "Tree Plantation Drive" or "Blood Donation Camp". This module:
1. Creates a **CSR Activity** (created by Manager/Admin)
2. An **employee joins** and submits **proof** (photo/note)
3. **Manager/Admin review** it → on approval, the employee gets **XP + Points**
4. The company's **diversity/training/safety** data is tracked separately (Social Metrics)

---

## 2. What's inside it (Data)

| Item | Meaning | Key Fields |
|-------|--------|------------|
| **CSR Activity** | A community-service event | title, description, location, startDate, maxParticipants, **xpReward (default 50)**, **pointsReward (default 100)**, status |
| **Participation** | An employee's join of an activity | employee, activity, proof, status (PENDING/APPROVED/REJECTED), xpAwarded, pointsAwarded |
| **Social Metric** | A department's HR data | period (e.g. 2024-Q1), totalEmployees, femaleCount, trainingHours, safetyIncidents, volunteerHours |

---

## 3. ⭐ The most important hardcoded rules

### A) When submitting a Participation (Employee)
```
1. Does the activity exist? No → Error
2. Is the activity ACTIVE? No → Error "not active"
3. Is maxParticipants reached? → Error "Activity is full"
4. Settings check: is the "Evidence Requirement" toggle ON?
   → Yes, and no proof (URL or note) was given → Error "Proof required"
5. Everything OK → Participation is created, status = PENDING
```

> The **Evidence Requirement** toggle is controlled by the Admin from Settings. When ON, proof is mandatory.

### B) During review (Manager/Admin) — how XP is awarded
```
1. The Participation must be PENDING (otherwise Error "already reviewed")
2. If APPROVED:
      xpAwarded = activity.xpReward       (e.g. 50)
      pointsAwarded = activity.pointsReward (e.g. 100)
      → XP and Points are ADDED to the employee's account
3. If REJECTED:
      xpAwarded = 0, pointsAwarded = 0 (nothing is awarded)
```

This happens within a single **database transaction** — meaning either both actions (status update + XP add) happen, or neither does. It won't get stuck halfway.

---

## 4. What's shown on the Dashboard

- **Total Activities** (ACTIVE only)
- **Total Participations** (how many people joined)
- **Pending Approvals** (how many reviews are pending)
- **Gender Ratio %** = `femaleCount / totalEmployees × 100`
- **Avg Training Hours** = average of training hours
- **Total Volunteer Hours**, **Safety Incidents**
- **Recent Participations** (last 5)

---

## 5. 👥 Who can do what, by role

### 👤 Employee
| Task | Allowed? |
|------|----------|
| **View** CSR activities | ✅ Yes |
| **Join** an activity + submit proof | ✅ **Yes** |
| View **only their own** participations | ✅ Yes (not others') |
| Create/edit/delete an activity | ❌ No |
| Approve/reject anyone's participation | ❌ No |
| Create social metrics | ❌ No |

> **Important:** In the dashboard/list, an Employee only sees **their own** participations (filtered by `userId`).

### 👔 Manager
| Task | Allowed? |
|------|----------|
| Everything an Employee can do | ✅ Yes |
| **Create + edit** a CSR Activity | ✅ Yes |
| **Approve / reject** participations (award XP) | ✅ **Yes** |
| View **everyone's** participations | ✅ Yes |
| **Create + edit** Social Metrics | ✅ Yes |
| **Delete** Activity/Participation/Metric | ❌ No (Admin only) |

### 👑 Admin
| Task | Allowed? |
|------|----------|
| Everything | ✅ **Full access** |
| Delete CSR Activity | ✅ Yes |
| Delete Participation | ✅ Yes |
| Delete Social Metric | ✅ Yes |
| Toggle "Evidence Requirement" in Settings | ✅ Admin only |

---

## 6. One-line summary

**Manager/Admin** creates a CSR activity → **Employee** joins and submits proof → **Manager/Admin** approves it → Employee receives **XP + Points** (used for leaderboards/rewards in the Gamification module).

---

## 7. Technical reference

- **Backend:** `server/src/modules/social/`
- **Frontend:** `client/src/features/social/` (Dashboard, CsrActivities, Participations, SocialMetrics)
- **Key API endpoints:**
  - `GET /api/social/dashboard`
  - `GET/POST /api/social/activities` (POST = Manager/Admin)
  - `POST /api/social/participations` (Employee submit)
  - `PATCH /api/social/participations/:id/review` (Manager/Admin — XP award)
  - `GET/POST /api/social/metrics` (POST = Manager/Admin)
- **XP-award logic:** `social.service.ts` → `reviewParticipation()`
