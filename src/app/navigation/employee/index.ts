import { areaManagerNavigation } from "./areaManager";
import { branchManagerNavigation } from "./branchManager";
import { contractorNavigation } from "./contractor";
import { EmployeeSubRole } from "../role";

const navigationBySubRole = {
  branch_manager: branchManagerNavigation,
  area_manager: areaManagerNavigation,
  contractor: contractorNavigation,
};

export const getEmployeeNavigation = (subRole: EmployeeSubRole | null) =>
  subRole ? navigationBySubRole[subRole] : [];