# ⚖️ Governance Module — Complete Guide

> This module handles the company's **"G" (Governance)** — rules, policies, audits, and compliance. In other words, whether the company is operating properly and following the rules.

---

## 1. What does this module do? (Simple explanation)

Every company has certain **rules/policies** (like an "Anti-Corruption Policy"). This module:
1. Maintains **Policies** which employees **acknowledge** (read and understood)
2. Records **Audits** — inspection reports for a department
3. Tracks **Compliance Issues** — if a rule is broken, an issue is created with an **Owner** and a **Due Date**

---

## 2. What's inside (Data)

| Item | Meaning | Key Fields |
|-------|--------|------------|
| **ESG Policy** (master) | A company rule | title, description, version, effectiveDate, status |
| **Policy Acknowledgement** | An employee accepted a policy | policy, user, acknowledgedAt |
| **Audit** | Inspection report for a department | title, auditor, auditDate, **rating**, score (0–100), findings, department |
| **Compliance Issue** | A rule violation / problem | title, severity, status, **dueDate**, **owner**, department |

**Audit Rating (hardcoded, 3 options):** `EXCELLENT` / `SATISFACTORY` / `NEEDS_IMPROVEMENT`

**Compliance Severity (hardcoded):** `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`
**Compliance Status (hardcoded):** `OPEN` / `IN_PROGRESS` / `RESOLVED`

---

## 3. ⭐ Most important hardcoded rules

### A) Acknowledging a Policy (any user)
```
1. Does the policy exist? No → Error
2. Is the policy ACTIVE? No → Error "not active"
3. It's an "upsert" — meaning if already acknowledged before,
   it won't create a duplicate (one user + one policy = one record)
```

### B) Compliance Issue's Overdue flag (auto)
```
isOverdue = (status is NOT "RESOLVED") AND (dueDate has already passed)
```
This means an issue that hasn't been resolved and whose due date has passed gets **automatically marked "Overdue."** (This was a brief requirement — every issue must have an Owner + Due Date, and an overdue flag.)

### C) Resolving a Compliance Issue
```
If status is set to RESOLVED → resolvedAt = today's date
If moved back to OPEN/IN_PROGRESS → resolvedAt is cleared (null)
```

---

## 4. What shows up on the Dashboard

- **Total Policies** (ACTIVE) and **Total Acknowledgements**
- **Policy Coverage Rate %** = `acknowledgements / (policies × active employees) × 100` (max 100%)
  - In other words: what % of people have accepted what % of policies
- **Total Audits** + **Average Audit Score**
- **Compliance Issues** breakdown: Open / In-Progress / Resolved / **Overdue**
- **Recent Issues** (last 5)

---

## 5. 👥 Who can do what, by role

### 👤 Employee
| Task | Allowed? |
|------|----------|
| View policies + **acknowledge** them | ✅ **Yes** |
| View own acknowledgements | ✅ Yes |
| **View** audits | ✅ Yes |
| View **only own** (owned) compliance issues | ✅ Yes |
| Set own issue's status to **IN_PROGRESS or RESOLVED** | ✅ Yes (only that much) |
| Create/edit/delete audits | ❌ No |
| Create a new compliance issue | ❌ No |
| View/change others' issues | ❌ No |

> **Special rule:** An employee can set a compliance issue's status to **only IN_PROGRESS or RESOLVED**, and **only for their own** owned issue. Nothing else.

### 👔 Manager
| Task | Allowed? |
|------|----------|
| Everything an Employee can do | ✅ Yes |
| **Create + edit** audits | ✅ Yes |
| **Create** Compliance Issues (setting owner + due date) | ✅ Yes |
| View + update **everyone's** compliance issues | ✅ Yes |
| **Delete** audits / issues | ❌ No (Admin only) |

### 👑 Admin
| Task | Allowed? |
|------|----------|
| Everything | ✅ **Full access** |
| Delete audits | ✅ Yes |
| Delete compliance issues | ✅ Yes |
| Manage **ESG Policies** (master data) | ✅ Admin only |

---

## 6. Summary in one line

**Admin** creates policies → **Employees** acknowledge them → **Manager/Admin** conduct audits and turn problems into **Compliance Issues** (with owner + due date) → those not resolved in time get flagged **Overdue**.

---

## 7. Technical reference

- **Backend:** `server/src/modules/governance/`
- **Frontend:** `client/src/features/governance/` (Dashboard, PolicyAcknowledgements, Audits, ComplianceIssues)
- **Key API endpoints:**
  - `GET /api/governance/dashboard`
  - `POST /api/governance/acknowledge` (any user)
  - `GET/POST /api/governance/audits` (POST = Manager/Admin)
  - `GET/POST /api/governance/compliance-issues` (POST = Manager/Admin)
  - `PATCH /api/governance/compliance-issues/:id` (Employee limited to own + IN_PROGRESS/RESOLVED)
- **Overdue + coverage logic:** `governance.service.ts` → `getGovernanceDashboard()`
