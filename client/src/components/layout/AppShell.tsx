import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Factory,
  ClipboardList,
  HeartHandshake,
  Trees,
  ClipboardCheck,
  TrendingUp,
  Scale,
  FileSignature,
  FileSearch,
  ShieldAlert,
  Trophy,
  Target,
  Gift,
  Sparkles,
  Gauge,
  BarChart3,
  Wrench,
  Building2,
  Tags,
  Users,
  Zap,
  ScrollText,
  Award,
  Package,
  Settings,
  Leaf,
  Menu,
  X,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../store/AuthContext";
import { NotificationBell } from "../notifications/NotificationBell";
import type { Role } from "../../types";
import "./AppShell.css";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: Role[];
}

interface NavGroup {
  title: string;
  icon: LucideIcon;
  roles?: Role[];
  items: NavItem[];
}

// Navigation organized into logical, collapsible sections.
const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Environmental",
    icon: Globe,
    items: [
      { label: "Dashboard", to: "/environmental-dashboard", icon: Globe },
      { label: "Log Activities", to: "/operations", icon: Factory },
      { label: "Carbon Ledger", to: "/carbon-ledger", icon: ClipboardList },
    ],
  },
  {
    title: "Social",
    icon: HeartHandshake,
    items: [
      { label: "Dashboard", to: "/social-dashboard", icon: HeartHandshake },
      { label: "CSR Activities", to: "/csr-activities", icon: Trees },
      { label: "CSR Review", to: "/participations", icon: ClipboardCheck },
      { label: "Social Metrics", to: "/social-metrics", icon: TrendingUp },
    ],
  },
  {
    title: "Governance",
    icon: Scale,
    items: [
      { label: "Dashboard", to: "/governance-dashboard", icon: Scale },
      { label: "Policy Sign-off", to: "/policy-acknowledgements", icon: FileSignature },
      { label: "Audits Log", to: "/audits", icon: FileSearch },
      { label: "Compliance Issues", to: "/compliance-issues", icon: ShieldAlert },
    ],
  },
  {
    title: "Gamification",
    icon: Trophy,
    items: [
      { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
      { label: "Challenges", to: "/challenges", icon: Target },
      { label: "Challenge Reviews", to: "/challenge-reviews", icon: ClipboardList },
      { label: "Rewards Store", to: "/rewards-store", icon: Gift },
    ],
  },
  {
    title: "Insights",
    icon: Sparkles,
    items: [
      { label: "ESG Scoring Engine", to: "/esg-scores", icon: Gauge },
      { label: "ESG Reports", to: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Administration",
    icon: Wrench,
    roles: ["ADMIN"],
    items: [
      { label: "Departments", to: "/departments", icon: Building2 },
      { label: "Categories", to: "/categories", icon: Tags },
      { label: "Users", to: "/users", icon: Users },
      { label: "Emission Factors", to: "/emission-factors", icon: Zap },
      { label: "ESG Policies", to: "/esg-policies", icon: ScrollText },
      { label: "Badges", to: "/badges", icon: Award },
      { label: "Rewards", to: "/rewards", icon: Gift },
      { label: "Product ESG Profiles", to: "/product-esg-profiles", icon: Package },
      { label: "Environmental Goals", to: "/environmental-goals", icon: Target },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

const ICON_SIZE = 18;
const COLLAPSE_KEY = "ecosphere_sidebar_collapsed";

function initialsOf(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1"
  );

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  }

  // Only groups/items visible to the current role.
  const groups = useMemo(() => {
    if (!user) return [];
    return NAV_GROUPS.filter((g) => !g.roles || g.roles.includes(user.role))
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => !i.roles || i.roles.includes(user.role)),
      }))
      .filter((g) => g.items.length > 0);
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

  // A single nav link (icon + label). Label hidden in collapsed mode.
  function renderLink(item: NavItem, sub = false) {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/dashboard"}
        onClick={closeSidebar}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `appshell-nav-link ${sub ? "appshell-nav-sublink" : ""} ${
            isActive ? "appshell-nav-link--active" : ""
          }`
        }
      >
        <Icon size={ICON_SIZE} className="appshell-nav-icon" />
        <span className="appshell-nav-label">{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div className="appshell-root">
      {sidebarOpen && (
        <div className="appshell-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`appshell-sidebar ${sidebarOpen ? "appshell-sidebar--open" : ""} ${
          collapsed ? "appshell-sidebar--collapsed" : ""
        }`}
      >
        <div className="appshell-sidebar-header">
          <Leaf className="appshell-logo-icon" size={22} strokeWidth={2.2} />
          <span className="appshell-logo-text">EcoSphere</span>

          {/* Desktop collapse toggle */}
          <button
            className="appshell-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Mobile close */}
          <button className="appshell-sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="appshell-nav">
          {groups.map((group, idx) => {
            // Single-item groups (Overview) always render as a plain link.
            if (group.items.length === 1) {
              return renderLink(group.items[0]);
            }

            // Collapsed mode: show icon-only links with a divider between groups.
            if (collapsed) {
              return (
                <div key={group.title} className="appshell-nav-collapsed-group">
                  {idx > 0 && <div className="appshell-nav-divider" />}
                  {group.items.map((item) => renderLink(item))}
                </div>
              );
            }

            const GroupIcon = group.icon;
            const isOpen = openGroups.has(group.title) || activeGroupTitle === group.title;
            return (
              <div key={group.title} className="appshell-nav-group">
                <button
                  className="appshell-nav-group-header"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={isOpen}
                >
                  <span className="appshell-nav-group-title">
                    <GroupIcon size={15} className="appshell-nav-group-icon" />
                    {group.title}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`appshell-chevron ${isOpen ? "appshell-chevron--open" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="appshell-nav-group-items">
                    {group.items.map((item) => renderLink(item, true))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile card */}
        <div className="appshell-user-card">
          <div className="appshell-avatar">{initialsOf(user?.name)}</div>
          <div className="appshell-user-card-info">
            <p className="appshell-user-card-name">{user?.name}</p>
            <span className="appshell-user-card-role">{user?.role}</span>
          </div>
        </div>
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
            <Menu size={22} />
          </button>
          <div className="appshell-header-brand">ESG Management Platform</div>

          <div className="appshell-header-right">
            <NotificationBell />
            <div className="appshell-user-info">
              <p className="appshell-user-name">{user?.name}</p>
              <span className="appshell-user-role">{user?.role}</span>
            </div>
            <button id="logout-btn" onClick={logout} className="appshell-logout-btn">
              <LogOut size={15} />
              <span>Logout</span>
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
