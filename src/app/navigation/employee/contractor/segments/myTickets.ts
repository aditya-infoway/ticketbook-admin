import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigationObj";

export const myTickets: NavigationTree = {
  ...baseNavigationObj.myTickets,
  childs: [
    {
      id: "myTickets.list",
      type: "item",
      path: "/employee/my-tickets/list",
      title: "My Tickets",
      icon: "myTickets.list",
    },
  ],
};
