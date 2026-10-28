// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// employee panel routes. Paths must match navigation/employee/segments/*.
// Replace `<PlaceholderPage />` with the real page when it is ready, e.g.
//   { path: "...", lazy: async () => ({ Component: (await import("@/app/pages/employee/...")).default }) }

export const employeeRoutes: RouteObject[] = [
  { path: "/employee/raise-ticket/list", element: <PlaceholderPage title="Raise Ticket" /> },
  { path: "/employee/my-tickets/list", element: <PlaceholderPage title="My Tickets" /> },
  { path: "/employee/my-ticket-history/list", element: <PlaceholderPage title="My Ticket History" /> },
  { path: "/employee/notifications/list", element: <PlaceholderPage title="Notifications" /> },
];
