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
  roleCategoryId?: string;
  roleCategoryName?: string;
  roleId?: string;
    branchId?: string;
  roleName?: string;
  employeeCode: string;
  employeeName: string;
  profilePhoto: string;
  officialEmail: string;
  mobileNumber: string;
  mobileCountryCode: string;
  alternateContact: string;
  alternateCountryCode: string;
  employeeTypeId: string;
  employeeTypeName: string;
  designationId: string;
  designationName: string;
  dateOfJoining: string;
  employmentStatus: "Active" | "Inactive";
  employmentEndDate: string;
  remarks: string;
  additionalDepartments: string[];
  roleDataScope: string;
  passwordResetRequired: boolean;
  createdBy: string;
  createdAt: string;
}
