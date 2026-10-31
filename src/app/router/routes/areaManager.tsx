import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";
import SubRoleGuard from "../SubRoleGuard";

export const areaManagerRoutes: RouteObject[] = [
  {
    path: "/employee/area-manager",
    element: <SubRoleGuard allow="area_manager" />,
    children: [
      {
        path: "raise-ticket/create-ticket",
        lazy: async () => ({
          Component: (
            await import("@/app/pages/employee/areaManager/raise-ticket/create-ticket")
          ).default,
        }),
      },
      {
        path: "my-ticket/list",
        lazy: async () => ({
          Component: (
            await import("@/app/pages/employee/areaManager/my-ticket/TicketPage")
          ).default,
        }),
      },
      {
  path: "my-ticket/:id",
  lazy: async () => ({
    Component: (
      await import("@/app/pages/employee/areaManager/my-ticket/TicketDetailsPage")
    ).default,
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
