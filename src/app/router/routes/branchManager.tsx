import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";
import SubRoleGuard from "../SubRoleGuard";

export const branchManagerRoutes: RouteObject[] = [
  {
    path: "/employee/branch-manager",
    element: <SubRoleGuard allow="branch_manager" />,
    children: [
      {
        path: "raise-ticket/create-ticket",
        lazy: async () => ({
          Component: (
            await import("@/app/pages/employee/branchManager/raise-ticket/create-ticket")
          ).default,
        }),
      },
      { path: "my-tickets/list", element: <PlaceholderPage title="My Tickets" /> },
      { path: "my-ticket-history/list", element: <PlaceholderPage title="My Ticket History" /> },
      { path: "notifications/list", element: <PlaceholderPage title="Notifications" /> },
    ],
  },
];