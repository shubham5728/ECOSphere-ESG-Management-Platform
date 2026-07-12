import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import type { Role } from "../../types";

interface NavItem {
  label: string;
  to: string;
  icon: string;
  roles?: Role[];
}

// Phase 1 + Phase 2 + Phase 3 + Phase 4 nav.
const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: "📊" },
  // -- Phase 2: Environmental --
  { label: "Env Dashboard", to: "/environmental-dashboard", icon: "🌍" },
  { label: "Log Activities", to: "/operations", icon: "🏭" },
  { label: "Carbon Ledger", to: "/carbon-ledger", icon: "📋" },
  // -- Phase 3: Social --
  { label: "Social Dashboard", to: "/social-dashboard", icon: "🤝" },
  { label: "CSR Activities", to: "/csr-activities", icon: "🌳" },
  { label: "CSR Review", to: "/participations", icon: "📝" },
  { label: "Social Metrics", to: "/social-metrics", icon: "📈" },
  // -- Phase 4: Governance --
  { label: "Gov Dashboard", to: "/governance-dashboard", icon: "⚖️" },
  { label: "Policy Sign-off", to: "/policy-acknowledgements", icon: "📜" },
  { label: "Audits Log", to: "/audits", icon: "🔍" },
  { label: "Compliance Issues", to: "/compliance-issues", icon: "⚠️" },
  // -- Master Data (Admin) --
  { label: "Departments", to: "/departments", icon: "🏢", roles: ["ADMIN"] },
  { label: "Categories", to: "/categories", icon: "🏷️", roles: ["ADMIN"] },
  { label: "Users", to: "/users", icon: "👥", roles: ["ADMIN"] },
  { label: "Emission Factors", to: "/emission-factors", icon: "⚡", roles: ["ADMIN"] },
  { label: "ESG Policies", to: "/esg-policies", icon: "📜", roles: ["ADMIN"] },
  { label: "Badges", to: "/badges", icon: "🏅", roles: ["ADMIN"] },
  { label: "Rewards", to: "/rewards", icon: "🎁", roles: ["ADMIN"] },
  { label: "Product ESG Profiles", to: "/product-esg-profiles", icon: "📦", roles: ["ADMIN"] },
  { label: "Environmental Goals", to: "/environmental-goals", icon: "🎯", roles: ["ADMIN"] },
  { label: "Settings", to: "/settings", icon: "⚙️", roles: ["ADMIN"] },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const items = NAV.filter((i) => !i.roles || (user && i.roles.includes(user.role)));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <span className="text-2xl">🌱</span>
          <span className="text-lg font-bold text-gray-900">EcoSphere</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3 text-xs text-gray-400">
          Phase 4 · Governance Module
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <div className="text-sm text-gray-500">ESG Management Platform</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
