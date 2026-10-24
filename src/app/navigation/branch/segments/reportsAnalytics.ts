import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const reportsAnalytics: NavigationTree = {
  ...baseNavigationObj.reportsAnalytics,
  childs: [
    {
      id: "reportsAnalytics.list",
      type: "item",
      path: "/branch/reports-analytics/list",
      title: "Reports & Analytics",
      icon: "reportsAnalytics.list",
    },
  ],
};
