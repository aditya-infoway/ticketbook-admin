import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import DashboardByRole from "./DashboardByRole";
import RoleGuard from "./RoleGuard";
import SettingsIndexRedirect from "./SettingsIndexRedirect";
import { roleRoutes } from "./roleRoutes";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 *
 * Role based pages (super admin / branch / employee) live in ./roleRoutes
 * and are wrapped by RoleGuard.
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
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
              // shared path, dashboard is picked by role
              path: "home",
              element: <DashboardByRole />,
            },
          ],
        },

        // ============================================================
        // ROLE BASED ROUTES (superAdmin / branch / employee)
        // ============================================================
        ...roleRoutes,

        // ============================================================
        // SETTINGS (role based)
        //   general, appearance   -> every role
        //   everything else       -> superAdmin only
        // Keep navigation/roleSettings.ts in sync with this.
        // ============================================================
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <SettingsIndexRedirect />,
            },

            // ---- every role ----
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/General")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Appearance")
                ).default,
              }),
            },

            // ---- superAdmin only ----
            {
              element: <RoleGuard allow="superAdmin" />,
              children: [
                {
                  path: "prefix",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/settings/sections/Prefix")
                    ).default,
                  }),
                },
                {
                  path: "location",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/settings/sections/location")
                    ).default,
                  }),
                },
                {
                  path: "itemcategory",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/settings/sections/itemcategory")
                    ).default,
                  }),
                },
                {
                  path: "production",
                  children: [
                    {
                      index: true,
                      element: (
                        <Navigate
                          to="/settings/production/main-process"
                          replace
                        />
                      ),
                    },
                    {
                      path: "main-process",
                      lazy: async () => ({
                        Component: (
                          await import("@/app/pages/settings/sections/prodcutionsettings")
                        ).default,
                      }),
                    },
                    {
                      path: "sub-process",
                      lazy: async () => ({
                        Component: (
                          await import("@/app/pages/settings/sections/prodcutionsettings/sub-process")
                        ).default,
                      }),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };