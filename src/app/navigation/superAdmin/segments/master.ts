import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const master: NavigationTree = {
  ...baseNavigationObj.master,
  childs: [
    {
      id: "master.region.list",
      type: "item",
      path: "/master/area-master",
      title: "Create Zone",
    },
    {
      id: "master.createBranch",
      type: "item",
      path: "/master/create-branch",
      title: "Create Branch",
      icon: "branchMaster.createBranch",
    },
    {
      id: "master.areaManager",
      type: "item",
      path: "/master/area-manager",
      title: " Area Manager",
      icon: "regionMaster.assignAreaManager",
    },
    {
      id: "master.createDepartment",
      type: "item",
      path: "/master/create-department",
      title: "Department",
      icon: "departmentMaster.createDepartment",
    },
    {
      id: "master.createDepartment",
      type: "item",
      path: "/master/role",
      title: "Role",
      icon: "departmentMaster.Role",
    },
    {
      id: "master.employeelist",
      type: "item",
      path: "/master/employee-list",
      title: "Create Employee",
      icon: "employeeMaster.list",
    },
  ],
};
