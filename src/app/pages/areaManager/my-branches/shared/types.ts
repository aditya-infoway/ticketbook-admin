export interface Branch {
  id: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  region: string;
  country: string;
  state: string;
  city: string;
  contactNumber: string;
  phoneNumber?: string;
  email: string;
  branchManager: string;
  areaManager: string;
  openingDate: string;
  workingHours: string;
  status: "Active" | "Inactive";
  postalCode?: string;
  fullAddress: string;
  profilePhoto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchFormData {
  regions?: { id: string; label: string }[];
  cities?: { id: string; label: string }[];
  statuses?: { id: string; label: string }[];
}