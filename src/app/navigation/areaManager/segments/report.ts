import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const report: NavigationTree = {
  ...baseNavigationObj.report,
  childs: [
    {
      id: "report.reports",
      type: "item",
      path: "/area-manager/report",
      title: "Reports",
      icon: "raiseTicket.list",
    },
  ],
};
