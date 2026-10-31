import { dashboards } from "./segments/dashboards";
import { branchMaster } from "./segments/branchMaster";
import { regionMaster } from "./segments/regionMaster";
import { departmentMaster } from "./segments/departmentMaster";
import { employeeMaster } from "./segments/employeeMaster";
// import { rolePermissionMaster } from "./segments/rolePermissionMaster";
// import { managerAssignment } from "./segments/managerAssignment";
import { ticketCategoryMaster } from "./segments/ticketCategoryMaster";
// import { ticketWorkflowMaster } from "./segments/ticketWorkflowMaster";
// import { slaEscalationMaster } from "./segments/slaEscalationMaster";
import { ticketManagement } from "./segments/ticketManagement";
// import { notificationMaster } from "./segments/notificationMaster";
// import { reportsAnalytics } from "./segments/reportsAnalytics";
import { ticketHistoryAudit } from "./segments/ticketHistoryAudit";
// import { companySettings } from "./segments/companySettings";
import { logout } from "./segments/logout";
import { contractorMaster } from "./segments/contractorMaster";

export const superAdminNavigation = [
  dashboards,
  branchMaster,
  regionMaster,
  departmentMaster,
  employeeMaster,
  contractorMaster,
  // rolePermissionMaster,
  // managerAssignment,
  ticketCategoryMaster,
  // ticketWorkflowMaster,
  // slaEscalationMaster,
  ticketManagement,
  // notificationMaster,
  // reportsAnalytics,
  ticketHistoryAudit,
  // companySettings,
  logout,
];
