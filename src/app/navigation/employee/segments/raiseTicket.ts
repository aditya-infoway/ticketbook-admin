import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const raiseTicket: NavigationTree = {
  ...baseNavigationObj.raiseTicket,
  childs: [
    {
      id: "raiseTicket.createticket",
      type: "item",
      path: "/employee/raise-ticket/create-ticket",
      title: "Create Ticket",
      icon: "raiseTicket.list",
    },
  ],
};
