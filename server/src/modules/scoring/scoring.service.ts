import { prisma } from "../../lib/prisma";

export async function calculateEsgScores() {
  const [
    settings,
    departments,
    carbonTransactions,
    goals,
    socialMetrics,
    participations,
    complianceIssues,
    policies,
    acknowledgements,
    users,
  ] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.department.findMany({ where: { status: "ACTIVE" } }),
    prisma.carbonTransaction.findMany(),
    prisma.environmentalGoal.findMany(),
    prisma.socialMetric.findMany(),
    prisma.participation.findMany({ where: { status: "APPROVED" } }),
    prisma.complianceIssue.findMany(),
    prisma.eSGPolicy.findMany({ where: { status: "ACTIVE" } }),
    prisma.policyAcknowledgement.findMany(),
    prisma.user.findMany({ where: { status: "ACTIVE" } }),
  ]);

  const weightEnv = settings?.weightEnv ?? 40;
  const weightSocial = settings?.weightSocial ?? 30;
  const weightGov = settings?.weightGov ?? 30;

  // Global calculations
  const totalEmployees = users.length;
  const totalPolicies = policies.length;

  const departmentScores = departments.map((dept) => {
    // 1. Environmental Score (E)
    // Formula: Carbon emission deduction (base 100 - (emissions / 500)) + Goal completion rate
    const deptEmissions = carbonTransactions
      .filter((tx) => tx.departmentId === dept.id)
      .reduce((acc, tx) => acc + tx.emissions, 0);

    const deptGoals = goals.filter((g) => g.departmentId === dept.id);
    const completedGoals = deptGoals.filter((g) => g.status === "COMPLETED").length;
    const goalRate = deptGoals.length > 0 ? (completedGoals / deptGoals.length) * 100 : 80; // default 80 if no goals

    const emissionScore = Math.max(0, 100 - deptEmissions / 500);
    const envScore = Math.round((emissionScore * 0.6) + (goalRate * 0.4));

    // 2. Social Score (S)
    // Formula: Diversity score + Training score + Volunteer participation
    const deptMetrics = socialMetrics.filter((m) => m.departmentId === dept.id);
    let femaleRatio = 50; // default balance
    let safetyPenalty = 0;
    let avgTrainingHours = 20;

    if (deptMetrics.length > 0) {
      const latestMetric = deptMetrics[0]; // ordered desc
      femaleRatio = latestMetric.totalEmployees > 0 
        ? (latestMetric.femaleCount / latestMetric.totalEmployees) * 100 
        : 50;
      safetyPenalty = latestMetric.safetyIncidents * 15; // subtract 15 points per safety incident
      avgTrainingHours = latestMetric.trainingHours;
    }

    const diversityScore = Math.max(0, 100 - Math.abs(50 - femaleRatio) * 2); // 100 is perfectly balanced
    const trainingScore = Math.min(100, (avgTrainingHours / 40) * 100); // 40 hrs training = 100%
    const socialScore = Math.max(0, Math.round(((diversityScore * 0.5) + (trainingScore * 0.5)) - safetyPenalty));

    // 3. Governance Score (G)
    // Formula: Policy acknowledgement coverage - Open compliance issue penalties
    const deptUsers = users.filter((u) => u.departmentId === dept.id);
    let ackRate = 100;
    if (deptUsers.length > 0 && totalPolicies > 0) {
      const deptUserIds = new Set(deptUsers.map((u) => u.id));
      const deptAcks = acknowledgements.filter((ack) => deptUserIds.has(ack.userId)).length;
      ackRate = (deptAcks / (deptUsers.length * totalPolicies)) * 100;
    }

    const deptIssues = complianceIssues.filter((i) => i.departmentId === dept.id);
    const openIssues = deptIssues.filter((i) => i.status !== "RESOLVED").length;
    const govScore = Math.max(0, Math.round(ackRate - (openIssues * 20))); // subtract 20 per open compliance issue

    // Overall Weighted Score
    const totalScore = Math.round(
      (envScore * (weightEnv / 100)) +
      (socialScore * (weightSocial / 100)) +
      (govScore * (weightGov / 100))
    );

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      envScore,
      socialScore,
      govScore,
      totalScore,
      breakdown: {
        emissionsKg: deptEmissions,
        goalCompletionRate: deptGoals.length > 0 ? Math.round((completedGoals / deptGoals.length) * 100) : 0,
        femaleRatioPct: Math.round(femaleRatio),
        avgTrainingHours,
        openComplianceIssues: openIssues,
        policyAcksCount: acknowledgements.filter(a => deptUsers.some(u => u.id === a.userId)).length
      }
    };
  });

  // Calculate Company Wide Averages
  const companyEnvAvg = departmentScores.length > 0 
    ? Math.round(departmentScores.reduce((acc, d) => acc + d.envScore, 0) / departmentScores.length)
    : 0;

  const companySocialAvg = departmentScores.length > 0 
    ? Math.round(departmentScores.reduce((acc, d) => acc + d.socialScore, 0) / departmentScores.length)
    : 0;

  const companyGovAvg = departmentScores.length > 0 
    ? Math.round(departmentScores.reduce((acc, d) => acc + d.govScore, 0) / departmentScores.length)
    : 0;

  const companyTotalScore = Math.round(
    (companyEnvAvg * (weightEnv / 100)) +
    (companySocialAvg * (weightSocial / 100)) +
    (companyGovAvg * (weightGov / 100))
  );

  return {
    company: {
      envScore: companyEnvAvg,
      socialScore: companySocialAvg,
      govScore: companyGovAvg,
      totalScore: companyTotalScore,
      weights: {
        env: weightEnv,
        social: weightSocial,
        gov: weightGov,
      },
    },
    departments: departmentScores,
  };
}
