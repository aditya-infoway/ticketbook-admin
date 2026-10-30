import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigationObj";

export const myNotifications: NavigationTree = {
  ...baseNavigationObj.myNotifications,
  childs: [
    {
      id: "myNotifications.list",
      type: "item",
      path: "/employee/notifications/list",
      title: "Notifications",
      icon: "myNotifications.list",
    },
  ],
};
