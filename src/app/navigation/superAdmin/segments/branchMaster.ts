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
      id: "branchMaster.branchManager",
      type: "item",
      path: "/branch-master/branch-manager",
      title: "Branch Manager",
      icon: "branchMaster.branchManager",
    },
    
  ],
};
