import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const myTicketHistory: NavigationTree = {
  ...baseNavigationObj.myTicketHistory,
  childs: [
    {
      id: "myTicketHistory.list",
      type: "item",
      path: "/employee/my-ticket-history/list",
      title: "Activity History",
      icon: "myTicketHistory.list",
    },
  ],
};
  