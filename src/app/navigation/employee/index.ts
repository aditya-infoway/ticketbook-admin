import { NavigationTree } from "@/@types/navigation";
import { contractorNavigation } from "./contractor";
import { EmployeeSubRole } from "../role";

// Import all employee segments
import { dashboards } from "./segments/dashboards";
import { raiseTicket } from "./segments/raiseTicket";
import { myTickets } from "./segments/myTickets";
import { myTicketHistory } from "./segments/myTicketHistory";
import { myNotifications } from "./segments/myNotifications";
import { logout } from "./segments/logout";

const employeeNavigation: NavigationTree[] = [
  dashboards,
  raiseTicket,
  myTickets,
  myTicketHistory,
  myNotifications,
  logout,
];

export const getEmployeeNavigation = (
  subRole: EmployeeSubRole | null,
): NavigationTree[] => {
  if (subRole === "contractor") {
    return contractorNavigation;
  }

  // Normal employee → use the properly composed menu
  return employeeNavigation;
};
