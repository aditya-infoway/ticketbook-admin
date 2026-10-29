// ----------------------------------------------------------------------
// EMPLOYEE TYPES (Purane wale preserve hain, agar aage kahin use ho)
// ----------------------------------------------------------------------

export type EmployeeStatus = "active" | "on-leave";

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  avatar: string;
  department: string;
  openIssues: number;
  pendingRequests: number;
  status: EmployeeStatus;
}

export const employeeStatusOptions = [
  { id: "active", label: "Active" },
  { id: "on-leave", label: "On Leave" },
];

export const initialEmployees: Employee[] = [
  { id: "1", empCode: "EMP-001", name: "Travis Fuller", avatar: "/images/avatar/avatar-5.jpg", department: "Engineering", openIssues: 2, pendingRequests: 1, status: "active" },
  { id: "2", empCode: "EMP-002", name: "Konnor Guzman", avatar: "/images/avatar/avatar-18.jpg", department: "Sales", openIssues: 0, pendingRequests: 3, status: "active" },
  { id: "3", empCode: "EMP-003", name: "Alfredo Elliott", avatar: "/images/avatar/avatar-6.jpg", department: "Marketing", openIssues: 5, pendingRequests: 0, status: "on-leave" },
  { id: "4", empCode: "EMP-004", name: "Samantha Shelton", avatar: "/images/avatar/avatar-11.jpg", department: "HR", openIssues: 1, pendingRequests: 2, status: "active" },
  { id: "5", empCode: "EMP-005", name: "Derrick Simmons", avatar: "/images/avatar/avatar-19.jpg", department: "Engineering", openIssues: 0, pendingRequests: 0, status: "active" },
  { id: "6", empCode: "EMP-006", name: "Katrina West", avatar: "/images/avatar/avatar-7.jpg", department: "Finance", openIssues: 3, pendingRequests: 1, status: "active" },
];


// ----------------------------------------------------------------------
// TICKET TYPES (Naye wale - Ticket Dashboard ke liye)
// ----------------------------------------------------------------------

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  ticketId: string;
  subject: string;
  requestedBy: {
    name: string;
    avatar: string;
    department: string;
  };
  assignedTo: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
}

export const ticketStatusOptions = [
  { id: "open", label: "Open" },
  { id: "in-progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

export const ticketPriorityOptions = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

// TODO: replace with API data, e.g. Get("ticket/list", {}, false)
export const initialTickets: Ticket[] = [
  {
    id: "1",
    ticketId: "TKT-8821",
    subject: "Cannot access VPN from home",
    requestedBy: { name: "Travis Fuller", avatar: "/images/avatar/avatar-5.jpg", department: "Engineering" },
    assignedTo: "Konnor Guzman",
    priority: "high",
    status: "open",
    createdAt: "2023-10-24",
  },
  {
    id: "2",
    ticketId: "TKT-8822",
    subject: "Printer not working on 3rd floor",
    requestedBy: { name: "Samantha Shelton", avatar: "/images/avatar/avatar-11.jpg", department: "HR" },
    assignedTo: "Alfredo Elliott",
    priority: "medium",
    status: "in-progress",
    createdAt: "2023-10-24",
  },
  {
    id: "3",
    ticketId: "TKT-8823",
    subject: "Need new software license for Figma",
    requestedBy: { name: "Katrina West", avatar: "/images/avatar/avatar-7.jpg", department: "Finance" },
    assignedTo: "Derrick Simmons",
    priority: "low",
    status: "resolved",
    createdAt: "2023-10-23",
  },
  {
    id: "4",
    ticketId: "TKT-8824",
    subject: "Email server timeout error (Urgent)",
    requestedBy: { name: "Derrick Simmons", avatar: "/images/avatar/avatar-19.jpg", department: "Engineering" },
    assignedTo: "Konnor Guzman",
    priority: "critical",
    status: "open",
    createdAt: "2023-10-24",
  },
  {
    id: "5",
    ticketId: "TKT-8825",
    subject: "Update employee onboarding docs",
    requestedBy: { name: "Alfredo Elliott", avatar: "/images/avatar/avatar-6.jpg", department: "Marketing" },
    assignedTo: "Samantha Shelton",
    priority: "medium",
    status: "closed",
    createdAt: "2023-10-22",
  },
  {
    id: "6",
    ticketId: "TKT-8826",
    subject: "Laptop screen flickering issue",
    requestedBy: { name: "Konnor Guzman", avatar: "/images/avatar/avatar-18.jpg", department: "Sales" },
    assignedTo: "Travis Fuller",
    priority: "high",
    status: "in-progress",
    createdAt: "2023-10-24",
  },
];