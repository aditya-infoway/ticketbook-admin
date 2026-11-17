// src/app/pages/branch-master/employee/shared/types.ts
export interface Employee {
  id: string;
  employeeNo?: string;
  employeeCode: string;
  employeeName: string;
  profilePhoto: string;
  officialEmail: string;
  mobileCountryCode: string;
  mobileNumber: string;
  alternateCountryCode: string;
  alternateContact: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  address?: string;
  pinCode?: string;

  employmentStatus: "Active" | "Inactive";
  remarks: string;

  // Lookup fields
  roleId?: string;
  roleName?: string;

  branchId?: string;
  additionalDepartments: string[];

  // Meta
  additionalDepartmentNames?: string[];
  passwordResetRequired?: boolean;
  createdBy?: string;
  createdAt?: string;
}
