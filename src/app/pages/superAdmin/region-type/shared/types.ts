export interface RegionType {
  id: string;
  typeCode: string;
  typeName: string;
  description: string;
  displayOrder: number;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}