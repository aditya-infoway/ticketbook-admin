import { dashboards } from "./segments/dashboards";
import { myBranches } from "./segments/myBranches";
import { myTickets } from "./segments/myTickets";
import { myTicketHistory } from "./segments/myTicketHistory";
import { myNotifications } from "./segments/myNotifications";
import { logout } from "./segments/logout";
import { report } from "./segments/report";

export const areaManagerNavigation = [
  dashboards,
  myBranches,
  myTickets,
  report,
  myTicketHistory,
  myNotifications,
  logout,
];
