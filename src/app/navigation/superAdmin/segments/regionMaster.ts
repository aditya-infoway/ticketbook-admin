import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const regionMaster: NavigationTree = {
  ...baseNavigationObj.regionMaster,
  childs: [
    {
      id: "regionMaster.assignAreaManager",
      type: "item",
      path: "/region-master/area-manager",
      title: " Area Manager",
      icon: "regionMaster.assignAreaManager",
    },
    {
      id: "regionMaster.region",
      type: "collapse",
      path: "/region-master/region",
      title: "Region",
      transKey: "Region",
      icon: "regionMaster.region",
      childs: [
        {
          id: "regionMaster.region.list",
          type: "item",
          path: "/region-master/area-master",
          title: "Area Master ",
        },
        {
          id: "regionMaster.region.create",
          type: "item",
          path: "/region-master/region-type",
          title: " Area Type Master",
        },
      ],
    },
  ],
};
