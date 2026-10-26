import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const departmentMaster: NavigationTree = {
  ...baseNavigationObj.departmentMaster,
  childs: [
    {
      id: "departmentMaster.createDepartment",
      type: "item",
      path: "/department-master/create-department",
      title: "Create Department",
      icon: "departmentMaster.createDepartment",
    },
    {
      id: "departmentMaster.createType",
      type: "item",
      path: "/department-master/create-type",
      title: "Create Type",
      icon: "departmentMaster.createType",
    },
  ],
};