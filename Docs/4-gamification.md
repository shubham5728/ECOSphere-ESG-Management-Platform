# 🏆 Gamification Module — Complete Guide

> This module **motivates** employees — through sustainability challenges, XP, badges, rewards, and leaderboards. In other words, good actions earn points, and people compete with each other.

---

## 1. What does this module do? (Simple explanation)

This is a game-like system. The employee:
1. Joins a **Challenge** (like "Cycle to work for a week") and submits proof
2. Manager/Admin approves it → **XP + Points** are awarded
3. Getting XP automatically unlocks **Badges** (like "Eco Warrior")
4. Points can be used to buy **Rewards** (like a coffee voucher)
5. A **Leaderboard** is built based on everyone's XP (who's ahead)

---

## 2. What's inside (Data)

| Item | Meaning | Key Fields |
|-------|--------|------------|
| **Challenge** | Sustainability task | title, description, startDate, endDate, **xpReward (default 100)**, **pointsReward (default 200)**, status |
| **Challenge Participation** | Employee joined a challenge | challenge, user, proof, status (PENDING/APPROVED/REJECTED) |
| **Badge** (master) | Achievement | name, **unlockRule**, threshold, icon |
| **UserBadge** | Employee unlocked a badge | user, badge, unlockedAt |
| **Reward** (master) | Redeemable prize | name, **pointsRequired**, **stock** |
| **RewardRedemption** | Employee redeemed a reward | user, reward, pointsSpent |

**Challenge Lifecycle (hardcoded, 5 stages):**
`DRAFT → ACTIVE → UNDER_REVIEW → COMPLETED` (or `ARCHIVED` at any point)

**Badge Unlock Rule (hardcoded, 2 types):**
- `XP_THRESHOLD` — when XP >= threshold
- `CHALLENGE_COUNT` — when the count of approved challenges >= threshold

---

## 3. ⭐ Most important hardcoded rules

### A) Submitting a Challenge (Employee)
```
1. Does the challenge exist? No → Error
2. Is the challenge ACTIVE? No → Error "not active"
3. If "Evidence Requirement" toggle is ON and no proof was given → Error
4. Submit → status = PENDING (upsert: resubmitting updates the existing record)
```

### B) Reviewing a Challenge (Manager/Admin) — this is where the magic happens
```
1. Participation must be PENDING (otherwise Error)
2. If APPROVED:
      xp += challenge.xpReward       (e.g. +100)
      points += challenge.pointsReward (e.g. +200)
      → Badge auto-check runs (see below)
      → "Challenge Approved" notification is sent
3. If REJECTED:
      nothing is awarded
      → "Challenge Rejected" notification is sent
```

### C) ⭐ Badge Auto-Award (fully automatic)
Whenever a challenge is APPROVED, the system checks every ACTIVE badge:
```
For each badge not yet unlocked:
   If rule = XP_THRESHOLD  and user.xp >= threshold        → UNLOCK
   If rule = CHALLENGE_COUNT and approvedChallenges >= threshold → UNLOCK
   → A UserBadge record is created + "Badge Unlocked" notification is sent
```
This means **no admin manually awards a badge** — it unlocks automatically as soon as the XP/challenge count is reached.

### D) Redeeming a Reward (Employee) — buying with points
```
1. Is the reward ACTIVE? No → Error
2. Is stock > 0? No → Error "out of stock"
3. Does the user have enough points? No → Error "Insufficient points"
4. If all good (within one transaction):
      → A Redemption record is created
      → Reward's stock -1
      → User's points -pointsRequired (deducted)
      → "Reward Redeemed" notification is sent
```

### E) How the Leaderboard is built
```
Employees: top 20, sorted by XP (then points) — highest XP is #1
Departments: XP/points of each department's members are summed,
             ranked by totalXP
```

---

## 4. 👥 Who can do what, by role

### 👤 Employee
| Task | Allowed? |
|------|----------|
| View challenges (**DRAFT ones are not shown**) | ✅ Yes |
| **Join** a challenge + submit proof | ✅ **Yes** |
| View **only own** participations | ✅ Yes |
| View leaderboard | ✅ Yes |
| View own **badges** | ✅ Yes |
| **Redeem** rewards (with points) | ✅ **Yes** |
| View own redemptions | ✅ Yes |
| Create/edit/delete a challenge | ❌ No |
| Approve/reject a participation | ❌ No |

> **Important:** Employees do **not** see **DRAFT** challenges (only Manager/Admin see them until they become ACTIVE).

### 👔 Manager
| Task | Allowed? |
|------|----------|
| Everything an Employee can do | ✅ Yes |
| **Create + edit** challenges (change lifecycle) | ✅ Yes |
| **Approve / reject** challenge participations (award XP) | ✅ **Yes** |
| **Delete** a challenge | ❌ No (Admin only) |

### 👑 Admin
| Task | Allowed? |
|------|----------|
| Everything | ✅ **Full access** |
| Delete a challenge | ✅ Yes |
| Manage **Badges** (master data) | ✅ Admin only |
| Manage **Rewards** (stock, points) | ✅ Admin only |
| "Evidence Requirement" + "Badge Auto-Award" toggles in Settings | ✅ Admin only |

---

## 5. Full flow — at a glance

```
Admin/Manager creates a Challenge (DRAFT → ACTIVE)
        ↓
Employee joins + submits proof (PENDING)
        ↓
Manager/Admin approves it
        ↓
Employee receives XP + Points
        ↓
As soon as XP is received, Badge AUTO-unlocks (if threshold met)
        ↓
Employee redeems a Reward with Points (stock -1, points deducted)
        ↓
Leaderboard updates based on everyone's XP
```

---

## 6. Summary in one line

**Manager/Admin** create challenges → **Employees** join and submit proof → once approved, **XP + Points** are awarded → XP **auto-unlocks badges** → points are used to **redeem rewards** → everyone competes on the **leaderboard**.

---

## 7. Technical reference

- **Backend:** `server/src/modules/gamification/`
- **Frontend:** `client/src/features/gamification/` (Leaderboard, Challenges, ChallengeReviews, Rewards)
- **Key API endpoints:**
  - `GET /api/gamification/leaderboard`
  - `GET/POST /api/gamification/challenges` (POST = Manager/Admin; Employees don't see DRAFT)
  - `POST /api/gamification/participations` (Employee submit)
  - `PATCH /api/gamification/participations/:id/review` (Manager/Admin)
  - `POST /api/gamification/redeem` (Employee — spends points)
  - `GET /api/gamification/my-badges`
- **Core logic:** `gamification.service.ts` → `reviewChallengeParticipation()`, `evaluateAndAwardBadges()`, `redeemReward()`, `getLeaderboards()`
