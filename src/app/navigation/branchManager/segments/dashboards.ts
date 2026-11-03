import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigationObj";

export const dashboards: NavigationTree = {
  ...baseNavigationObj.dashboards,
  childs: [
    {
      id: "dashboards.home",
      type: "item",
      path: "/dashboards/home",
      title: "Dashboard",
      transKey: "nav.dashboards.dashboards",
      icon: "dashboards.home",
    },
  ],
};
