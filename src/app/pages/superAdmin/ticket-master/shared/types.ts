export interface TicketCategory {
  id: string;
  ticketCategoryNo?: string;
  categoryCode: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  description: string;
  defaultResolverTeamId: string;
  defaultResolverTeamName: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}

export interface TicketStatus {
  id: string;
  ticketStatusNo?: string;
  statusCode: string;
  statusName: string;
  description: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}
