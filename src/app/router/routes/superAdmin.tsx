// Import Dependencies
import { RouteObject } from "react-router";

// Local Imports
import PlaceholderPage from "../PlaceholderPage";

// ----------------------------------------------------------------------
// superAdmin panel routes. Paths must match navigation/superAdmin/segments/*.
// Replace `<PlaceholderPage />` with the real page when it is ready, e.g.
//   { path: "...", lazy: async () => ({ Component: (await import("@/app/pages/superAdmin/...")).default }) }

export const superAdminRoutes: RouteObject[] = [
  { path: "/branch-master/create-branch", element: <PlaceholderPage title="Create Branch" /> },
  { path: "/branch-master/regions", element: <PlaceholderPage title="Regions" /> },
  { path: "/branch-master/hierarchy", element: <PlaceholderPage title="Hierarchy" /> },
  { path: "/region-master/group-branches", element: <PlaceholderPage title="Group Branches" /> },
  { path: "/region-master/assign-area-manager", element: <PlaceholderPage title="Assign Area Manager" /> },
  { path: "/department-master/list", element: <PlaceholderPage title="Department Master" /> },
  { path: "/employee-master/list", element: <PlaceholderPage title="Employee List" /> },
  { path: "/employee-master/onboarding", element: <PlaceholderPage title="Employee Onboarding" /> },
  { path: "/employee-master/branch-mapping", element: <PlaceholderPage title="Branch Mapping" /> },
  { path: "/role-permission-master/list", element: <PlaceholderPage title="Role & Permission Master" /> },
  { path: "/manager-assignment/branch-managers", element: <PlaceholderPage title="Branch Manager" /> },
  { path: "/manager-assignment/area-managers", element: <PlaceholderPage title="Area Manager" /> },
  { path: "/manager-assignment/department-managers", element: <PlaceholderPage title="Department Manager" /> },
  { path: "/ticket-category-master/issue-categories", element: <PlaceholderPage title="Issue Categories" /> },
  { path: "/ticket-category-master/sub-categories", element: <PlaceholderPage title="Sub Categories" /> },
  { path: "/ticket-workflow-master/statuses", element: <PlaceholderPage title="Statuses" /> },
  { path: "/ticket-workflow-master/routing", element: <PlaceholderPage title="Routing" /> },
  { path: "/ticket-workflow-master/approvals", element: <PlaceholderPage title="Approvals" /> },
  { path: "/sla-escalation-master/response-time", element: <PlaceholderPage title="Response Time" /> },
  { path: "/sla-escalation-master/resolution-deadline", element: <PlaceholderPage title="Resolution Deadline" /> },
  { path: "/ticket-management/list", element: <PlaceholderPage title="Ticket Management" /> },
  { path: "/notification-master/templates", element: <PlaceholderPage title="Templates" /> },
  { path: "/notification-master/triggers", element: <PlaceholderPage title="Triggers" /> },
  { path: "/notification-master/reminders", element: <PlaceholderPage title="Reminders" /> },
  { path: "/reports-analytics/branch-performance", element: <PlaceholderPage title="Branch Performance" /> },
  { path: "/reports-analytics/manager-performance", element: <PlaceholderPage title="Manager Performance" /> },
  { path: "/reports-analytics/department-performance", element: <PlaceholderPage title="Department Performance" /> },
  { path: "/ticket-history-audit/list", element: <PlaceholderPage title="Ticket History & Audit" /> },
  { path: "/company-settings/list", element: <PlaceholderPage title="Company Settings" /> },
];
