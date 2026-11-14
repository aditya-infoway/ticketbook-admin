// Inside shared/types.ts

export type AreaManager = {
  id: string;
  areaManagerId?: number;
  areaManagerNo?: string;
  name: string;
  mobileNumber: string;
  email: string;
  areaId?: string;
  areaName?: string;
  description?: string;
  status: string;
  profilePhoto?: string | null;
  profilePhotoUrl?: string;
  gender?: string;
  alternateMobile?: string;
  address?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pinCode?: string;
  joiningDate?: string;
};
