export interface EmployeeType {
  id: string;
  employeeTypeNo?: string;
  typeCode: string;
  typeName: string;
  description: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeNo?: string;
  roleId?: string;
  branchId?: string;
  roleName?: string;
  branchName?: string;
  employeeCode: string;
  employeeName: string;
  profilePhoto: string;
  officialEmail: string;
  mobileNumber: string;
  mobileCountryCode: string;
  alternateContact: string;
  alternateCountryCode: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  address?: string;
  pinCode?: string;
  employmentStatus: "Active" | "Inactive";
  remarks: string;
  additionalDepartments: string[];
  additionalDepartmentNames?: string[];
  passwordResetRequired: boolean;
  createdBy: string;
  createdAt: string;
}
