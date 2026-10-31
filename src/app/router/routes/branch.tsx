// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// branch panel routes. Paths must match navigation/branch/segments/*.
// Replace `<PlaceholderPage />` with the real page when it is ready, e.g.
//   { path: "...", lazy: async () => ({ Component: (await import("@/app/pages/branch/...")).default }) }

export const branchRoutes: RouteObject[] = [
  { path: "/branch/employee-master/list", element: <PlaceholderPage title="Employee Master" /> },
  {
    path: "/branch/ticket-management/list",
    lazy: async () => ({
      Component: (await import("@/app/pages/branch/ticketManagement")).default,
    }),
  },
  {
    path: "/branch/contractor-work-review/list",
    lazy: async () => ({
      Component: (
        await import("@/app/pages/branch/contractor-work-review")
      ).default,
    }),
  },
  { path: "/branch/ticket-history-audit/list", element: <PlaceholderPage title="Ticket History & Audit" /> },
];