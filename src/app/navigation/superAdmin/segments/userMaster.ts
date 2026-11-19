import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const branchMaster: NavigationTree = {
  ...baseNavigationObj.branchMaster,
  childs: [
    // {
    //   id: "branchMaster.branchManager",
    //   type: "item",
    //   path: "/branch-master/branch-manager",
    //   title: "Branch Manager",
    //   icon: "branchMaster.branchManager",
    // },
    {
      id: "branchMaster.Account",
      type: "item",
      path: "/user-master/account-master",
      title: "Accounts",
      icon: "branchMaster.branchManager",
    },
  ],
};
