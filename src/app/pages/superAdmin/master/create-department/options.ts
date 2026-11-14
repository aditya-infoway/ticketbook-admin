export interface OptionItem {
  id: string;
  label: string;
}

// Department Scope (dropdown, required)
export const departmentScopeOptions: OptionItem[] = [
  { id: "Global", label: "Global (All Branches)" },
  { id: "Region", label: "Region" },
  { id: "Branch", label: "Branch" },
];

// Department Status (Active / Inactive, required)
export const departmentStatusOptions: OptionItem[] = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

export function getScopeLabel(scope: string): string {
  return departmentScopeOptions.find((i) => i.id === scope)?.label || "—";
}