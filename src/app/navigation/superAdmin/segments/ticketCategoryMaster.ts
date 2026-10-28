import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketCategoryMaster: NavigationTree = {
  ...baseNavigationObj.ticketCategoryMaster,
  childs: [
    {
      id: "ticketCategoryMaster.issueCategories",
      type: "item",
      path: "/ticket-category-master/issue-categories",
      title: "Issue Categories",
      icon: "ticketCategoryMaster.issueCategories",
    },
    {
      id: "ticketCategoryMaster.subCategories",
      type: "item",
      path: "/ticket-category-master/sub-categories",
      title: "Sub Categories",
      icon: "ticketCategoryMaster.subCategories",
    },
  ],
};