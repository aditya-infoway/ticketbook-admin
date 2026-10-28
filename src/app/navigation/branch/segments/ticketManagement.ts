import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketManagement: NavigationTree = {
  ...baseNavigationObj.ticketManagement,
  childs: [
    {
      id: "ticketManagement.list",
      type: "item",
      path: "/branch/ticket-management/list",
      title: "Ticket Management",
      icon: "ticketManagement.list",
    },
  ],
};
