// Branch Manager ab alag login (/branch-manager/login) hai, isliye sab routes "/branch-manager/..." ke neeche.
import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// Paths navigation/branchManager/segments/* ke paths se EXACT match hone chahiye.
// Page ready hone par PlaceholderPage ki jagah:
//   {
//     path: "/branch-manager/ticket-management/list",
//     lazy: async () => ({
//       Component: (await import("@/app/pages/branchManager/ticketManagement")).default,
//     }),
//   },

export const branchManagerRoutes: RouteObject[] = [
  {
    path: "/branch-manager/raise-ticket/create-ticket",
    lazy: async () => ({
      Component: (
        await import("@/app/pages/branchManager/raise-ticket/create-ticket")
      ).default,
    }),
  },
   {
    path: "/branch-manager/my-ticket/list",
    lazy: async () => ({
      Component: (
        await import("@/app/pages/branchManager/my-ticket/TicketPage")
      ).default,
    }),
  },
  {
    path: "/branch-manager/ticket-management/list",
    element: <PlaceholderPage title="Ticket Management" />,
  },
  // apne navigation ke baaki paths yaha add karo
];
