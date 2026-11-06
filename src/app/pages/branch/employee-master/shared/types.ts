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
  employeeTypeId: string;
  employeeTypeName: string;
  designationId: string;
  designationName: string;
  dateOfJoining: string;
  employmentStatus: "Active" | "Inactive";
  employmentEndDate: string;
  remarks: string;
  
  // Lookup fields
  roleCategoryId?: string;
  roleCategoryName?: string;
  roleId?: string;
  roleName?: string;
  
  branchId?: string;
  additionalDepartments: string[];
  
  // Meta
  roleDataScope?: string;
  passwordResetRequired?: boolean;
  createdBy?: string;
  createdAt?: string;
}