// Import Dependencies
import { lazy, Suspense } from "react";

// Local Imports
import { getCurrentRole } from "@/app/navigation/role";
import PlaceholderPage from "./PlaceholderPage";

// ----------------------------------------------------------------------

// Your existing dashboard (used by super admin for now)
const SuperAdminDashboard = lazy(
  () => import("@/app/pages/dashboards/home/crm-analytics"),
);

/**
 * /dashboards/home is shared by all roles, so this picks the dashboard
 * by role. When the branch / employee dashboards are ready, replace the
 * placeholders with lazy imports from pages/branch and pages/employee.
 */
export default function DashboardByRole() {
  const role = getCurrentRole();

  if (role === "branch") return <PlaceholderPage title="Branch Dashboard" />;
  if (role === "employee") return <PlaceholderPage title="Employee Dashboard" />;

  return (
    <Suspense fallback={null}>
      <SuperAdminDashboard />
    </Suspense>
  );
}
