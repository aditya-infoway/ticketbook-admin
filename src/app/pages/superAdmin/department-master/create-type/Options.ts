export interface OptionItem {
  id: string;
  label: string;
}

// Status (Active / Inactive)
export const typeStatusOptions: OptionItem[] = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];