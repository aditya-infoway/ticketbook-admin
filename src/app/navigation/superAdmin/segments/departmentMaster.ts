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
      id: "departmentMaster.resolverTeam",
      type: "item",
      path: "/department-master/resolver-team",
      title: "Resolver Team Master",
      icon: "departmentMaster.createDepartment",
    },
    {
      id: "departmentMaster.createType",
      type: "item",
      path: "/department-master/create-type",
      title: "Create Type",
      icon: "departmentMaster.createType",
    },
    {
      id: "departmentMaster.role-master",
      type: "collapse",
      path: "/department-master/role-master",
      title: "Role Master",
      transKey: "Role Master",
      icon: "departmentMaster.role-master",
      childs: [
        {
          id: "departmentMaster.role-master.role-category",
          type: "item",
          path: "/department-master/role-master/role-category",
          title: "Role Category",
          transKey: "Role Category",
        },
        {
          id: "departmentMaster.role-master.role",
          type: "item",
          path: "/department-master/role-master/role",
          title: "Role",
          transKey: "Role",
        },
      ],
    },
  ],
};
 