import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const companySettings: NavigationTree = {
  ...baseNavigationObj.companySettings,
  childs: [
    {
      id: "companySettings.list",
      type: "item",
      path: "/company-settings/list",
      title: "Company Settings",
      icon: "companySettings.list",
    },
  ],
};
