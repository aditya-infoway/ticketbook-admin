import { dashboards } from "./segments/dashboards";
import { employeeMaster } from "./segments/employeeMaster";
import { ticketManagement } from "./segments/ticketManagement";
import { contractorworkreview } from "./segments/contractorworkreview";
import { ticketHistoryAudit } from "./segments/ticketHistoryAudit";
import { logout } from "./segments/logout";

export const branchNavigation = [
  dashboards,
  employeeMaster,
  ticketManagement,
  contractorworkreview,
  ticketHistoryAudit,
  logout,
];
