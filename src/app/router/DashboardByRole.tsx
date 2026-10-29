// Import Dependencies
import { lazy, Suspense } from "react";

// Local Imports
import { getCurrentRole } from "@/app/navigation/role";
// import PlaceholderPage from "./PlaceholderPage";

// ----------------------------------------------------------------------

// Super admin dashboard
const SuperAdminDashboard = lazy(
  () => import("@/app/pages/dashboards/home/crm-analytics"),
);

// Employee dashboard
const EmployeeDashboard = lazy(
  () => import("@/app/pages/employee/dashboards/home/crm-analytics"),
);
const BranchDashboard = lazy(
  () => import("@/app/pages/branch/dashboards/home/crm-analytics"),
);
/**
 * /dashboards/home is shared by all roles, so this picks the dashboard
 * by role. When the branch dashboard is ready, replace the placeholder
 * with a lazy import from pages/branch.
 */
export default function DashboardByRole() {
  const role = getCurrentRole();

  if (role === "branch") {
    return (
      <Suspense fallback={null}>
        <BranchDashboard />
      </Suspense>
    );
  }
  if (role === "employee") {
    return (
      <Suspense fallback={null}>
        <EmployeeDashboard />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <SuperAdminDashboard />
    </Suspense>
  );
}