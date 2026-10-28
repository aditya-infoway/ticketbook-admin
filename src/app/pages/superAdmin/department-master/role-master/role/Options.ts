export const roleStatusOptions = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

// Kitna data dikhega
export const dataScopeOptions = [
  { id: "own", label: "Own" },
  { id: "team", label: "Team" },
  { id: "department", label: "Department" },
  { id: "region", label: "Region" },
  { id: "branch", label: "Branch" },
  { id: "all", label: "All" },
];

// Kaun se departments ka data
export const departmentRestrictionOptions = [
  { id: "all", label: "All Departments" },
  { id: "selected", label: "Selected Departments" },
];

export const getScopeLabel = (id: string) =>
  dataScopeOptions.find((o) => o.id === id)?.label ?? id ?? "—";

export const getRestrictionLabel = (id: string) =>
  departmentRestrictionOptions.find((o) => o.id === id)?.label ?? id ?? "—";