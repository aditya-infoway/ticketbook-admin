export interface Region {
  id: string;
  regionNo?: string;
  regionName: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}
