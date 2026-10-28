import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const employeeMaster: NavigationTree = {
  ...baseNavigationObj.employeeMaster,
  childs: [
    {
      id: "employeeMaster.list",
      type: "item",
      path: "/branch/employee-master/list",
      title: "Employee Master",
      icon: "employeeMaster.list",
    },
  ],
};
