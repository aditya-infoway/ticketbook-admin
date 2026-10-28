import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const rolePermissionMaster: NavigationTree = {
  ...baseNavigationObj.rolePermissionMaster,
  childs: [
    {
      id: "rolePermissionMaster.list",
      type: "item",
      path: "/role-permission-master/list",
      title: "Dynamic Access Control",
      icon: "rolePermissionMaster.list",
    },
  ],
};
