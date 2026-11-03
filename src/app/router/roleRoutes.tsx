// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import RoleGuard from "./RoleGuard";
import { superAdminRoutes } from "./routes/superAdmin";
import { branchRoutes } from "./routes/branch";
import { employeeRoutes } from "./routes/employee";
import { areaManagerRoutes } from "./routes/areaManager";
import { branchManagerRoutes } from "./routes/branchManager";


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
    {
    id: "area-manager",
    element: <RoleGuard allow="areaManager" />,
    children: areaManagerRoutes,
  },
  {
    id: "branch-manager",
    element: <RoleGuard allow="branchManager" />,
    children: branchManagerRoutes,
  },
];
