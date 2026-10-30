import { NavigationTree } from "@/@types/navigation";

/**
 * Base navigation for Contractor panel.
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
  raiseTicket: {
    id: "raiseTicket",
    type: "collapse",
    path: "/employee/contractor/raise-ticket",
    title: "Raise Ticket",
    icon: "raiseTicket",
  },
  myTickets: {
    id: "myTickets",
    type: "collapse",
    path: "/employee/my-tickets",
    title: "My Tickets",
    icon: "myTickets",
  },
  myTicketHistory: {
    id: "myTicketHistory",
    type: "collapse",
    path: "/employee/my-ticket-history",
    title: "My Ticket History",
    icon: "myTicketHistory",
  },
  myNotifications: {
    id: "myNotifications",
    type: "collapse",
    path: "/employee/notifications",
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