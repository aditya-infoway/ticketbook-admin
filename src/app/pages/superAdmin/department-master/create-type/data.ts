// Department Type
// Type Code | Type Name | Description | Display Order | Status | Created Date
export interface DepartmentType {
  id: string; // internal database id
  typeCode: string; // unique identifier
  typeName: string;
  description: string;
  displayOrder: string; // kept as string for the input, converted on save
  status: string; // "Active" | "Inactive"
  createdAt: string; // system
}

export const emptyDepartmentType = (): DepartmentType => ({
  id: "",
  typeCode: "",
  typeName: "",
  description: "",
  displayOrder: "",
  status: "Active",
  createdAt: "",
});

// ---- Map backend response to frontend DepartmentType shape ----
// TODO: match these field names with your backend response.
export function mapApiTypeToDepartmentType(api: any): DepartmentType {
  return {
    id: String(api.departmentTypeId ?? api.id ?? ""),
    typeCode: api.typeCode ?? "",
    typeName: api.typeName ?? "",
    description: api.description ?? "",
    displayOrder:
      api.displayOrder === null || api.displayOrder === undefined
        ? ""
        : String(api.displayOrder),
    status: api.status ?? "Active",
    createdAt: api.created ?? api.createdAt ?? "",
  };
}

export const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
};