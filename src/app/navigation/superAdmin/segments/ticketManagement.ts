import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketManagement: NavigationTree = {
  ...baseNavigationObj.ticketManagement,
  childs: [
    {
      id: "ticketManagement.list",
      type: "item",
      path: "/ticket-management/list",
      title: "All company tickets and actions ",
      icon: "ticketManagement.list",
    },
  ],
};
