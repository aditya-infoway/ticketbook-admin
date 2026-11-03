export interface CreateTicket {
  id: string;
  ticketNumber: string;
  ticketNo?: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  categoryId: string;
  categoryName: string;
  subject: string;
  issueDescription: string;
  attachment: string | null;
  contactNumber: string;
  status: string;
  statusId?: string;
  ticketId?: number;
  createdBy: string;
  createdAt: string;
}
