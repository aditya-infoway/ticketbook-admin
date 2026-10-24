import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const employeeMaster: NavigationTree = {
  ...baseNavigationObj.employeeMaster,
  childs: [
    {
      id: "employeeMaster.list",
      type: "item",
      path: "/employee-master/list",
      title: "Employee List",
      icon: "employeeMaster.list",
    },
    {
      id: "employeeMaster.onboarding",
      type: "item",
      path: "/employee-master/onboarding",
      title: "Employee Onboarding",
      icon: "employeeMaster.onboarding",
    },
    {
      id: "employeeMaster.branchMapping",
      type: "item",
      path: "/employee-master/branch-mapping",
      title: "Branch Mapping",
      icon: "employeeMaster.branchMapping",
    },
  ],
};