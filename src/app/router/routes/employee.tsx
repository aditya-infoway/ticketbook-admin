import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";
import { contractorRoutes } from "./contractor";

// ----------------------------------------------------------------------
// Paths must EXACTLY match the paths in navigation/employee/segments/*
// ----------------------------------------------------------------------

export const employeeRoutes: RouteObject[] = [
  // ====================== Normal Employee Routes ======================

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
    path: "/employee/my-ticket-history",
    element: <PlaceholderPage title="My Ticket History" />,
  },

  {
    path: "/employee/notifications",
    element: <PlaceholderPage title="Notifications" />,
  },

  // ====================== Contractor Routes ======================
  ...contractorRoutes,
];
