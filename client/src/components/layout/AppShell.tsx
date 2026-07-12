import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { NotificationBell } from "../notifications/NotificationBell";
import type { Role } from "../../types";
import "./AppShell.css";

interface NavItem {
  label: string;
  to: string;
  icon: string;
  roles?: Role[];
}

// All nav items across phases
const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "📊" },
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
  // -- Phase 5: Gamification --
  { label: "Leaderboard", to: "/leaderboard", icon: "🏆" },
  { label: "Challenges", to: "/challenges", icon: "🎯" },
  { label: "Challenge Reviews", to: "/challenge-reviews", icon: "📋" },
  { label: "Rewards Store", to: "/rewards-store", icon: "🎁" },
  // -- Phase 6: Scoring Engine --
  { label: "ESG Scoring Engine", to: "/esg-scores", icon: "⭐" },
  // -- Phase 7: Reports --
  { label: "ESG Reports", to: "/reports", icon: "📊" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = NAV.filter((i) => !i.roles || (user && i.roles.includes(user.role)));

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="appshell-root">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="appshell-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`appshell-sidebar ${sidebarOpen ? "appshell-sidebar--open" : ""}`}>
        <div className="appshell-sidebar-header">
          <span className="appshell-logo-icon">🌱</span>
          <span className="appshell-logo-text">EcoSphere</span>
          {/* Close button (mobile) */}
          <button
            className="appshell-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="appshell-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `appshell-nav-link ${isActive ? "appshell-nav-link--active" : ""}`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="appshell-sidebar-footer">
          Phase 8 · Notifications &amp; Polish
        </div>
      </aside>

      {/* Main content area */}
      <div className="appshell-main">
        {/* Top header */}
        <header className="appshell-header">
          {/* Hamburger (mobile) */}
          <button
            id="sidebar-toggle-btn"
            className="appshell-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className="appshell-header-brand">ESG Management Platform</div>

          <div className="appshell-header-right">
            {/* Notification bell */}
            <NotificationBell />

            <div className="appshell-user-info">
              <p className="appshell-user-name">{user?.name}</p>
              <span className="appshell-user-role">{user?.role}</span>
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              className="appshell-logout-btn"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="appshell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
