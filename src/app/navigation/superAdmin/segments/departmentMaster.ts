import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const departmentMaster: NavigationTree = {
  ...baseNavigationObj.departmentMaster,
  childs: [
    {
      id: "departmentMaster.list",
      type: "item",
      path: "/department-master/list",
      title: "Department Master",
      icon: "departmentMaster.list",
    },
  ],
};
