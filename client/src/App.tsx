import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import LoginPage from "./features/auth/LoginPage";
import SignupPage from "./features/auth/SignupPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import { MasterDataPage } from "./features/master/MasterDataPage";
import { departmentsConfig } from "./features/master/configs/departments";
import { categoriesConfig } from "./features/master/configs/categories";
import SettingsPage from "./features/settings/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected (any authenticated user) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Admin-only master data */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route element={<AppShell />}>
              <Route
                path="/departments"
                element={<MasterDataPage config={departmentsConfig} />}
              />
              <Route
                path="/categories"
                element={<MasterDataPage config={categoriesConfig} />}
              />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
