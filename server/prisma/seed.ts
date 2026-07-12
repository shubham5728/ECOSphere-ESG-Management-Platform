import {
  PrismaClient,
  Role,
  Status,
  CategoryType,
  GoalStatus,
  UnlockRule,
  OperationalType,
  ParticipationStatus,
  ChallengeStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function resetTransactionalAndData() {
  // Delete in FK-safe order (children first).
  await prisma.notification.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.participation.deleteMany();
  await prisma.csrActivity.deleteMany();
  await prisma.socialMetric.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.operationalRecord.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.productESGProfile.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.eSGPolicy.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.category.deleteMany();
  // Break Department <-> User circular refs before deleting.
  await prisma.department.updateMany({ data: { headId: null, parentId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
}

async function main() {
  console.log("🌱 Seeding EcoSphere (India dataset)...");
  await resetTransactionalAndData();

  // ── Settings ──────────────────────────────────────────────
  // Enable auto-emission so operational records feed the dashboard.
  await prisma.setting.upsert({
    where: { id: 1 },
    update: { autoEmission: true, evidenceRequired: true, badgeAutoAward: true },
    create: { id: 1, autoEmission: true },
  });

  // ── Departments ───────────────────────────────────────────
  const deptDefs = [
    { name: "Human Resources", code: "HR", employeeCount: 3 },
    { name: "Finance", code: "FIN", employeeCount: 2 },
    { name: "Information Technology", code: "IT", employeeCount: 3 },
    { name: "Manufacturing", code: "MFG", employeeCount: 3 },
    { name: "Operations", code: "OPS", employeeCount: 2 },
    { name: "Sales & Marketing", code: "SALES", employeeCount: 2 },
    { name: "Logistics", code: "LOG", employeeCount: 2 },
    { name: "Research & Development", code: "RND", employeeCount: 1 },
  ];
  const dept: Record<string, string> = {};
  for (const d of deptDefs) {
    const rec = await prisma.department.create({ data: d });
    dept[d.code] = rec.id;
  }
  // Hierarchy: Manufacturing & Logistics report to Operations.
  await prisma.department.update({ where: { id: dept.MFG }, data: { parentId: dept.OPS } });
  await prisma.department.update({ where: { id: dept.LOG }, data: { parentId: dept.OPS } });
  console.log(`  ✓ ${deptDefs.length} departments`);

  // ── Users (Indian names) ──────────────────────────────────
  const userDefs = [
    { name: "Arjun Mehta", email: "admin@ecosphere.local", password: "Admin@123", role: Role.ADMIN, dept: "IT", xp: 0, points: 0 },
    { name: "Priya Nair", email: "manager@ecosphere.local", password: "Manager@123", role: Role.MANAGER, dept: "HR", xp: 320, points: 210 },
    { name: "Rahul Sharma", email: "employee@ecosphere.local", password: "Employee@123", role: Role.EMPLOYEE, dept: "MFG", xp: 540, points: 360 },
    { name: "Vikram Singh", email: "vikram.singh@ecosphere.local", password: "Password@123", role: Role.MANAGER, dept: "MFG", xp: 280, points: 150 },
    { name: "Sneha Reddy", email: "sneha.reddy@ecosphere.local", password: "Password@123", role: Role.MANAGER, dept: "SALES", xp: 200, points: 120 },
    { name: "Aditya Kumar", email: "aditya.kumar@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "IT", xp: 620, points: 400 },
    { name: "Ananya Iyer", email: "ananya.iyer@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "HR", xp: 180, points: 90 },
    { name: "Rohan Gupta", email: "rohan.gupta@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "MFG", xp: 750, points: 500 },
    { name: "Kavya Menon", email: "kavya.menon@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "SALES", xp: 130, points: 70 },
    { name: "Karthik Rao", email: "karthik.rao@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "LOG", xp: 410, points: 260 },
    { name: "Neha Joshi", email: "neha.joshi@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "FIN", xp: 90, points: 40 },
    { name: "Sanjay Verma", email: "sanjay.verma@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "OPS", xp: 300, points: 190 },
    { name: "Divya Pillai", email: "divya.pillai@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "IT", xp: 470, points: 300 },
    { name: "Amit Desai", email: "amit.desai@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "MFG", xp: 220, points: 120 },
    { name: "Pooja Shah", email: "pooja.shah@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "HR", xp: 160, points: 80 },
    { name: "Manoj Tiwari", email: "manoj.tiwari@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "LOG", xp: 350, points: 210 },
    { name: "Isha Agarwal", email: "isha.agarwal@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "FIN", xp: 110, points: 60 },
    { name: "Suresh Nair", email: "suresh.nair@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "OPS", xp: 260, points: 140 },
    { name: "Meera Krishnan", email: "meera.krishnan@ecosphere.local", password: "Password@123", role: Role.EMPLOYEE, dept: "RND", xp: 880, points: 620 },
  ];
  const user: Record<string, { id: string; xp: number; points: number }> = {};
  for (const u of userDefs) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const rec = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        departmentId: dept[u.dept],
        xp: u.xp,
        points: u.points,
      },
    });
    user[u.email] = { id: rec.id, xp: u.xp, points: u.points };
  }
  // Department heads
  await prisma.department.update({ where: { id: dept.HR }, data: { headId: user["manager@ecosphere.local"].id } });
  await prisma.department.update({ where: { id: dept.MFG }, data: { headId: user["vikram.singh@ecosphere.local"].id } });
  await prisma.department.update({ where: { id: dept.SALES }, data: { headId: user["sneha.reddy@ecosphere.local"].id } });
  await prisma.department.update({ where: { id: dept.IT }, data: { headId: user["admin@ecosphere.local"].id } });
  console.log(`  ✓ ${userDefs.length} users`);

  // ── Categories ────────────────────────────────────────────
  const categoryDefs = [
    { name: "Tree Plantation", type: CategoryType.CSR_ACTIVITY },
    { name: "Blood Donation", type: CategoryType.CSR_ACTIVITY },
    { name: "Rural Education", type: CategoryType.CSR_ACTIVITY },
    { name: "Swachh Bharat Cleanup", type: CategoryType.CSR_ACTIVITY },
    { name: "Energy Saving", type: CategoryType.CHALLENGE },
    { name: "Waste Reduction", type: CategoryType.CHALLENGE },
    { name: "Green Commute", type: CategoryType.CHALLENGE },
  ];
  for (const c of categoryDefs) await prisma.category.create({ data: c });
  console.log(`  ✓ ${categoryDefs.length} categories`);

  // ── Emission Factors (India grid values) ──────────────────
  const factorDefs = [
    { name: "Diesel", source: "Fuel Combustion", unit: "litre", factor: 2.68 },
    { name: "Petrol", source: "Fuel Combustion", unit: "litre", factor: 2.31 },
    { name: "Grid Electricity (India)", source: "CEA Grid", unit: "kWh", factor: 0.82 },
    { name: "Natural Gas (PNG)", source: "Fuel Combustion", unit: "scm", factor: 2.02 },
    { name: "Domestic Air Travel", source: "Business Travel", unit: "km", factor: 0.15 },
    { name: "Road Freight (Truck)", source: "Logistics", unit: "tonne-km", factor: 0.11 },
  ];
  const factor: Record<string, { id: string; factor: number; unit: string }> = {};
  for (const f of factorDefs) {
    const rec = await prisma.emissionFactor.create({ data: f });
    factor[f.name] = { id: rec.id, factor: f.factor, unit: f.unit };
  }
  console.log(`  ✓ ${factorDefs.length} emission factors`);

  // ── Environmental Goals ───────────────────────────────────
  await prisma.environmentalGoal.createMany({
    data: [
      { title: "Reduce carbon emissions by 20%", targetValue: 20, currentValue: 8, unit: "%", deadline: daysAhead(200), departmentId: dept.MFG, status: GoalStatus.ON_TRACK },
      { title: "Achieve 50% renewable energy", targetValue: 50, currentValue: 22, unit: "%", deadline: daysAhead(300), departmentId: dept.OPS, status: GoalStatus.AT_RISK },
      { title: "Zero landfill waste", targetValue: 100, currentValue: 100, unit: "%", deadline: daysAgo(10), departmentId: dept.MFG, status: GoalStatus.COMPLETED },
      { title: "Plant 10,000 trees", targetValue: 10000, currentValue: 6500, unit: "trees", deadline: daysAhead(120), departmentId: dept.HR, status: GoalStatus.ON_TRACK },
    ],
  });
  console.log("  ✓ 4 environmental goals");

  // ── ESG Policies ──────────────────────────────────────────
  const policyDefs = [
    { title: "Anti-Corruption & Bribery Policy", description: "Zero-tolerance guidelines against bribery and corrupt practices, aligned with the Prevention of Corruption Act." },
    { title: "Data Privacy & Protection Policy", description: "Handling of personal data in line with the DPDP Act 2023." },
    { title: "Workplace Health & Safety Policy", description: "Safety standards, PPE usage, and incident reporting on all premises." },
    { title: "Diversity, Equity & Inclusion Policy", description: "Commitment to an inclusive workplace and equal opportunity." },
    { title: "Environmental Sustainability Policy", description: "Company-wide commitment to reducing carbon footprint and resource use." },
  ];
  const policy: Record<string, string> = {};
  for (const p of policyDefs) {
    const rec = await prisma.eSGPolicy.create({ data: { ...p, effectiveDate: daysAgo(90) } });
    policy[p.title] = rec.id;
  }
  console.log(`  ✓ ${policyDefs.length} ESG policies`);

  // ── Badges ────────────────────────────────────────────────
  const badgeDefs = [
    { name: "Eco Starter", description: "Earn your first 100 XP", unlockRule: UnlockRule.XP_THRESHOLD, threshold: 100, icon: "🌱" },
    { name: "Green Warrior", description: "Reach 500 XP", unlockRule: UnlockRule.XP_THRESHOLD, threshold: 500, icon: "🌿" },
    { name: "Sustainability Champion", description: "Reach 1000 XP", unlockRule: UnlockRule.XP_THRESHOLD, threshold: 1000, icon: "🏆" },
    { name: "Challenge Rookie", description: "Complete 3 challenges", unlockRule: UnlockRule.CHALLENGE_COUNT, threshold: 3, icon: "🎯" },
    { name: "Challenge Master", description: "Complete 5 challenges", unlockRule: UnlockRule.CHALLENGE_COUNT, threshold: 5, icon: "⭐" },
  ];
  const badge: Record<string, { id: string; rule: UnlockRule; threshold: number }> = {};
  for (const b of badgeDefs) {
    const rec = await prisma.badge.create({ data: b });
    badge[b.name] = { id: rec.id, rule: b.unlockRule, threshold: b.threshold };
  }
  console.log(`  ✓ ${badgeDefs.length} badges`);

  // ── Rewards ───────────────────────────────────────────────
  const rewardDefs = [
    { name: "Coffee Voucher", description: "Free coffee at the office café", pointsRequired: 100, stock: 50 },
    { name: "Movie Tickets (PVR)", description: "Two movie tickets", pointsRequired: 250, stock: 30 },
    { name: "Eco-Friendly Kit", description: "Reusable bottle, bag & cutlery set", pointsRequired: 300, stock: 20 },
    { name: "Extra Half-Day Leave", description: "Half-day paid leave", pointsRequired: 500, stock: 15 },
    { name: "Amazon Gift Card ₹500", description: "₹500 Amazon voucher", pointsRequired: 800, stock: 10 },
  ];
  const reward: Record<string, { id: string; points: number }> = {};
  for (const r of rewardDefs) {
    const rec = await prisma.reward.create({ data: r });
    reward[r.name] = { id: rec.id, points: r.pointsRequired };
  }
  console.log(`  ✓ ${rewardDefs.length} rewards`);

  // ── Product ESG Profiles ──────────────────────────────────
  await prisma.productESGProfile.createMany({
    data: [
      { productName: "Recycled Notebook", category: "Stationery", carbonPerUnit: 0.5, recyclablePct: 90, notes: "Made from 100% recycled paper" },
      { productName: "LED Bulb 9W", category: "Electrical", carbonPerUnit: 0.2, recyclablePct: 60 },
      { productName: "Steel Water Bottle", category: "Merchandise", carbonPerUnit: 1.2, recyclablePct: 100 },
    ],
  });
  console.log("  ✓ 3 product ESG profiles");

  // ── Operational Records + Carbon Transactions ─────────────
  const opDefs = [
    { type: OperationalType.MANUFACTURING, desc: "Diesel for plant generators", qty: 500, fac: "Diesel", d: "MFG", u: "rohan.gupta@ecosphere.local", ago: 120 },
    { type: OperationalType.FLEET, desc: "Freight to Nagpur warehouse", qty: 2000, fac: "Road Freight (Truck)", d: "LOG", u: "karthik.rao@ecosphere.local", ago: 100 },
    { type: OperationalType.EXPENSE, desc: "Office electricity - Bengaluru", qty: 3000, fac: "Grid Electricity (India)", d: "IT", u: "aditya.kumar@ecosphere.local", ago: 90 },
    { type: OperationalType.EXPENSE, desc: "Canteen PNG usage", qty: 400, fac: "Natural Gas (PNG)", d: "OPS", u: "sanjay.verma@ecosphere.local", ago: 80 },
    { type: OperationalType.EXPENSE, desc: "Sales trip flight Mumbai-Delhi", qty: 1150, fac: "Domestic Air Travel", d: "SALES", u: "sneha.reddy@ecosphere.local", ago: 70 },
    { type: OperationalType.PURCHASE, desc: "Company car petrol", qty: 250, fac: "Petrol", d: "OPS", u: "suresh.nair@ecosphere.local", ago: 60 },
    { type: OperationalType.MANUFACTURING, desc: "Diesel for forklifts", qty: 320, fac: "Diesel", d: "MFG", u: "amit.desai@ecosphere.local", ago: 50 },
    { type: OperationalType.EXPENSE, desc: "Plant electricity - Pune", qty: 5200, fac: "Grid Electricity (India)", d: "MFG", u: "vikram.singh@ecosphere.local", ago: 40 },
    { type: OperationalType.FLEET, desc: "Distribution to Chennai", qty: 1500, fac: "Road Freight (Truck)", d: "LOG", u: "manoj.tiwari@ecosphere.local", ago: 30 },
    { type: OperationalType.EXPENSE, desc: "HO electricity - Delhi", qty: 2800, fac: "Grid Electricity (India)", d: "HR", u: "manager@ecosphere.local", ago: 20 },
    { type: OperationalType.EXPENSE, desc: "R&D lab air travel", qty: 900, fac: "Domestic Air Travel", d: "RND", u: "meera.krishnan@ecosphere.local", ago: 12 },
    { type: OperationalType.MANUFACTURING, desc: "Generator diesel top-up", qty: 180, fac: "Diesel", d: "MFG", u: "employee@ecosphere.local", ago: 5 },
  ];
  for (const o of opDefs) {
    const f = factor[o.fac];
    const rec = await prisma.operationalRecord.create({
      data: {
        type: o.type,
        description: o.desc,
        quantity: o.qty,
        unit: f.unit,
        emissionFactorId: f.id,
        departmentId: dept[o.d],
        userId: user[o.u].id,
        createdAt: daysAgo(o.ago),
      },
    });
    await prisma.carbonTransaction.create({
      data: {
        operationalRecordId: rec.id,
        description: `Auto-calc: ${o.desc}`,
        emissions: +(o.qty * f.factor).toFixed(2),
        departmentId: dept[o.d],
        recordedAt: daysAgo(o.ago),
      },
    });
  }
  console.log(`  ✓ ${opDefs.length} operational records + carbon transactions`);

  // ── CSR Activities ────────────────────────────────────────
  const csrDefs = [
    { title: "Tree Plantation Drive", description: "Plant 500 saplings at the plant premises.", location: "Pune, Maharashtra", d: "MFG", xp: 60, pts: 120, ago: 40 },
    { title: "Blood Donation Camp", description: "Annual blood donation drive with Red Cross.", location: "Bengaluru, Karnataka", d: "HR", xp: 50, pts: 100, ago: 30 },
    { title: "Rural Digital Literacy", description: "Teach basic computer skills in rural schools.", location: "Nashik, Maharashtra", d: "IT", xp: 70, pts: 150, ago: 25 },
    { title: "Swachh Bharat Cleanup", description: "Community cleanliness drive near the office.", location: "New Delhi", d: "OPS", xp: 40, pts: 80, ago: 15 },
    { title: "Beach Cleanup Marina", description: "Coastal plastic cleanup volunteering.", location: "Chennai, Tamil Nadu", d: "SALES", xp: 55, pts: 110, ago: 8 },
  ];
  const csr: Record<string, { id: string; xp: number; pts: number }> = {};
  for (const a of csrDefs) {
    const rec = await prisma.csrActivity.create({
      data: {
        title: a.title,
        description: a.description,
        location: a.location,
        startDate: daysAgo(a.ago),
        endDate: daysAgo(a.ago - 1),
        maxParticipants: 50,
        xpReward: a.xp,
        pointsReward: a.pts,
        departmentId: dept[a.d],
        status: Status.ACTIVE,
      },
    });
    csr[a.title] = { id: rec.id, xp: a.xp, pts: a.pts };
  }
  console.log(`  ✓ ${csrDefs.length} CSR activities`);

  // ── Participations (CSR) ──────────────────────────────────
  const partDefs = [
    { act: "Tree Plantation Drive", u: "rohan.gupta@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Tree Plantation Drive", u: "employee@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Tree Plantation Drive", u: "amit.desai@ecosphere.local", status: ParticipationStatus.PENDING },
    { act: "Blood Donation Camp", u: "ananya.iyer@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Blood Donation Camp", u: "pooja.shah@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Rural Digital Literacy", u: "aditya.kumar@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Rural Digital Literacy", u: "divya.pillai@ecosphere.local", status: ParticipationStatus.PENDING },
    { act: "Swachh Bharat Cleanup", u: "sanjay.verma@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Swachh Bharat Cleanup", u: "suresh.nair@ecosphere.local", status: ParticipationStatus.REJECTED },
    { act: "Beach Cleanup Marina", u: "kavya.menon@ecosphere.local", status: ParticipationStatus.APPROVED },
    { act: "Beach Cleanup Marina", u: "karthik.rao@ecosphere.local", status: ParticipationStatus.PENDING },
  ];
  for (const p of partDefs) {
    const a = csr[p.act];
    const approved = p.status === ParticipationStatus.APPROVED;
    await prisma.participation.create({
      data: {
        csrActivityId: a.id,
        userId: user[p.u].id,
        proofUrl: "https://example.com/proof.jpg",
        proofNote: "Attended and completed the activity",
        status: p.status,
        xpAwarded: approved ? a.xp : 0,
        pointsAwarded: approved ? a.pts : 0,
        reviewedAt: p.status === ParticipationStatus.PENDING ? null : daysAgo(2),
      },
    });
  }
  console.log(`  ✓ ${partDefs.length} CSR participations`);

  // ── Social Metrics (one per department) ───────────────────
  const metricDefs = [
    { d: "HR", emp: 42, female: 22, train: 320, safety: 0, vol: 180 },
    { d: "FIN", emp: 28, female: 12, train: 180, safety: 0, vol: 60 },
    { d: "IT", emp: 65, female: 24, train: 540, safety: 1, vol: 210 },
    { d: "MFG", emp: 120, female: 28, train: 640, safety: 3, vol: 150 },
    { d: "OPS", emp: 35, female: 10, train: 210, safety: 2, vol: 90 },
    { d: "SALES", emp: 48, female: 20, train: 260, safety: 0, vol: 120 },
    { d: "LOG", emp: 30, female: 6, train: 140, safety: 1, vol: 70 },
    { d: "RND", emp: 18, female: 8, train: 220, safety: 0, vol: 40 },
  ];
  for (const m of metricDefs) {
    await prisma.socialMetric.create({
      data: {
        departmentId: dept[m.d],
        period: "2025-Q1",
        totalEmployees: m.emp,
        femaleCount: m.female,
        trainingHours: m.train,
        safetyIncidents: m.safety,
        volunteerHours: m.vol,
      },
    });
  }
  console.log(`  ✓ ${metricDefs.length} social metrics`);

  // ── Policy Acknowledgements ───────────────────────────────
  const ackEmails = userDefs.filter((u) => u.role === Role.EMPLOYEE).map((u) => u.email);
  const ackPolicies = ["Anti-Corruption & Bribery Policy", "Workplace Health & Safety Policy", "Data Privacy & Protection Policy"];
  let ackCount = 0;
  for (const email of ackEmails) {
    // Each employee acknowledges the first 2-3 policies (skip one for some).
    const count = 2 + (email.length % 2);
    for (const title of ackPolicies.slice(0, count)) {
      await prisma.policyAcknowledgement.create({
        data: { policyId: policy[title], userId: user[email].id, acknowledgedAt: daysAgo(5) },
      });
      ackCount++;
    }
  }
  console.log(`  ✓ ${ackCount} policy acknowledgements`);

  // ── Audits ────────────────────────────────────────────────
  await prisma.audit.createMany({
    data: [
      { title: "Annual ESG Audit 2024", auditor: "Deloitte India", auditDate: daysAgo(60), rating: "EXCELLENT", score: 88, findings: "Strong governance and reporting; minor gaps in Scope 3 tracking.", departmentId: dept.MFG },
      { title: "Safety Compliance Audit", auditor: "Internal Team", auditDate: daysAgo(45), rating: "SATISFACTORY", score: 72, findings: "PPE compliance good; two near-miss incidents to address.", departmentId: dept.OPS },
      { title: "Financial Governance Review", auditor: "KPMG India", auditDate: daysAgo(30), rating: "EXCELLENT", score: 91, findings: "Clean books; controls effective.", departmentId: dept.FIN },
      { title: "Environmental Impact Audit", auditor: "TERI", auditDate: daysAgo(15), rating: "NEEDS_IMPROVEMENT", score: 58, findings: "Emissions above target; waste segregation needs improvement.", departmentId: dept.LOG },
    ],
  });
  console.log("  ✓ 4 audits");

  // ── Compliance Issues ─────────────────────────────────────
  const issueDefs = [
    { title: "Missing safety gear in plant floor", description: "Workers spotted without helmets in Zone B.", severity: "HIGH", status: "OPEN", due: daysAgo(5), owner: "vikram.singh@ecosphere.local", d: "MFG" },
    { title: "Delayed policy acknowledgement", description: "Several staff have not signed the DPDP policy.", severity: "LOW", status: "IN_PROGRESS", due: daysAhead(10), owner: "manager@ecosphere.local", d: "HR" },
    { title: "Data retention gap", description: "Logs retained beyond permitted window.", severity: "MEDIUM", status: "OPEN", due: daysAgo(3), owner: "aditya.kumar@ecosphere.local", d: "IT" },
    { title: "Emission report discrepancy", description: "Reported freight emissions mismatch source data.", severity: "CRITICAL", status: "IN_PROGRESS", due: daysAhead(7), owner: "karthik.rao@ecosphere.local", d: "LOG" },
    { title: "Vendor code non-compliance", description: "Supplier failed ethical sourcing check.", severity: "MEDIUM", status: "RESOLVED", due: daysAgo(20), owner: "sanjay.verma@ecosphere.local", d: "OPS", resolved: true },
    { title: "Diversity target shortfall", description: "Female hiring ratio below quarterly goal.", severity: "LOW", status: "RESOLVED", due: daysAgo(25), owner: "manager@ecosphere.local", d: "HR", resolved: true },
  ];
  for (const i of issueDefs) {
    await prisma.complianceIssue.create({
      data: {
        title: i.title,
        description: i.description,
        severity: i.severity,
        status: i.status,
        dueDate: i.due,
        resolvedAt: i.resolved ? daysAgo(2) : null,
        ownerId: user[i.owner].id,
        departmentId: dept[i.d],
      },
    });
  }
  console.log(`  ✓ ${issueDefs.length} compliance issues`);

  // ── Challenges ────────────────────────────────────────────
  const challengeDefs = [
    { title: "Cycle to Work Week", description: "Commute by cycle for 5 working days.", xp: 100, pts: 200, status: ChallengeStatus.ACTIVE, ago: 10 },
    { title: "Plastic-Free Fortnight", description: "Avoid single-use plastics for 14 days.", xp: 120, pts: 250, status: ChallengeStatus.ACTIVE, ago: 8 },
    { title: "Energy Saver Challenge", description: "Cut desk energy use by switching off devices.", xp: 80, pts: 150, status: ChallengeStatus.COMPLETED, ago: 40 },
    { title: "Carpool Champions", description: "Share rides to reduce commute emissions.", xp: 90, pts: 180, status: ChallengeStatus.UNDER_REVIEW, ago: 20 },
    { title: "Paperless Office Drive", description: "Go fully digital for a month.", xp: 110, pts: 220, status: ChallengeStatus.DRAFT, ago: 2 },
  ];
  const challenge: Record<string, { id: string; xp: number; pts: number }> = {};
  for (const c of challengeDefs) {
    const rec = await prisma.challenge.create({
      data: {
        title: c.title,
        description: c.description,
        startDate: daysAgo(c.ago),
        endDate: daysAhead(14),
        xpReward: c.xp,
        pointsReward: c.pts,
        status: c.status,
      },
    });
    challenge[c.title] = { id: rec.id, xp: c.xp, pts: c.pts };
  }
  console.log(`  ✓ ${challengeDefs.length} challenges`);

  // ── Challenge Participations ──────────────────────────────
  const cpDefs = [
    { c: "Cycle to Work Week", u: "rohan.gupta@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Cycle to Work Week", u: "meera.krishnan@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Cycle to Work Week", u: "aditya.kumar@ecosphere.local", status: ParticipationStatus.PENDING },
    { c: "Plastic-Free Fortnight", u: "divya.pillai@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Plastic-Free Fortnight", u: "employee@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Energy Saver Challenge", u: "rohan.gupta@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Energy Saver Challenge", u: "meera.krishnan@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Energy Saver Challenge", u: "karthik.rao@ecosphere.local", status: ParticipationStatus.APPROVED },
    { c: "Carpool Champions", u: "sanjay.verma@ecosphere.local", status: ParticipationStatus.PENDING },
    { c: "Carpool Champions", u: "manoj.tiwari@ecosphere.local", status: ParticipationStatus.PENDING },
  ];
  const approvedChallengeCount: Record<string, number> = {};
  for (const cp of cpDefs) {
    await prisma.challengeParticipation.create({
      data: {
        challengeId: challenge[cp.c].id,
        userId: user[cp.u].id,
        proofUrl: "https://example.com/challenge-proof.jpg",
        proofNote: "Completed the challenge",
        status: cp.status,
        reviewedAt: cp.status === ParticipationStatus.PENDING ? null : daysAgo(1),
      },
    });
    if (cp.status === ParticipationStatus.APPROVED) {
      approvedChallengeCount[cp.u] = (approvedChallengeCount[cp.u] ?? 0) + 1;
    }
  }
  console.log(`  ✓ ${cpDefs.length} challenge participations`);

  // ── User Badges (auto-award based on XP / challenge count) ─
  let badgeCount = 0;
  for (const u of userDefs) {
    const info = user[u.email];
    const approved = approvedChallengeCount[u.email] ?? 0;
    for (const b of Object.values(badge)) {
      const qualifies =
        (b.rule === UnlockRule.XP_THRESHOLD && info.xp >= b.threshold) ||
        (b.rule === UnlockRule.CHALLENGE_COUNT && approved >= b.threshold);
      if (qualifies) {
        await prisma.userBadge.create({ data: { userId: info.id, badgeId: b.id, unlockedAt: daysAgo(3) } });
        badgeCount++;
      }
    }
  }
  console.log(`  ✓ ${badgeCount} user badges awarded`);

  // ── Reward Redemptions ────────────────────────────────────
  const redemptionDefs = [
    { u: "rohan.gupta@ecosphere.local", r: "Coffee Voucher" },
    { u: "meera.krishnan@ecosphere.local", r: "Eco-Friendly Kit" },
    { u: "aditya.kumar@ecosphere.local", r: "Movie Tickets (PVR)" },
  ];
  for (const rd of redemptionDefs) {
    await prisma.rewardRedemption.create({
      data: { userId: user[rd.u].id, rewardId: reward[rd.r].id, pointsSpent: reward[rd.r].points, redeemedAt: daysAgo(4) },
    });
    await prisma.reward.update({ where: { id: reward[rd.r].id }, data: { stock: { decrement: 1 } } });
  }
  console.log(`  ✓ ${redemptionDefs.length} reward redemptions`);

  // ── Notifications ─────────────────────────────────────────
  const notifDefs = [
    { u: "rohan.gupta@ecosphere.local", type: NotificationType.BADGE_AWARDED, title: "Badge Unlocked!", message: 'You earned the "Green Warrior" badge.', link: "/leaderboard" },
    { u: "employee@ecosphere.local", type: NotificationType.CHALLENGE_APPROVED, title: "Challenge Approved!", message: 'Your "Plastic-Free Fortnight" submission was approved.', link: "/challenges" },
    { u: "suresh.nair@ecosphere.local", type: NotificationType.CHALLENGE_REJECTED, title: "Submission Rejected", message: 'Your CSR proof was not approved. Please resubmit.', link: "/participations" },
    { u: "vikram.singh@ecosphere.local", type: NotificationType.COMPLIANCE_OVERDUE, title: "Compliance Overdue", message: '"Missing safety gear in plant floor" is past its due date.', link: "/compliance-issues" },
    { u: "meera.krishnan@ecosphere.local", type: NotificationType.REWARD_REDEEMED, title: "Reward Redeemed", message: 'You redeemed "Eco-Friendly Kit" for 300 points.', link: "/rewards-store" },
    { u: "manager@ecosphere.local", type: NotificationType.GENERAL, title: "Pending Approvals", message: "You have CSR participations awaiting review.", link: "/participations" },
  ];
  for (const n of notifDefs) {
    await prisma.notification.create({
      data: { userId: user[n.u].id, type: n.type, title: n.title, message: n.message, link: n.link, createdAt: daysAgo(1) },
    });
  }
  console.log(`  ✓ ${notifDefs.length} notifications`);

  console.log("✅ India dataset seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
