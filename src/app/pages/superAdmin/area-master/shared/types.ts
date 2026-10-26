export interface Region {
  id: string;
  regionCode: string;
  regionName: string;
  regionTypeId: string;
  regionTypeName: string; // For table display
  description: string;
  country: string;
  state: string;
  city: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}