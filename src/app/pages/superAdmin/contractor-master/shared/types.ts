export interface ContractorDepartment {
  id: string;
  departmentNo?: string;
  departmentCode: string;
  departmentName: string;
  description: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}



export interface Contractor {
  id: string;
  contractorNo: string;
  contractorName: string;
  companyName?: string;
  mobileNumber: string;
  email?: string;
  specialization?: string;
  address?: string;
  areaId: string;
  areaName?: string;
  branchId: string;
  branchName?: string;
  contractorDepartmentId?: string;
departmentName?: string;
  registrationDate: string;
  status: "Active" | "Inactive";
  documents?: string[]; 
}