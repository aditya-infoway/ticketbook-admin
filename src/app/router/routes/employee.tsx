// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// employee panel routes. Paths must match navigation/employee/segments/*.
// Replace `<PlaceholderPage />` with the real page when it is ready, e.g.
//   { path: "...", lazy: async () => ({ Component: (await import("@/app/pages/employee/...")).default }) }

export const employeeRoutes: RouteObject[] = [
  {
    path: "/employee/raise-ticket/create-ticket",
    lazy: async () => ({
      Component: (
        await import("@/app/pages/employee/raise-ticket/create-ticket")
      ).default,
    }),
  },
  {
    path: "/employee/my-ticket/list",
    lazy: async () => ({
      Component: (await import("@/app/pages/employee/my-ticket/TicketPage"))
        .default,
    }),
  },

  {
    path: "/employee/my-ticket/:id",
    lazy: async () => ({
      Component: (
        await import("@/app/pages/employee/my-ticket/TicketDetailsPage")
      ).default,
    }),
  },
  {
    path: "/employee/my-ticket-history/list",
    element: <PlaceholderPage title="My Ticket History" />,
  },
  {
    path: "/employee/notifications/list",
    element: <PlaceholderPage title="Notifications" />,
  },
];
