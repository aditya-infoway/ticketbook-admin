import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const slaEscalationMaster: NavigationTree = {
  ...baseNavigationObj.slaEscalationMaster,
  childs: [
    {
      id: "slaEscalationMaster.responseTime",
      type: "item",
      path: "/sla-escalation-master/response-time",
      title: "Response Time",
      icon: "slaEscalationMaster.responseTime",
    },
    {
      id: "slaEscalationMaster.resolutionDeadline",
      type: "item",
      path: "/sla-escalation-master/resolution-deadline",
      title: "Resolution Deadline",
      icon: "slaEscalationMaster.resolutionDeadline",
    },
  ],
};