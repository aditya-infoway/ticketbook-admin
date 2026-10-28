import { Navigate, RouteObject } from "react-router";
import RoleGuard from "./RoleGuard";

type Loader = () => Promise<{ default: React.ComponentType }>;
const lazyPage = (loader: Loader) => async () => ({
  Component: (await loader()).default,
});

// ---------- superAdmin ----------
export const superAdminSettings: RouteObject = {
  path: "settings",
  element: <RoleGuard allow="superAdmin" />,
  children: [
    {
      lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/Layout")),
      children: [
        { index: true, element: <Navigate to="general" replace /> },
        { path: "general", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/General")) },
        { path: "appearance", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/Appearance")) },
        { path: "prefix", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/Prefix")) },
        { path: "location", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/location")) },
        { path: "itemcategory", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/itemcategory")) },
        {
          path: "production",
          children: [
            { index: true, element: <Navigate to="/settings/production/main-process" replace /> },
            { path: "main-process", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/prodcutionsettings")) },
            { path: "sub-process", lazy: lazyPage(() => import("@/app/pages/superAdmin/settings/sections/prodcutionsettings/sub-process")) },
          ],
        },
      ],
    },
  ],
};

// ---------- branch ----------
export const branchSettings: RouteObject = {
  path: "branch/settings",
  element: <RoleGuard allow="branch" />,
  children: [
    {
      lazy: lazyPage(() => import("@/app/pages/branch/settings/Layout")),
      children: [
        { index: true, element: <Navigate to="general" replace /> },
        { path: "general", lazy: lazyPage(() => import("@/app/pages/branch/settings/sections/General")) },
        { path: "appearance", lazy: lazyPage(() => import("@/app/pages/branch/settings/sections/Appearance")) },
      ],
    },
  ],
};

// ---------- employee ----------
export const employeeSettings: RouteObject = {
  path: "employee/settings",
  element: <RoleGuard allow="employee" />,
  children: [
    {
      lazy: lazyPage(() => import("@/app/pages/employee/settings/Layout")),
      children: [
        { index: true, element: <Navigate to="general" replace /> },
        { path: "general", lazy: lazyPage(() => import("@/app/pages/employee/settings/sections/General")) },
        { path: "appearance", lazy: lazyPage(() => import("@/app/pages/employee/settings/sections/Appearance")) },
      ],
    },
  ],
};