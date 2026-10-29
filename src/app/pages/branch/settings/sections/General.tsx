import { useEffect, useState } from "react";
import {
  PhoneIcon,
  LockClosedIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { HiPencil } from "react-icons/hi";

import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload } from "@/components/ui";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
// NOTE: apne project me jahan useBranchProfile.ts rakhi hai, wahi ka path do

const EMPTY = {
  branchNo: "",
  branchCode: "",
  branchName: "",
  branchEmail: "",
  region: "",
  country: "",
  state: "",
  city: "",
  branchManager: "",
  areaManager: "",
  openingDate: "",
  workingHours: "",
  contactNumber: "",
  phoneNumber: "",
  fullAddress: "",
  pinCode: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
 const Divider = () => (
    <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
  );
  const Title = ({ children }: { children: React.ReactNode }) => (
    <p className="dark:text-dark-100 text-base font-medium text-gray-800">
      {children}
    </p>
  );
export default function General() {
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sf = (k: keyof typeof EMPTY, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const load = async () => {
    try {
      const res: any = await Get("branch/profile", {}, false);
      if (res?.data?.success) {
        const d = res.data.data;
        setForm({
          ...EMPTY,
          ...d,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setExistingPhoto(d.profilePhoto || "");
      } else {
        toasterrormsg(res?.data?.message || "Failed to fetch profile.");
      }
    } catch {
      toasterrormsg("Something went wrong while fetching profile.");
    } finally {
      setFetching(false);
    }
  };

 
 useEffect(() => {
  const timer = setTimeout(() => {
    void load();
  }, 0);

  return () => clearTimeout(timer);
}, []);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!/^[0-9]{10}$/.test(form.contactNumber))
      next.contactNumber = "Must be 10 digits";
    if (!form.fullAddress.trim()) next.fullAddress = "Full address is required";
    if (form.newPassword) {
      if (!form.currentPassword)
        next.currentPassword = "Enter current password";
      if (form.newPassword.length < 6)
        next.newPassword = "At least 6 characters";
      if (form.newPassword !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // multipart: text fields + photo
      const fd = new FormData();
      fd.append("contactNumber", form.contactNumber.trim());
      fd.append("phoneNumber", form.phoneNumber.trim());
      fd.append("fullAddress", form.fullAddress.trim());
      fd.append("pinCode", form.pinCode.trim());
      fd.append("currentPassword", form.currentPassword);
      fd.append("newPassword", form.newPassword);
      fd.append("confirmPassword", form.confirmPassword);
      if (photo) fd.append("profilePhoto", photo);

      const res: any = await Post("branch/profile/update", fd, true);
      // 2. onSubmit ka success block aisa ho jayega
      if (res?.data?.success) {
        toastsuccessmsg(res.data.message || "Profile updated successfully.");
        setPhoto(null);
        await load();
      } else {
        toasterrormsg(res?.data?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message ||
          "Something went wrong while updating profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset: form + chuni hui photo dono wapas server wali state par
  const onReset = async () => {
    setPhoto(null);
    await load();
  };

  if (fetching) {
    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <p className="dark:text-dark-200 text-sm text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  const ro = "rounded-xl bg-gray-50 text-gray-500 dark:bg-dark-800";
 

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
        General
      </h5>
      <p className="dark:text-dark-200 mt-0.5 text-sm text-gray-500">
        Update your branch profile.
      </p>
      <Divider />

      <form onSubmit={onSubmit} autoComplete="off">
        {/* Photo */}
        <div className="flex flex-col space-y-1.5">
          <Title>Profile Photo</Title>
          <Avatar
            size={20}
            imgComponent={PreviewImg}
            imgProps={{ file: photo } as any}
            src={existingPhoto || "/images/logos/company-placeholder.svg"}
            classNames={{
              root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
              display: "rounded-xl",
            }}
            indicator={
              <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                {photo ? (
                  <Button
                    type="button"
                    onClick={() => setPhoto(null)}
                    isIcon
                    className="size-6 rounded-full"
                  >
                    <XMarkIcon className="size-4" />
                  </Button>
                ) : (
                  <Upload
                    name="profilePhoto"
                    onChange={(files) => setPhoto(files[0])}
                    accept="image/*"
                  >
                    {({ ...props }) => (
                      <Button
                        type="button"
                        isIcon
                        className="size-6 rounded-full"
                        {...props}
                      >
                        <HiPencil className="size-3.5" />
                      </Button>
                    )}
                  </Upload>
                )}
              </div>
            }
          />
        </div>

        <Divider />

        {/* Branch details (read only) */}
        <Title>Branch Details</Title>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Branch ID"
            className={ro}
            value={form.branchNo}
            readOnly
            disabled
          />
          <Input
            label="Branch Code"
            className={ro}
            value={form.branchCode}
            readOnly
            disabled
          />
          <Input
            label="Branch Name"
            className={ro}
            value={form.branchName}
            readOnly
            disabled
          />
          <Input
            label="Branch Email (login id)"
            className={ro}
            value={form.branchEmail}
            prefix={<EnvelopeIcon className="size-4.5" />}
            readOnly
            disabled
          />
          <Input
            label="Region / Area"
            className={ro}
            value={form.region}
            readOnly
            disabled
          />
          <Input
            label="Working Hours"
            className={ro}
            value={form.workingHours}
            readOnly
            disabled
          />
          <Input
            label="Branch Manager"
            className={ro}
            value={form.branchManager}
            readOnly
            disabled
          />
          <Input
            label="Area Manager"
            className={ro}
            value={form.areaManager}
            readOnly
            disabled
          />
          <Input
            label="Opening Date"
            className={ro}
            value={form.openingDate}
            readOnly
            disabled
          />
        </div>

        <Divider />

        {/* Contact & address (editable) */}
        <Title>Contact & Address</Title>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
          <Input
            label="Contact Number"
            placeholder="10 digit number"
            className="rounded-xl"
            prefix={<PhoneIcon className="size-4.5" />}
            value={form.contactNumber}
            onChange={(e: any) => sf("contactNumber", e.target.value)}
            error={errors.contactNumber}
          />
          <Input
            label="Phone Number"
            placeholder="Phone number"
            className="rounded-xl"
            prefix={<PhoneIcon className="size-4.5" />}
            value={form.phoneNumber}
            onChange={(e: any) => sf("phoneNumber", e.target.value)}
          />
          <Input
            label="Full Address"
            placeholder="Enter full address"
            className="rounded-xl sm:col-span-2"
            value={form.fullAddress}
            onChange={(e: any) => sf("fullAddress", e.target.value)}
            error={errors.fullAddress}
          />
          <Input
            label="Postal / PIN Code"
            placeholder="PIN code"
            className="rounded-xl"
            value={form.pinCode}
            onChange={(e: any) => sf("pinCode", e.target.value)}
          />
          <Input
            label="City"
            className={ro}
            value={form.city}
            readOnly
            disabled
          />
          <Input
            label="State"
            className={ro}
            value={form.state}
            readOnly
            disabled
          />
          <Input
            label="Country"
            className={ro}
            value={form.country}
            readOnly
            disabled
          />
        </div>

        <Divider />

        {/* Password */}
        <Title>Change Password</Title>
        <p className="dark:text-dark-200 mt-0.5 text-xs text-gray-500">
          Password nahi badalna to khali chhod do.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
          <Input
            type="password"
            autoComplete="new-password"
            label="Current Password"
            placeholder="Enter current password"
            className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.currentPassword}
            onChange={(e: any) => sf("currentPassword", e.target.value)}
            error={errors.currentPassword}
          />
          <div className="hidden sm:block" />
          <Input
            type="password"
            autoComplete="new-password"
            label="New Password"
            placeholder="Enter new password"
            className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.newPassword}
            onChange={(e: any) => sf("newPassword", e.target.value)}
            error={errors.newPassword}
          />
          <Input
            type="password"
            autoComplete="new-password"
            label="Confirm Password"
            placeholder="Re-enter new password"
            className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.confirmPassword}
            onChange={(e: any) => sf("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button
            type="button"
            className="min-w-28"
            disabled={loading}
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="min-w-28"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
