import { NavigationTree } from "@/@types/navigation";

/**
 * Base (left rail) navigation for the superAdmin panel.
 */
export const baseNavigationObj: Record<string, NavigationTree> = {
  dashboards: {
    id: "dashboards",
    type: "item",
    path: "/dashboards/home",
    title: "Dashboard",
    transKey: "nav.dashboards.dashboards",
    icon: "dashboards",
  },

  branchMaster: {
    id: "branchMaster",
    type: "collapse",
    path: "/branch-master",
    title: "Branch Master",
    icon: "branchMaster",
  },

  regionMaster: {
    id: "regionMaster",
    type: "collapse",
    path: "/region-master",
    title: "Region / Area Master",
    icon: "regionMaster",
  },

  departmentMaster: {
    id: "departmentMaster",
    type: "collapse",
    path: "/department-master",
    title: "Department Master",
    icon: "departmentMaster",
  },

  employeeMaster: {
    id: "employeeMaster",
    type: "collapse",
    path: "/employee-master",
    title: "Employee Master",
    icon: "employeeMaster",
  },

  rolePermissionMaster: {
    id: "rolePermissionMaster",
    type: "collapse",
    path: "/role-permission-master",
    title: "Role & Permission Master",
    icon: "rolePermissionMaster",
  },

  managerAssignment: {
    id: "managerAssignment",
    type: "collapse",
    path: "/manager-assignment",
    title: "Manager Assignment",
    icon: "managerAssignment",
  },

  ticketCategoryMaster: {
    id: "ticketCategoryMaster",
    type: "collapse",
    path: "/ticket-master",
    title: "Ticket Category Master",
    icon: "ticketCategoryMaster",
  },

  ticketWorkflowMaster: {
    id: "ticketWorkflowMaster",
    type: "collapse",
    path: "/ticket-workflow-master",
    title: "Ticket Workflow Master",
    icon: "ticketWorkflowMaster",
  },

  slaEscalationMaster: {
    id: "slaEscalationMaster",
    type: "collapse",
    path: "/sla-escalation-master",
    title: "SLA & Escalation Master",
    icon: "slaEscalationMaster",
  },

  ticketManagement: {
    id: "ticketManagement",
    type: "collapse",
    path: "/ticket-management",
    title: "Ticket Management",
    icon: "ticketManagement",
  },

  notificationMaster: {
    id: "notificationMaster",
    type: "collapse",
    path: "/notification-master",
    title: "Notification Master",
    icon: "notificationMaster",
  },

  reportsAnalytics: {
    id: "reportsAnalytics",
    type: "collapse",
    path: "/reports-analytics",
    title: "Reports & Analytics",
    icon: "reportsAnalytics",
  },

  ticketHistoryAudit: {
    id: "ticketHistoryAudit",
    type: "collapse",
    path: "/ticket-history-audit",
    title: "Ticket History & Audit",
    icon: "ticketHistoryAudit",
  },

  companySettings: {
    id: "companySettings",
    type: "collapse",
    path: "/company-settings",
    title: "Company Settings",
    icon: "companySettings",
  },

  logout: {
    id: "logout",
    type: "item",
    path: "/login",
    title: "Logout",
    transKey: "nav.logout",
    icon: "logout",
  },
};

export const baseNavigation: NavigationTree[] = Array.from(
  Object.values(baseNavigationObj),
);
