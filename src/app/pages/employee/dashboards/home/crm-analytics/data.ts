// src/app/(protected)/dashboards/home/data.ts

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  ticketId: string; // e.g., TKT-001
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

// Dummy Data for Tickets
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
    subject: "Need new software license",
    requestedBy: { name: "Katrina West", avatar: "/images/avatar/avatar-7.jpg", department: "Finance" },
    assignedTo: "Derrick Simmons",
    priority: "low",
    status: "resolved",
    createdAt: "2023-10-23",
  },
  {
    id: "4",
    ticketId: "TKT-8824",
    subject: "Email server timeout error",
    requestedBy: { name: "Derrick Simmons", avatar: "/images/avatar/avatar-19.jpg", department: "Engineering" },
    assignedTo: "Konnor Guzman",
    priority: "critical",
    status: "open",
    createdAt: "2023-10-24",
  },
  // Add more dummy data as needed...
];