// Import Dependencies
import { Navigate, Outlet } from "react-router";

// Local Imports
import { getCurrentRole, UserRole } from "@/app/navigation/role";

// ----------------------------------------------------------------------

/**
 * Only lets the user in if their role is one of `allow`.
 * Use it as a pathless layout route, with the role's routes as children.
 *
 *   <RoleGuard allow="superAdmin" />
 *   <RoleGuard allow={["superAdmin", "branch"]} />
 *
 * NOTE: this only protects the UI. Always protect the API too
 * (verifyToken / verifyBranchToken / verifyEmployeeToken on the backend).
 */
export default function RoleGuard({ allow }: { allow: UserRole | UserRole[] }) {
  const role = getCurrentRole();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!allowed.includes(role)) {
    // wrong panel -> send the user back to the shared dashboard
    return <Navigate to="/dashboards/home" replace />;
  }

  return <Outlet />;
}