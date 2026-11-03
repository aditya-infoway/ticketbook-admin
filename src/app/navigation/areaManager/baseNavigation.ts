import { NavigationTree } from "@/@types/navigation";

/**
 * Base navigation for Area Manager panel.
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
  myBranches: {
    id: "myBranches",
    type: "collapse",
    path: "/area-manager/my-branches",
    title: "My Branches",
    icon: "myBranches.list",
  },
  myTickets: {
    id: "myTickets",
    type: "collapse",
    path: "/area-manager/my-ticket",
    title: "Tickets",
    icon: "myTickets",
  },
  report: {
    id: "report",
    type: "collapse",
    path: "/area-manager/report",
    title: "Reports",
    icon: "reportsAnalytics",
  },
  myTicketHistory: {
    id: "myTicketHistory",
    type: "collapse",
    path: "/area-manager/my-ticket-history",
    title: " Activity History",
    icon: "myTicketHistory",
  },
  myNotifications: {
    id: "myNotifications",
    type: "collapse",
    path: "/area-manager/notifications",
    title: "Notifications",
    icon: "myNotifications",
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
