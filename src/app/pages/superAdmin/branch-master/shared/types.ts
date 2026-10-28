export interface Branch {
  id: string;
  branchNo?: string;
  regionId?: number | string | null;
  branchCode: string;
  branchName: string;
  region: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  fullAddress: string;
  pinCode: string;
  contactNumber: number;
  phoneNumber: number;
  branchEmail: string;
   branchManager: string;
  areaManager: string;
  branchManagerId?: number | null;
  areaManagerId?: number | null;
  openingDate: string;
  workingHours: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}
