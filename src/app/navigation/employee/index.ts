import { contractorNavigation } from "./contractor";
import { EmployeeSubRole } from "../role";

const navigationBySubRole: Partial<
  Record<EmployeeSubRole, typeof contractorNavigation>
> = {
  contractor: contractorNavigation,
};

export const getEmployeeNavigation = (subRole: EmployeeSubRole | null) =>
  subRole ? (navigationBySubRole[subRole] ?? []) : [];
