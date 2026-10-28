import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const regionMaster: NavigationTree = {
  ...baseNavigationObj.regionMaster,
  childs: [
    {
      id: "regionMaster.groupBranches",
      type: "item",
      path: "/region-master/group-branches",
      title: "Group Branches",
      icon: "regionMaster.groupBranches",
    },
    {
      id: "regionMaster.assignAreaManager",
      type: "item",
      path: "/region-master/assign-area-manager",
      title: "Assign Area Manager",
      icon: "regionMaster.assignAreaManager",
    },
  ],
};