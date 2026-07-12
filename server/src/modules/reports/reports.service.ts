import { prisma } from "../../lib/prisma";

export async function generateEsgReport(filters: {
  module: "ENVIRONMENTAL" | "SOCIAL" | "GOVERNANCE" | "SUMMARY";
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}) {
  const whereClause: any = {};
  
  if (filters.startDate || filters.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setUTCHours(23, 59, 59, 999);
      whereClause.createdAt.lte = endDate;
    }
  }

  // 1. Environmental Report
  if (filters.module === "ENVIRONMENTAL") {
    const recordWhere = { ...whereClause };
    const txWhere = { ...whereClause };

    if (filters.departmentId) {
      recordWhere.departmentId = filters.departmentId;
      txWhere.departmentId = filters.departmentId;
    }

    const [operations, transactions] = await Promise.all([
      prisma.operationalRecord.findMany({
        where: recordWhere,
        include: { department: { select: { name: true } }, emissionFactor: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.carbonTransaction.findMany({
        where: txWhere,
        include: { department: { select: { name: true } } },
        orderBy: { recordedAt: "desc" }
      })
    ]);

    const totalEmissions = transactions.reduce((acc, tx) => acc + tx.emissions, 0);

    return {
      module: "ENVIRONMENTAL",
      summary: {
        totalEmissions: +totalEmissions.toFixed(2),
        activitiesLogged: operations.length
      },
      data: {
        operations,
        transactions
      }
    };
  }

  // 2. Social Report
  if (filters.module === "SOCIAL") {
    const metricWhere = { ...whereClause };
    const participationWhere = { ...whereClause };

    if (filters.departmentId) {
      metricWhere.departmentId = filters.departmentId;
    }

    const [metrics, participations] = await Promise.all([
      prisma.socialMetric.findMany({
        where: metricWhere,
        include: { department: { select: { name: true } } },
        orderBy: { period: "desc" }
      }),
      prisma.participation.findMany({
        where: {
          ...participationWhere,
          status: "APPROVED"
        },
        include: { user: { select: { name: true } }, csrActivity: { select: { title: true } } },
        orderBy: { submittedAt: "desc" }
      })
    ]);

    const volunteerHours = metrics.reduce((acc, m) => acc + m.volunteerHours, 0);
    const trainingHours = metrics.reduce((acc, m) => acc + m.trainingHours, 0);
    const incidents = metrics.reduce((acc, m) => acc + m.safetyIncidents, 0);

    return {
      module: "SOCIAL",
      summary: {
        totalVolunteerHours: +volunteerHours.toFixed(1),
        totalTrainingHours: +trainingHours.toFixed(1),
        safetyIncidents: incidents,
        csrParticipations: participations.length
      },
      data: {
        metrics,
        participations
      }
    };
  }

  // 3. Governance Report
  if (filters.module === "GOVERNANCE") {
    const auditWhere = { ...whereClause };
    const issueWhere = { ...whereClause };

    if (filters.departmentId) {
      auditWhere.departmentId = filters.departmentId;
      issueWhere.departmentId = filters.departmentId;
    }

    const [audits, issues, acks] = await Promise.all([
      prisma.audit.findMany({
        where: auditWhere,
        include: { department: { select: { name: true } } },
        orderBy: { auditDate: "desc" }
      }),
      prisma.complianceIssue.findMany({
        where: issueWhere,
        include: { owner: { select: { name: true } }, department: { select: { name: true } } },
        orderBy: { dueDate: "desc" }
      }),
      prisma.policyAcknowledgement.findMany({
        include: { user: { select: { name: true } }, policy: { select: { title: true } } }
      })
    ]);

    const avgAuditScore = audits.length > 0 
      ? +(audits.reduce((acc, a) => acc + (a.score ?? 0), 0) / audits.length).toFixed(1)
      : 0;

    return {
      module: "GOVERNANCE",
      summary: {
        auditsLogged: audits.length,
        avgAuditScore,
        openComplianceIssues: issues.filter(i => i.status !== "RESOLVED").length
      },
      data: {
        audits,
        issues,
        acknowledgements: acks
      }
    };
  }

  // 4. Summary / Comprehensive Report
  const companyScoreQuery = { ...whereClause };
  if (filters.departmentId) companyScoreQuery.departmentId = filters.departmentId;

  const [emissions, social, issues] = await Promise.all([
    prisma.carbonTransaction.aggregate({
      where: filters.departmentId ? { departmentId: filters.departmentId } : {},
      _sum: { emissions: true }
    }),
    prisma.socialMetric.findMany({
      where: filters.departmentId ? { departmentId: filters.departmentId } : {},
    }),
    prisma.complianceIssue.count({
      where: filters.departmentId ? { departmentId: filters.departmentId, status: { not: "RESOLVED" } } : { status: { not: "RESOLVED" } }
    })
  ]);

  const socialVolunteer = social.reduce((acc, m) => acc + m.volunteerHours, 0);

  return {
    module: "SUMMARY",
    summary: {
      totalEmissions: +(emissions._sum.emissions ?? 0).toFixed(2),
      volunteerHours: +socialVolunteer.toFixed(1),
      openComplianceIssues: issues
    },
    data: {}
  };
}
