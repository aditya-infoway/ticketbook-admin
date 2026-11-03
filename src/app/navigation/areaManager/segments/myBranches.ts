import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const myBranches: NavigationTree = {
  ...baseNavigationObj.myBranches,
  childs: [
    {
      id: "myBranches.mybranches",
      type: "item",
      path: "/area-manager/my-branches",
      title: "My Branches",
      icon: "myBranches.list",
    },
  ],
};
