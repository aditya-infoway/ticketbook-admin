import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketWorkflowMaster: NavigationTree = {
  ...baseNavigationObj.ticketWorkflowMaster,
  childs: [
    {
      id: "ticketWorkflowMaster.statuses",
      type: "item",
      path: "/ticket-workflow-master/statuses",
      title: "Statuses",
      icon: "ticketWorkflowMaster.statuses",
    },
    {
      id: "ticketWorkflowMaster.routing",
      type: "item",
      path: "/ticket-workflow-master/routing",
      title: "Routing",
      icon: "ticketWorkflowMaster.routing",
    },
    {
      id: "ticketWorkflowMaster.approvals",
      type: "item",
      path: "/ticket-workflow-master/approvals",
      title: "Approvals",
      icon: "ticketWorkflowMaster.approvals",
    },
  ],
};