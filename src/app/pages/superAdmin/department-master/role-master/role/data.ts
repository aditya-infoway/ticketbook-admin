// Role
// Code | Name | Category | Data Scope | Dept Restriction | Departments | Status | Created
export interface Role {
  id: string; // internal UUID (UI me show nahi hota)
  roleCode: string;
  roleName: string;
  roleCategoryId: string;
  roleCategoryName: string; // list display ke liye
  description: string;
  defaultDataScope: string; // own | team | department | region | branch | all
  departmentRestriction: string; // "all" | "selected"
  departmentIds: string[];
  departmentNames: string[]; // list display ke liye
  status: string; // "Active" | "Inactive"
  createdAt: string; // system
}

export const emptyRole = (): Role => ({
  id: "",
  roleCode: "",
  roleName: "",
  roleCategoryId: "",
  roleCategoryName: "",
  description: "",
  defaultDataScope: "",
  departmentRestriction: "all",
  departmentIds: [],
  departmentNames: [],
  status: "Active",
  createdAt: "",
});

// TODO: backend ke response field names se match kar lena.
export function mapApiRole(api: any): Role {
  return {
    id: String(api.roleId ?? api.id ?? ""),
    roleCode: api.roleCode ?? "",
    roleName: api.roleName ?? "",
    roleCategoryId: String(api.roleCategoryId ?? ""),
    roleCategoryName: api.roleCategoryName ?? "",
    description: api.description ?? "",
    defaultDataScope: api.defaultDataScope ?? "",
    departmentRestriction: api.departmentRestriction ?? "all",
    departmentIds: (api.departmentIds ?? []).map((d: any) => String(d)),
    departmentNames: api.departmentNames ?? [],
    status: api.status ?? "Active",
    createdAt: api.createdAt ?? api.created ?? "",
  };
}

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
};