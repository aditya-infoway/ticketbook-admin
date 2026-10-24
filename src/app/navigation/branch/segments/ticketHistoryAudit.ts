import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketHistoryAudit: NavigationTree = {
  ...baseNavigationObj.ticketHistoryAudit,
  childs: [
    {
      id: "ticketHistoryAudit.list",
      type: "item",
      path: "/branch/ticket-history-audit/list",
      title: "Ticket History & Audit",
      icon: "ticketHistoryAudit.list",
    },
  ],
};
