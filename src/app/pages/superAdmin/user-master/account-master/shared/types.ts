export interface Account {
  id: string;
  accountName: string;
  printName: string;
  groupId: string;
  groupName?: string; // Used for display in table
  openingBalance: number;
  balanceType: "DR" | "CR";
  country: string;
  state: string;
  stateCode: string;
  district: string;
  taluka: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  phone: string;
  mobile: string;
  email: string;
  contactPerson: string;
  birthdayOn: string;
  anniversary: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  gstNo: string;
  panCard: string;
  aadharCardNo: string;
  createdAt?: string;
}

export const emptyAccount = (): Account => ({
  id: "",
  accountName: "",
  printName: "",
  groupId: "",
  groupName: "",
  openingBalance: 0,
  balanceType: "DR",
  country: "India",
  state: "",
  stateCode: "",
  district: "",
  taluka: "",
  city: "",
  area: "",
  addressLine1: "",
  addressLine2: "",
  pinCode: "",
  phone: "",
  mobile: "",
  email: "",
  contactPerson: "",
  birthdayOn: "",
  anniversary: "",
  bankAccountNo: "",
  bankName: "",
  ifscCode: "",
  branch: "",
  gstNo: "",
  panCard: "",
  aadharCardNo: "",
});