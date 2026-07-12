import { prisma } from "../../lib/prisma";

export async function getGovernanceDashboard() {
  const [
    totalPolicies,
    totalAcknowledgements,
    totalAudits,
    avgAuditScore,
    complianceIssues,
    employeeCount,
  ] = await Promise.all([
    prisma.eSGPolicy.count({ where: { status: "ACTIVE" } }),
    prisma.policyAcknowledgement.count(),
    prisma.audit.count(),
    prisma.audit.aggregate({ _avg: { score: true } }),
    prisma.complianceIssue.findMany({
      include: {
        owner: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
  ]);

  // Calculate policy coverage rate
  // Policy coverage rate = Total Acknowledgements / (Total Active Policies * Total Active Employees)
  const maxPossibleAcknowledgements = totalPolicies * employeeCount;
  const coverageRatePct = maxPossibleAcknowledgements > 0 
    ? Math.round((totalAcknowledgements / maxPossibleAcknowledgements) * 100)
    : 0;

  // Process compliance issues
  const now = new Date();
  let openCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let overdueCount = 0;

  const enrichedIssues = complianceIssues.map((issue) => {
    const isOverdue = issue.status !== "RESOLVED" && new Date(issue.dueDate) < now;
    
    if (issue.status === "OPEN") openCount++;
    else if (issue.status === "IN_PROGRESS") inProgressCount++;
    else if (issue.status === "RESOLVED") resolvedCount++;
    
    if (isOverdue) overdueCount++;

    return {
      ...issue,
      isOverdue,
    };
  });

  return {
    summary: {
      totalPolicies,
      totalAcknowledgements,
      policyCoverageRatePct: Math.min(coverageRatePct, 100),
      totalAudits,
      avgAuditScore: avgAuditScore._avg.score ? +avgAuditScore._avg.score.toFixed(1) : 0,
      totalIssues: complianceIssues.length,
      openIssues: openCount,
      inProgressIssues: inProgressCount,
      resolvedIssues: resolvedCount,
      overdueIssues: overdueCount,
    },
    recentIssues: enrichedIssues.slice(-5).reverse(),
  };
}
