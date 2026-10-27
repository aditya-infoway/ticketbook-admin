// Role Category
// Code | Name | Description | Display Order | Status | Created Date
export interface RoleCategory {
  id: string; // internal UUID (UI me show nahi hota, sirf backend ke liye)
  roleCategoryCode: string;
  roleCategoryName: string;
  description: string;
  displayOrder: string; // input ke liye string, save pe number
  status: string; // "Active" | "Inactive"
  createdAt: string; // system
}

export const emptyRoleCategory = (): RoleCategory => ({
  id: "",
  roleCategoryCode: "",
  roleCategoryName: "",
  description: "",
  displayOrder: "",
  status: "Active",
  createdAt: "",
});

// ---- Backend response ko frontend shape me map karo ----
// TODO: backend ke response field names se match kar lena.
export function mapApiRoleCategory(api: any): RoleCategory {
  return {
    id: String(api.roleCategoryId ?? api.id ?? ""),
    roleCategoryCode: api.roleCategoryCode ?? "",
    roleCategoryName: api.roleCategoryName ?? "",
    description: api.description ?? "",
    displayOrder:
      api.displayOrder === null || api.displayOrder === undefined
        ? ""
        : String(api.displayOrder),
    status: api.status ?? "Active",
    createdAt: api.createdAt ?? api.created ?? "",
  };
}

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
};