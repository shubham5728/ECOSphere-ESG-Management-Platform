import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

/** Auto-creates a CarbonTransaction if autoEmission is enabled in Settings */
export async function createOperationalRecord(
  userId: string,
  data: {
    type: "PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET";
    description: string;
    quantity: number;
    unit: string;
    emissionFactorId: string;
    departmentId: string;
  }
) {
  // Verify emission factor exists and is active
  const factor = await prisma.emissionFactor.findUnique({
    where: { id: data.emissionFactorId },
  });
  if (!factor) throw new AppError("Emission factor not found", 404);
  if (factor.status !== "ACTIVE") throw new AppError("Emission factor is inactive", 400);

  // Create operational record
  const record = await prisma.operationalRecord.create({
    data: {
      type: data.type,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      emissionFactorId: data.emissionFactorId,
      departmentId: data.departmentId,
      userId,
    },
    include: {
      emissionFactor: true,
      department: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  // Auto-calculate emissions if setting is enabled
  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  if (settings?.autoEmission) {
    const emissions = data.quantity * factor.factor;
    await prisma.carbonTransaction.create({
      data: {
        operationalRecordId: record.id,
        description: `Auto-calc: ${data.description}`,
        emissions,
        departmentId: data.departmentId,
      },
    });
  }

  return record;
}

export async function getDashboard() {
  const [
    totalEmissions,
    byDepartment,
    byType,
    recentTransactions,
    goalProgress,
  ] = await Promise.all([
    // Total emissions overall
    prisma.carbonTransaction.aggregate({ _sum: { emissions: true } }),

    // Emissions grouped by department
    prisma.carbonTransaction.groupBy({
      by: ["departmentId"],
      _sum: { emissions: true },
      orderBy: { _sum: { emissions: "desc" } },
      take: 10,
    }),

    // Operational records grouped by type (count)
    prisma.operationalRecord.groupBy({
      by: ["type"],
      _count: { id: true },
      _sum: { quantity: true },
    }),

    // Last 5 transactions
    prisma.carbonTransaction.findMany({
      take: 5,
      orderBy: { recordedAt: "desc" },
      include: { department: true },
    }),

    // Environmental goals progress
    prisma.environmentalGoal.findMany({
      include: { department: true },
      orderBy: { deadline: "asc" },
    }),
  ]);

  // Enrich byDepartment with names
  const deptIds = byDepartment.map((d) => d.departmentId);
  const depts = await prisma.department.findMany({
    where: { id: { in: deptIds } },
    select: { id: true, name: true },
  });
  const deptMap = Object.fromEntries(depts.map((d) => [d.id, d.name]));

  return {
    summary: {
      totalEmissions: totalEmissions._sum.emissions ?? 0,
    },
    byDepartment: byDepartment.map((d) => ({
      departmentId: d.departmentId,
      departmentName: deptMap[d.departmentId] ?? d.departmentId,
      totalEmissions: d._sum.emissions ?? 0,
    })),
    byType: byType.map((t) => ({
      type: t.type,
      count: t._count.id,
      totalQuantity: t._sum.quantity ?? 0,
    })),
    recentTransactions,
    goalProgress: goalProgress.map((g) => ({
      ...g,
      progressPct:
        g.targetValue > 0
          ? Math.round((g.currentValue / g.targetValue) * 100)
          : 0,
    })),
  };
}
