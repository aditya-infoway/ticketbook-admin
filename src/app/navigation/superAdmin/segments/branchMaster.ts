import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const branchMaster: NavigationTree = {
  ...baseNavigationObj.branchMaster,
  childs: [
    {
      id: "branchMaster.createBranch",
      type: "item",
      path: "/branch-master/create-branch",
      title: "Create Branch",
      icon: "branchMaster.createBranch",
    },
    {
      id: "branchMaster.region",
      type: "item",
      path: "/branch-master/regions",
      title: "Regions",
      icon: "branchMaster.region",
    },
    {
      id: "branchMaster.hierarchy",
      type: "item",
      path: "/branch-master/hierarchy",
      title: "Hierarchy",
      icon: "branchMaster.hierarchy",
    },
  ],
};