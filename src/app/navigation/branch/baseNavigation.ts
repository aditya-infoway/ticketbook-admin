import { NavigationTree } from "@/@types/navigation";

/**
 * Base (left rail) navigation for the branch panel.
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

  employeeMaster: {
    id: "employeeMaster",
    type: "collapse",
    path: "/branch/employee-master",
    title: "Employee Master",
    icon: "employeeMaster",
  },

  ticketManagement: {
    id: "ticketManagement",
    type: "collapse",
    path: "/branch/ticket-management",
    title: "Ticket Management",
    icon: "ticketManagement",
  },

  reportsAnalytics: {
    id: "reportsAnalytics",
    type: "collapse",
    path: "/branch/reports-analytics",
    title: "Reports & Analytics",
    icon: "reportsAnalytics",
  },

  ticketHistoryAudit: {
    id: "ticketHistoryAudit",
    type: "collapse",
    path: "/branch/ticket-history-audit",
    title: "Ticket History & Audit",
    icon: "ticketHistoryAudit",
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
