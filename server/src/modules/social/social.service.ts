import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

/** Returns social dashboard aggregations */
export async function getSocialDashboard() {
  const [
    totalActivities,
    totalParticipations,
    pendingApprovals,
    byStatus,
    recentParticipations,
    latestMetrics,
  ] = await Promise.all([
    prisma.csrActivity.count({ where: { status: "ACTIVE" } }),

    prisma.participation.count(),

    prisma.participation.count({ where: { status: "PENDING" } }),

    prisma.participation.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    prisma.participation.findMany({
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        csrActivity: { select: { id: true, title: true } },
      },
    }),

    prisma.socialMetric.findMany({
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
      take: 10,
      include: { department: { select: { id: true, name: true } } },
    }),
  ]);

  // Aggregate social metrics
  const metricSums = latestMetrics.reduce(
    (acc, m) => {
      acc.totalEmployees += m.totalEmployees;
      acc.femaleCount += m.femaleCount;
      acc.trainingHours += m.trainingHours;
      acc.volunteerHours += m.volunteerHours;
      acc.safetyIncidents += m.safetyIncidents;
      return acc;
    },
    { totalEmployees: 0, femaleCount: 0, trainingHours: 0, volunteerHours: 0, safetyIncidents: 0 }
  );

  return {
    summary: {
      totalActivities,
      totalParticipations,
      pendingApprovals,
      genderRatioPct:
        metricSums.totalEmployees > 0
          ? Math.round((metricSums.femaleCount / metricSums.totalEmployees) * 100)
          : 0,
      avgTrainingHours:
        latestMetrics.length > 0
          ? +(metricSums.trainingHours / latestMetrics.length).toFixed(1)
          : 0,
      totalVolunteerHours: +metricSums.volunteerHours.toFixed(1),
      safetyIncidents: metricSums.safetyIncidents,
    },
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    recentParticipations,
    latestMetrics,
  };
}

/** Approve or reject a participation — awards XP & points on approval */
export async function reviewParticipation(
  participationId: string,
  data: { status: "APPROVED" | "REJECTED"; reviewNote?: string }
) {
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: { csrActivity: true },
  });
  if (!participation) throw new AppError("Participation not found", 404);
  if (participation.status !== "PENDING")
    throw new AppError("Participation is already reviewed", 400);

  const xpAwarded = data.status === "APPROVED" ? participation.csrActivity.xpReward : 0;
  const pointsAwarded = data.status === "APPROVED" ? participation.csrActivity.pointsReward : 0;

  const [updated] = await prisma.$transaction([
    prisma.participation.update({
      where: { id: participationId },
      data: {
        status: data.status,
        reviewNote: data.reviewNote,
        xpAwarded,
        pointsAwarded,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true } },
        csrActivity: { select: { id: true, title: true } },
      },
    }),
    // Award XP & points to user if approved
    ...(data.status === "APPROVED"
      ? [
          prisma.user.update({
            where: { id: participation.userId },
            data: {
              xp: { increment: xpAwarded },
              points: { increment: pointsAwarded },
            },
          }),
        ]
      : []),
  ]);

  return updated;
}
