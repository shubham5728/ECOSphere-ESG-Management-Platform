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
import { usersConfig } from "./features/master/configs/users";
import { emissionFactorsConfig } from "./features/master/configs/emissionFactors";
import { esgPoliciesConfig } from "./features/master/configs/esgPolicies";
import { badgesConfig } from "./features/master/configs/badges";
import { rewardsConfig } from "./features/master/configs/rewards";
import { productESGProfilesConfig } from "./features/master/configs/productESGProfiles";
import { environmentalGoalsConfig } from "./features/master/configs/environmentalGoals";
import SettingsPage from "./features/settings/SettingsPage";
import EnvironmentalDashboardPage from "./features/environmental/EnvironmentalDashboardPage";
import OperationsPage from "./features/environmental/OperationsPage";
import CarbonLedgerPage from "./features/environmental/CarbonLedgerPage";
import SocialDashboardPage from "./features/social/SocialDashboardPage";
import CsrActivitiesPage from "./features/social/CsrActivitiesPage";
import ParticipationsPage from "./features/social/ParticipationsPage";
import SocialMetricsPage from "./features/social/SocialMetricsPage";

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
              <Route path="/environmental-dashboard" element={<EnvironmentalDashboardPage />} />
              <Route path="/operations" element={<OperationsPage />} />
              <Route path="/carbon-ledger" element={<CarbonLedgerPage />} />
              <Route path="/social-dashboard" element={<SocialDashboardPage />} />
              <Route path="/csr-activities" element={<CsrActivitiesPage />} />
              <Route path="/participations" element={<ParticipationsPage />} />
              <Route path="/social-metrics" element={<SocialMetricsPage />} />
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
              <Route
                path="/users"
                element={<MasterDataPage config={usersConfig} />}
              />
              <Route
                path="/emission-factors"
                element={<MasterDataPage config={emissionFactorsConfig} />}
              />
              <Route
                path="/esg-policies"
                element={<MasterDataPage config={esgPoliciesConfig} />}
              />
              <Route
                path="/badges"
                element={<MasterDataPage config={badgesConfig} />}
              />
              <Route
                path="/rewards"
                element={<MasterDataPage config={rewardsConfig} />}
              />
              <Route
                path="/product-esg-profiles"
                element={<MasterDataPage config={productESGProfilesConfig} />}
              />
              <Route
                path="/environmental-goals"
                element={<MasterDataPage config={environmentalGoalsConfig} />}
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
