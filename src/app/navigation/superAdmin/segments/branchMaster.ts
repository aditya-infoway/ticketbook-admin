import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const branchMaster: NavigationTree = {
  ...baseNavigationObj.branchMaster,
  childs: [
    {
      id: "branchMaster.createBranch",
      type: "item",
      path: "/branch-master/create-branch",
      title: "Create Branch",
      icon: "branchMaster.createBranch",
    },
    {
      id: "branchMaster.region",
      type: "collapse",                   
      path: "/branch-master/region",
      title: "Region",
      transKey: "Region",
      icon: "branchMaster.region",
      childs: [
        {
          id: "branchMaster.region.list",
          type: "item",
          path: "/branch-master/area-master",
          title: "Area Master ",
        },
        {
          id: "branchMaster.region.create",
          type: "item",
          path: "/branch-master/region-type",
          title: " Area Type Master",
        },
      ],
    },
  ],
};