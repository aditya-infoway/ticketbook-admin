import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const raiseTicket: NavigationTree = {
  ...baseNavigationObj.raiseTicket,
  childs: [
    {
      id: "raiseTicket.list",
      type: "item",
      path: "/employee/raise-ticket/list",
      title: "Raise Ticket",
      icon: "raiseTicket.list",
    },
  ],
};
