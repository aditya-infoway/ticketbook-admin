import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketHistoryAudit: NavigationTree = {
  ...baseNavigationObj.ticketHistoryAudit,
  childs: [
    {
      id: "ticketHistoryAudit.list",
      type: "item",
      path: "/ticket-history-audit/list",
      title: "Complete Event History",
      icon: "ticketHistoryAudit.list",
    },
  ],
};
