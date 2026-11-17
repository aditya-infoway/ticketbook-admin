// Role
// Code | Name | Category | Data Scope | Dept Restriction | Departments | Status | Created
export interface Role {
  id: string; // internal UUID (UI me show nahi hota)
  roleNo?: string;
  roleName: string;
  status: string; // "Active" | "Inactive"
  createdAt: string; // system
}

export const emptyRole = (): Role => ({
  id: "",
  roleNo: "",
  roleName: "",
  status: "Active",
  createdAt: "",
});

// TODO: backend ke response field names se match kar lena.
export function mapApiRole(api: any): Role {
  return {
    id: String(api.roleId ?? api.id ?? ""),
    roleNo: api.roleNo || "",
    roleName: api.roleName ?? "",
    status: api.status ?? "Active",
    createdAt: api.createdAt ?? api.created ?? "",
  };
}

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
};
