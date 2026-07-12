import { useAuth } from "../../store/AuthContext";
import { AdminDashboard } from "./views/AdminDashboard";
import { ManagerDashboard } from "./views/ManagerDashboard";
import { EmployeeDashboard } from "./views/EmployeeDashboard";

/**
 * DashboardPage — renders the appropriate role-based dashboard.
 * Admin   → full org-wide analytics
 * Manager → department-focused view
 * Employee → personal stats & progress
 */
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "MANAGER":
      return <ManagerDashboard />;
    case "EMPLOYEE":
    default:
      return <EmployeeDashboard />;
  }
}
