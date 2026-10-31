import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";
import SubRoleGuard from "../SubRoleGuard";

export const contractorRoutes: RouteObject[] = [
  {
    path: "/employee/contractor",
    element: <SubRoleGuard allow="contractor" />,
    children: [
      {
        path: "raise-ticket/create-ticket",
        lazy: async () => ({
          Component: (
            await import("@/app/pages/employee/contractor/raise-ticket/create-ticket")
          ).default,
        }),
      },
      {
        path: "my-ticket",
        lazy: async () => ({
          Component: (await import("@/app/pages/employee/contractor/my-ticket"))
            .default,
        }),
      },
      {
        path: "my-ticket-history/list",
        element: <PlaceholderPage title="My Ticket History" />,
      },
      {
        path: "notifications/list",
        element: <PlaceholderPage title="Notifications" />,
      },
    ],
  },
];
