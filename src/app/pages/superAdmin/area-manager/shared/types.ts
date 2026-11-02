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
  city?: string;
  state?: string;
  pinCode?: string;
  joiningDate?: string;
};
