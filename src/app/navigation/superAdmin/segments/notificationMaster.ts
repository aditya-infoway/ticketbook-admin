import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const notificationMaster: NavigationTree = {
  ...baseNavigationObj.notificationMaster,
  childs: [
    {
      id: "notificationMaster.templates",
      type: "item",
      path: "/notification-master/templates",
      title: "Templates",
      icon: "notificationMaster.templates",
    },
    {
      id: "notificationMaster.triggers",
      type: "item",
      path: "/notification-master/triggers",
      title: "Triggers",
      icon: "notificationMaster.triggers",
    },
    {
      id: "notificationMaster.reminders",
      type: "item",
      path: "/notification-master/reminders",
      title: "Reminders",
      icon: "notificationMaster.reminders",
    },
  ],
};