# 🌍 Environmental Module — Complete Guide

> This module tracks **carbon emissions**. It calculates and records how much CO₂ is generated from the company's daily operations (purchases, manufacturing, expenses, vehicles).

---

## 1. What does this module do? (Simple explanation)

Imagine the company purchased 100 litres of diesel. Burning diesel releases CO₂. This module:
1. Creates an **Operational Record** → "100 litres diesel, Fleet department"
2. Looks up the **Emission Factor** → "1 litre diesel = 2.68 kg CO₂"
3. Auto-generates a **Carbon Transaction** → `100 × 2.68 = 268 kg CO₂`

In other words: you only enter **what was purchased/used**, and the system automatically calculates **how much CO₂ was emitted**.

---

## 2. What's inside it (Data)

| Item | Meaning | Fields |
|-------|--------|--------|
| **Operational Record** | An operation/activity that generates carbon | type, description, quantity, unit, emissionFactor, department |
| **Carbon Transaction** | The final CO₂ calculation (kgCO₂) | emissions, department, linked record |
| **Emission Factor** (master) | Conversion number | name, source, unit, factor (kgCO₂ per unit) |
| **Environmental Goal** (master) | Sustainability target | title, targetValue, currentValue, deadline |

**4 types of Operational Record (hardcoded):**
- `PURCHASE` — purchasing
- `MANUFACTURING` — production
- `EXPENSE` — expenses
- `FLEET` — vehicles/transport

---

## 3. ⭐ The most important hardcoded rule — Auto Emission Calculation

When a new Operational Record is created:

```
1. The Emission Factor is checked — if it doesn't exist → Error "not found"
2. If the factor is INACTIVE → Error "inactive"
3. The record is created
4. Settings are checked:
   → If "Auto Emission Calculation" toggle is ON:
        emissions = quantity × factor.factor
        a CarbonTransaction is auto-created ("Auto-calc: ...")
   → If the toggle is OFF:
        only the record is created, CO₂ must be entered manually
```

**Formula (very simple):**
```
CO₂ (kg) = quantity × emission factor
Example: 500 kWh electricity × 0.82 = 410 kg CO₂
```

> This toggle is controlled by the Admin from the **Settings page**. This is the "integration" mentioned in the brief — automatic carbon calculation from daily operations.

---

## 4. What's shown on the Dashboard

The Environmental Dashboard pulls these numbers (from the real DB):
- **Total Emissions** — sum of all transactions (kg CO₂)
- **By Department** — which department is emitting the most CO₂ (top 10)
- **By Type** — number of records + quantity for Purchase/Manufacturing/Expense/Fleet
- **Recent Transactions** — last 5 carbon entries
- **Goal Progress** — for each environmental goal, `currentValue / targetValue × 100 = %`

---

## 5. 👥 Who can do what, by role

### 👤 Employee (normal user)
| Task | Allowed? |
|------|----------|
| View Dashboard | ✅ Yes |
| **View** operational records | ✅ Yes |
| **Create** a new operational record (log an activity) | ✅ **Yes** |
| View carbon transactions | ✅ Yes |
| **Edit / delete** records | ❌ No |
| Create a manual carbon transaction | ❌ No |

> **Note:** Employees can log daily operations (POST /operations) since this is ground-level data entry. But they cannot edit or delete.

### 👔 Manager
| Task | Allowed? |
|------|----------|
| Everything an Employee can do | ✅ Yes |
| **Edit** operational records | ✅ Yes |
| Create a **manual** Carbon Transaction | ✅ Yes |
| **Delete** records | ❌ No (Admin only) |
| Delete/edit transactions | ❌ No |

### 👑 Admin
| Task | Allowed? |
|------|----------|
| Everything | ✅ **Full access** |
| Edit + **delete** records | ✅ Yes |
| Edit + delete Carbon Transactions | ✅ Yes |
| Manage **Emission Factors** (master data) | ✅ Admin only |
| Manage **Environmental Goals** (master data) | ✅ Admin only |
| Turn Auto-Emission toggle on/off in Settings | ✅ Admin only |

---

## 6. One-line summary

**Employee** logs operations → **System** auto-calculates CO₂ (if setting is ON) → **Manager** handles manual entries + edits → **Admin** owns the emission factors, goals, and overall configuration.

---

## 7. Technical reference (for developers)

- **Backend:** `server/src/modules/environmental/`
- **Frontend:** `client/src/features/environmental/` (Dashboard, Operations, Carbon Ledger)
- **Key API endpoints:**
  - `GET  /api/environmental/dashboard`
  - `GET/POST /api/environmental/operations` (POST = any user)
  - `PATCH /api/environmental/operations/:id` (Manager/Admin)
  - `DELETE /api/environmental/operations/:id` (Admin)
  - `GET/POST /api/environmental/transactions` (POST = Manager/Admin)
- **Auto-calc logic:** `environmental.service.ts` → `createOperationalRecord()`
