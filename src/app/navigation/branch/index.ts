import { dashboards } from "./segments/dashboards";
import { employeeMaster } from "./segments/employeeMaster";
import { ticketManagement } from "./segments/ticketManagement";
import { reportsAnalytics } from "./segments/reportsAnalytics";
import { ticketHistoryAudit } from "./segments/ticketHistoryAudit";
import { logout } from "./segments/logout";

export const branchNavigation = [
  dashboards,
  employeeMaster,
  ticketManagement,
  reportsAnalytics,
  ticketHistoryAudit,
  logout,
];
