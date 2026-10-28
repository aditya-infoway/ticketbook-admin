import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const reportsAnalytics: NavigationTree = {
  ...baseNavigationObj.reportsAnalytics,
  childs: [
    {
      id: "reportsAnalytics.branchPerformance",
      type: "item",
      path: "/reports-analytics/branch-performance",
      title: "Branch Performance",
      icon: "reportsAnalytics.branchPerformance",
    },
    {
      id: "reportsAnalytics.managerPerformance",
      type: "item",
      path: "/reports-analytics/manager-performance",
      title: "Manager Performance",
      icon: "reportsAnalytics.managerPerformance",
    },
    {
      id: "reportsAnalytics.departmentPerformance",
      type: "item",
      path: "/reports-analytics/department-performance",
      title: "Department Performance",
      icon: "reportsAnalytics.departmentPerformance",
    },
  ],
};