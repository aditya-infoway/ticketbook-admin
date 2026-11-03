import { useEffect, useState } from "react";
import { EnvelopeIcon, PhoneIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { HiPencil } from "react-icons/hi";

import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload } from "@/components/ui";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

const EMPTY = {
  branchManagerNo: "", name: "", email: "",
  mobileNumber: "", alternateMobile: "",
  gender: "", address: "", city: "", state: "", pinCode: "",
  areaName: "", branchName: "", reportingToName: "", joiningDate: "",
  currentPassword: "", newPassword: "", confirmPassword: "",
};

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
      const res: any = await Get("branch-manager/profile", {}, false);
      if (res?.data?.success) {
        const d = res.data.data;
        setForm({ ...EMPTY, ...d, currentPassword: "", newPassword: "", confirmPassword: "" });
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
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobileNumber))
      next.mobileNumber = "Invalid 10-digit number";
    if (form.alternateMobile && !/^[6-9]\d{9}$/.test(form.alternateMobile))
      next.alternateMobile = "Invalid 10-digit number";
    if (form.newPassword) {
      if (!form.currentPassword) next.currentPassword = "Enter current password";
      if (form.newPassword.length < 6) next.newPassword = "At least 6 characters";
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
      const fd = new FormData();
      [
        "name", "mobileNumber", "alternateMobile",
        "currentPassword", "newPassword", "confirmPassword",
      ].forEach((k) => fd.append(k, (form as any)[k] ?? ""));
      if (photo) fd.append("profilePhoto", photo);

      const res: any = await Post("branch-manager/profile/update", fd, true);
      if (res?.data?.success) {
        toastsuccessmsg(res.data.message || "Profile updated successfully.");
        setPhoto(null);
        await load();
      } else {
        toasterrormsg(res?.data?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <p className="dark:text-dark-200 text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const readOnly = "bg-gray-50 text-gray-500 dark:bg-dark-800";

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">General</h5>
      <p className="dark:text-dark-200 mt-0.5 text-sm text-gray-500">Update your profile.</p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <form onSubmit={onSubmit} autoComplete="off">
        {/* Photo */}
        <div className="flex flex-col space-y-1.5">
          <span className="dark:text-dark-100 text-base font-medium text-gray-800">Profile Photo</span>
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
                  <Button type="button" onClick={() => setPhoto(null)} isIcon className="size-6 rounded-full">
                    <XMarkIcon className="size-4" />
                  </Button>
                ) : (
                  <Upload name="profilePhoto" onChange={(files) => setPhoto(files[0])} accept="image/*">
                    {({ ...props }) => (
                      <Button type="button" isIcon className="size-6 rounded-full" {...props}>
                        <HiPencil className="size-3.5" />
                      </Button>
                    )}
                  </Upload>
                )}
              </div>
            }
          />
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Personal */}
        <p className="dark:text-dark-100 text-base font-medium text-gray-800">Personal Details</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
          <Input
            label="Name"
            placeholder="Enter your name"
            className="rounded-xl"
            value={form.name}
            onChange={(e: any) => sf("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label="Email"
            className={`rounded-xl ${readOnly}`}
            prefix={<EnvelopeIcon className="size-4.5" />}
            value={form.email}
            readOnly
            disabled
          />
          <Input
            type="tel"
            label="Mobile"
            placeholder="Mobile number"
            className="rounded-xl"
            maxLength={10}
            prefix={<PhoneIcon className="size-4.5" />}
            value={form.mobileNumber}
            onChange={(e: any) => sf("mobileNumber", e.target.value)}
            error={errors.mobileNumber}
          />
          <Input
            type="tel"
            label="Alternate Mobile"
            placeholder="Alternate number"
            className="rounded-xl"
            maxLength={10}
            prefix={<PhoneIcon className="size-4.5" />}
            value={form.alternateMobile}
            onChange={(e: any) => sf("alternateMobile", e.target.value)}
            error={errors.alternateMobile}
          />
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Work (read only) */}
        <p className="dark:text-dark-100 text-base font-medium text-gray-800">Work Details</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Branch Manager ID" className={`rounded-xl ${readOnly}`} value={form.branchManagerNo} readOnly disabled />
          <Input label="Area" className={`rounded-xl ${readOnly}`} value={form.areaName} readOnly disabled />
          <Input label="Branch" className={`rounded-xl ${readOnly}`} value={form.branchName} readOnly disabled />
          <Input label="Reporting To (Area Manager)" className={`rounded-xl ${readOnly}`} value={form.reportingToName} readOnly disabled />
          <Input label="Date of Joining" className={`rounded-xl ${readOnly}`} value={form.joiningDate} readOnly disabled />
          <Input label="Gender" className={`rounded-xl ${readOnly}`} value={form.gender} readOnly disabled />
          <Input label="State" className={`rounded-xl ${readOnly}`} value={form.state} readOnly disabled />
          <Input label="City" className={`rounded-xl ${readOnly}`} value={form.city} readOnly disabled />
          <Input label="PIN Code" className={`rounded-xl ${readOnly}`} value={form.pinCode} readOnly disabled />
          <Input label="Address" className={`rounded-xl ${readOnly}`} value={form.address} readOnly disabled />
        </div>

        <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

        {/* Password */}
        <p className="dark:text-dark-100 text-base font-medium text-gray-800">Change Password</p>
        <p className="dark:text-dark-200 mt-0.5 text-xs text-gray-500">Password nahi badalna to khali chhod do.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
          <Input type="password" autoComplete="new-password" label="Current Password"
            placeholder="Enter current password" className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.currentPassword}
            onChange={(e: any) => sf("currentPassword", e.target.value)}
            error={errors.currentPassword} />
          <div className="hidden sm:block" />
          <Input type="password" autoComplete="new-password" label="New Password"
            placeholder="Enter new password" className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.newPassword}
            onChange={(e: any) => sf("newPassword", e.target.value)}
            error={errors.newPassword} />
          <Input type="password" autoComplete="new-password" label="Confirm Password"
            placeholder="Re-enter new password" className="rounded-xl"
            prefix={<LockClosedIcon className="size-4.5" />}
            value={form.confirmPassword}
            onChange={(e: any) => sf("confirmPassword", e.target.value)}
            error={errors.confirmPassword} />
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button type="button" className="min-w-28" disabled={loading} onClick={load}>
            Reset
          </Button>
          <Button type="submit" className="min-w-28" color="primary" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}