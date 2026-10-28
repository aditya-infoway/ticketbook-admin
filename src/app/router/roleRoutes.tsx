// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import RoleGuard from "./RoleGuard";
import { superAdminRoutes } from "./routes/superAdmin";
import { branchRoutes } from "./routes/branch";
import { employeeRoutes } from "./routes/employee";

// ----------------------------------------------------------------------

/**
 * Each role gets a pathless guard route. Users of another role who type the
 * URL are redirected to /dashboards/home.
 *
 * Put `...roleRoutes` inside the children of your protected layout route
 * (the one that renders the sidebar / MainLayout).
 */
export const roleRoutes: RouteObject[] = [
  {
    id: "super-admin",
    element: <RoleGuard allow="superAdmin" />,
    children: superAdminRoutes,
  },
  {
    id: "branch",
    element: <RoleGuard allow="branch" />,
    children: branchRoutes,
  },
  {
    id: "employee",
    element: <RoleGuard allow="employee" />,
    children: employeeRoutes,
  },
];
