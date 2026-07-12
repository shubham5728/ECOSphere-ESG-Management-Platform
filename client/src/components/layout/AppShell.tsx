import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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

interface NavGroup {
  title: string;
  icon: string;
  roles?: Role[];
  items: NavItem[];
}

// Navigation organized into logical, collapsible sections.
const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    icon: "🏠",
    items: [{ label: "Dashboard", to: "/dashboard", icon: "📊" }],
  },
  {
    title: "Environmental",
    icon: "🌍",
    items: [
      { label: "Dashboard", to: "/environmental-dashboard", icon: "🌍" },
      { label: "Log Activities", to: "/operations", icon: "🏭" },
      { label: "Carbon Ledger", to: "/carbon-ledger", icon: "📋" },
    ],
  },
  {
    title: "Social",
    icon: "🤝",
    items: [
      { label: "Dashboard", to: "/social-dashboard", icon: "🤝" },
      { label: "CSR Activities", to: "/csr-activities", icon: "🌳" },
      { label: "CSR Review", to: "/participations", icon: "📝" },
      { label: "Social Metrics", to: "/social-metrics", icon: "📈" },
    ],
  },
  {
    title: "Governance",
    icon: "⚖️",
    items: [
      { label: "Dashboard", to: "/governance-dashboard", icon: "⚖️" },
      { label: "Policy Sign-off", to: "/policy-acknowledgements", icon: "📜" },
      { label: "Audits Log", to: "/audits", icon: "🔍" },
      { label: "Compliance Issues", to: "/compliance-issues", icon: "⚠️" },
    ],
  },
  {
    title: "Gamification",
    icon: "🏆",
    items: [
      { label: "Leaderboard", to: "/leaderboard", icon: "🏆" },
      { label: "Challenges", to: "/challenges", icon: "🎯" },
      { label: "Challenge Reviews", to: "/challenge-reviews", icon: "📋" },
      { label: "Rewards Store", to: "/rewards-store", icon: "🎁" },
    ],
  },
  {
    title: "Insights",
    icon: "⭐",
    items: [
      { label: "ESG Scoring Engine", to: "/esg-scores", icon: "⭐" },
      { label: "ESG Reports", to: "/reports", icon: "📊" },
    ],
  },
  {
    title: "Administration",
    icon: "🛠️",
    roles: ["ADMIN"],
    items: [
      { label: "Departments", to: "/departments", icon: "🏢" },
      { label: "Categories", to: "/categories", icon: "🏷️" },
      { label: "Users", to: "/users", icon: "👥" },
      { label: "Emission Factors", to: "/emission-factors", icon: "⚡" },
      { label: "ESG Policies", to: "/esg-policies", icon: "📜" },
      { label: "Badges", to: "/badges", icon: "🏅" },
      { label: "Rewards", to: "/rewards", icon: "🎁" },
      { label: "Product ESG Profiles", to: "/product-esg-profiles", icon: "📦" },
      { label: "Environmental Goals", to: "/environmental-goals", icon: "🎯" },
      { label: "Settings", to: "/settings", icon: "⚙️" },
    ],
  },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only groups/items visible to the current role.
  const groups = useMemo(() => {
    if (!user) return [];
    return NAV_GROUPS.filter((g) => !g.roles || g.roles.includes(user.role)).map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.roles || i.roles.includes(user.role)),
    })).filter((g) => g.items.length > 0);
  }, [user]);

  // The group containing the current route (used to auto-expand it).
  const activeGroupTitle = useMemo(() => {
    const match = groups.find((g) => g.items.some((i) => location.pathname.startsWith(i.to)));
    return match?.title ?? "Overview";
  }, [groups, location.pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set([activeGroupTitle]));

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="appshell-root">
      {sidebarOpen && (
        <div className="appshell-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`appshell-sidebar ${sidebarOpen ? "appshell-sidebar--open" : ""}`}>
        <div className="appshell-sidebar-header">
          <span className="appshell-logo-icon">🌱</span>
          <span className="appshell-logo-text">EcoSphere</span>
          <button className="appshell-sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav className="appshell-nav">
          {groups.map((group) => {
            // Single-item groups (Overview) render as a plain link — no accordion.
            if (group.items.length === 1) {
              const item = group.items[0];
              return (
                <NavLink
                  key={group.title}
                  to={item.to}
                  end
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `appshell-nav-link ${isActive ? "appshell-nav-link--active" : ""}`
                  }
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            }

            const isOpen = openGroups.has(group.title) || activeGroupTitle === group.title;
            return (
              <div key={group.title} className="appshell-nav-group">
                <button
                  className="appshell-nav-group-header"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={isOpen}
                >
                  <span className="appshell-nav-group-title">
                    <span>{group.icon}</span>
                    {group.title}
                  </span>
                  <span className={`appshell-chevron ${isOpen ? "appshell-chevron--open" : ""}`}>
                    ▸
                  </span>
                </button>

                {isOpen && (
                  <div className="appshell-nav-group-items">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                          `appshell-nav-link appshell-nav-sublink ${
                            isActive ? "appshell-nav-link--active" : ""
                          }`
                        }
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="appshell-sidebar-footer">EcoSphere ESG · v1.0</div>
      </aside>

      {/* Main content area */}
      <div className="appshell-main">
        <header className="appshell-header">
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
            <NotificationBell />
            <div className="appshell-user-info">
              <p className="appshell-user-name">{user?.name}</p>
              <span className="appshell-user-role">{user?.role}</span>
            </div>
            <button id="logout-btn" onClick={logout} className="appshell-logout-btn">
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
