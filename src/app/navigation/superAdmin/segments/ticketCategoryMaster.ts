import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const ticketCategoryMaster: NavigationTree = {
  ...baseNavigationObj.ticketCategoryMaster,
  childs: [
    {
      id: "ticketCategoryMaster.ticketcategory",
      type: "item",
      path: "ticket-master/ticket-category",
      title: "Ticket Categories",
      icon: "ticketCategoryMaster.issueCategories",
    },
    {
      id: "ticketCategoryMaster.ticketstatus",
      type: "item",
      path: "ticket-master/ticket-status",
      title: "Ticket Status Master",
      icon: "ticketCategoryMaster.subCategories",
    },
  ],
};
