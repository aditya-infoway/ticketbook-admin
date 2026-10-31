import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const contractorworkreview: NavigationTree = {
  ...baseNavigationObj.contractorworkreview,
  childs: [
    {
      id: "contractorworkreview.list",
      type: "item",
      path: "/branch/contractor-work-review/list",
      title: "Contractor Work Review",
      icon: "contractorworkreview.list",
    },
  ],
};
