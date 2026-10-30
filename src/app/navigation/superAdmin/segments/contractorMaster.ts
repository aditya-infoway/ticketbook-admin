import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const contractorMaster: NavigationTree = {
  ...baseNavigationObj.contractorMaster,
  childs: [
    {
      id: "contractorMaster.contractorRegistration",
      type: "item",
      path: "/contractor-master/contractor-registration",
      title: "Contractor Registration",
      icon: "employeeMaster.contractorMaster",
    },
    {
      id: "contractorMaster.contractorDepartment",
      type: "item",
      path: "/contractor-master/contractor-department",
      title: "Contractor Department",
      icon: "employeeMaster.contractorMaster",
    },
  ],
};
