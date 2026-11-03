// Area Manager ab alag login (/area-manager/login) hai, isliye sab routes "/area-manager/..." ke neeche.
import { RouteObject } from "react-router";
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// Paths navigation/areaManager/segments/* ke paths se EXACT match hone chahiye.
// Page ready hone par PlaceholderPage ki jagah:
//   {
//     path: "/area-manager/ticket-management/list",
//     lazy: async () => ({
//       Component: (await import("@/app/pages/areaManager/ticketManagement")).default,
//     }),
//   },

export const areaManagerRoutes: RouteObject[] = [
  {
    path: "/area-manager/ticket-management/list",
    element: <PlaceholderPage title="Ticket Management" />,
  },
  // apne navigation ke baaki paths yaha add karo
];