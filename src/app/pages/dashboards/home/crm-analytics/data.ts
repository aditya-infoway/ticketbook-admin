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

// TODO: replace with API data, e.g. Get("employee/list", {}, false)
// and map the response with a mapApiEmployeeToEmployee() like the enquiry source page.
export const initialEmployees: Employee[] = [
  { id: "1", empCode: "EMP-001", name: "Travis Fuller", avatar: "/images/avatar/avatar-5.jpg", department: "Engineering", openIssues: 2, pendingRequests: 1, status: "active" },
  { id: "2", empCode: "EMP-002", name: "Konnor Guzman", avatar: "/images/avatar/avatar-18.jpg", department: "Sales", openIssues: 0, pendingRequests: 3, status: "active" },
  { id: "3", empCode: "EMP-003", name: "Alfredo Elliott", avatar: "/images/avatar/avatar-6.jpg", department: "Marketing", openIssues: 5, pendingRequests: 0, status: "on-leave" },
  { id: "4", empCode: "EMP-004", name: "Samantha Shelton", avatar: "/images/avatar/avatar-11.jpg", department: "HR", openIssues: 1, pendingRequests: 2, status: "active" },
  { id: "5", empCode: "EMP-005", name: "Derrick Simmons", avatar: "/images/avatar/avatar-19.jpg", department: "Engineering", openIssues: 0, pendingRequests: 0, status: "active" },
  { id: "6", empCode: "EMP-006", name: "Katrina West", avatar: "/images/avatar/avatar-7.jpg", department: "Finance", openIssues: 3, pendingRequests: 1, status: "active" },
];