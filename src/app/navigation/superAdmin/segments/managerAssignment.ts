import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const managerAssignment: NavigationTree = {
  ...baseNavigationObj.managerAssignment,
  childs: [
    {
      id: "managerAssignment.branchManager",
      type: "item",
      path: "/manager-assignment/branch-managers",
      title: "Branch Manager",
      icon: "managerAssignment.branchManager",
    },
    {
      id: "managerAssignment.areaManager",
      type: "item",
      path: "/manager-assignment/area-managers",
      title: "Area Manager",
      icon: "managerAssignment.areaManager",
    },
    {
      id: "managerAssignment.departmentManager",
      type: "item",
      path: "/manager-assignment/department-managers",
      title: "Department Manager",
      icon: "managerAssignment.departmentManager",
    },
  ],
};