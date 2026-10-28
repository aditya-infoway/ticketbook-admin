import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import DashboardByRole from "./DashboardByRole";
import {
  superAdminSettings,
  branchSettings,
  employeeSettings,
} from "./settingsRoutes";
import { roleRoutes } from "./roleRoutes";

const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              element: <DashboardByRole />,
            },
          ],
        },

        // ROLE BASED ROUTES
        ...roleRoutes,

        // SETTINGS (separate per role)
        superAdminSettings,
        branchSettings,
        employeeSettings,
      ],
    },
  ],
};

export { protectedRoutes };