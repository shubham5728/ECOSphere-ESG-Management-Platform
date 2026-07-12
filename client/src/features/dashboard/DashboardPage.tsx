import { useAuth } from "../../store/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    { label: "Your Role", value: user?.role, icon: "🛡️" },
    { label: "XP", value: user?.xp ?? 0, icon: "⚡" },
    { label: "Points", value: user?.points ?? 0, icon: "🎁" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-sm text-gray-500">
          You are signed in to EcoSphere. Phase 1 foundation is live.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="text-2xl">{c.icon}</div>
            <p className="mt-2 text-sm text-gray-500">{c.label}</p>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
        📦 Master Data modules (Departments, Categories, Settings…) will appear in
        the sidebar as they are built. Auth & RBAC are complete.
      </div>
    </div>
  );
}
