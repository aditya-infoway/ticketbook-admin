import { dashboards } from "./segments/dashboards";
import { raiseTicket } from "./segments/raiseTicket";
import { myTickets } from "./segments/myTickets";
import { myTicketHistory } from "./segments/myTicketHistory";
import { myNotifications } from "./segments/myNotifications";
import { logout } from "./segments/logout";

export const branchManagerNavigation = [
  dashboards,
  raiseTicket,
  myTickets,
  myTicketHistory,
  myNotifications,
  logout,
];
