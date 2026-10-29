import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { HiPencil } from "react-icons/hi";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";
import { Get, Post, Put } from "@/ApiHelper";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Button, Input, Upload, Avatar, Textarea } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import type { Branch } from "../shared/types";

interface BranchDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editBranch: Branch | null;
}

interface Opt {
  id: string;
  label: string;
}

const workingHoursOptions = [
  { id: "9-6", label: "9:00 AM - 6:00 PM" },
  { id: "10-7", label: "10:00 AM - 7:00 PM" },
  { id: "8-5", label: "8:00 AM - 5:00 PM" },
  { id: "24h", label: "24 Hours" },
];

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

// Helper to create initial form (called only on mount)
function getInitialForm(editBranch: Branch | null) {
  if (editBranch) {
    const countryOptions = Country.getAllCountries().map((c) => ({
      id: c.isoCode,
      label: c.name,
    }));

    const country =
      countryOptions.find((o) => o.label === editBranch.country) || null;

    let state: Opt | null = null;
    let city: Opt | null = null;

    if (country) {
      const states = State.getStatesOfCountry(country.id).map((s) => ({
        id: s.isoCode,
        label: s.name,
      }));
      state = states.find((o) => o.label === editBranch.state) || null;

      if (state) {
        const cities = City.getCitiesOfState(country.id, state.id).map((c) => ({
          id: c.name,
          label: c.name,
        }));
        city = cities.find((o) => o.label === editBranch.city) || null;
      }
    }

    return {
      branchId: editBranch.id,
      branchCode: editBranch.branchCode,
      branchName: editBranch.branchName,
      // Branch type me profilePhoto add hone tak any se read kar rahe hain
      profilePhoto: ((editBranch as any).profilePhoto as string) || "",
      regionId: editBranch.regionId ? String(editBranch.regionId) : "",
      country,
      state,
      city,
      fullAddress: editBranch.fullAddress,
      pinCode: editBranch.pinCode,
      contactNumber: String(editBranch.contactNumber || ""),
      phoneNumber: String(editBranch.phoneNumber || ""),
      branchEmail: editBranch.branchEmail,
      branchManager: editBranch.branchManagerId
        ? String(editBranch.branchManagerId)
        : "",
      areaManager: editBranch.areaManagerId
        ? String(editBranch.areaManagerId)
        : "",
      openingDate: editBranch.openingDate,
      workingHours: editBranch.workingHours,
      status: editBranch.status,
      password: "",
      confirmPassword: "",
    };
  }

  // New branch (Branch ID preview comes from the backend)
  return {
    branchId: "",
    branchCode: "",
    branchName: "",
    profilePhoto: "",
    regionId: "",
    country: { id: "IN", label: "India" } as Opt,
    state: null as Opt | null,
    city: null as Opt | null,
    fullAddress: "",
    pinCode: "",
    contactNumber: "",
    phoneNumber: "",
    branchEmail: "",
    branchManager: "",
    areaManager: "",
    openingDate: "",
    workingHours: "",
    status: "Active",
    password: "",
    confirmPassword: "",
  };
}

export function BranchDataDrawer({
  isOpen,
  close,
  onSaved,
  editBranch,
}: BranchDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editBranch));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Nayi chuni hui photo (save par backend ko jati hai)
  const [photo, setPhoto] = useState<File | null>(null);

  const [regionOptions, setRegionOptions] = useState<Opt[]>([]);
  const [nextNo, setNextNo] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res: any = await Get("superadmin/employee/list", {}, false);
        setEmployees(res?.data?.data ?? []);
      } catch {
        toast.error("Failed to load employees");
      }
    })();
  }, [isOpen]);

  const toOptions = (list: any[], roleName: string): Opt[] =>
    list
      .filter(
        (e) =>
          e.employmentStatus === "Active" &&
          e.roleName?.trim().toLowerCase() === roleName.toLowerCase(),
      )
      .map((e) => ({ id: String(e.employeeId), label: e.employeeName }));

  const branchManagers = useMemo(
    () => toOptions(employees, "Branch Manager"),
    [employees],
  );
  const areaManagers = useMemo(
    () => toOptions(employees, "Area Manager"),
    [employees],
  );

  // Region / Area dropdown from DB
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res: any = await Get("superadmin/region/list", {}, false);
        const rows: any[] = res?.data?.data ?? [];
        setRegionOptions(
          rows
            .filter(
              (r) =>
                r.status === "Active" || String(r.regionId) === form.regionId,
            )
            .map((r) => ({ id: String(r.regionId), label: r.regionName })),
        );
      } catch (error) {
        console.error("Region list error:", error);
      }
    })();
  }, [isOpen]);

  // Branch ID preview (prefix + FY), new branches only
  useEffect(() => {
    if (!isOpen || editBranch) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/branch/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.branchNo);
      } catch (error) {
        console.error("Branch number error:", error);
      }
    })();
  }, [isOpen, editBranch]);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        id: c.isoCode,
        label: c.name,
      })),
    [],
  );

  const stateOptions = useMemo(
    () =>
      form.country
        ? State.getStatesOfCountry(form.country.id).map((s) => ({
            id: s.isoCode,
            label: s.name,
          }))
        : [],
    [form.country],
  );

  const cityOptions = useMemo(
    () =>
      form.country && form.state
        ? City.getCitiesOfState(form.country.id, form.state.id).map((c) => ({
            id: c.name,
            label: c.name,
          }))
        : [],
    [form.country, form.state],
  );

  const handleClose = () => {
    close();
  };

  const validate = () => {
    const next: Record<string, string> = {};

    const branchCode = String(form.branchCode ?? "").trim();
    const branchName = String(form.branchName ?? "").trim();
    const fullAddress = String(form.fullAddress ?? "").trim();
    const contactNumber = String(form.contactNumber ?? "").trim();

    if (!branchCode) next.branchCode = "Branch code is required";
    if (!branchName) next.branchName = "Branch name is required";
    const email = String(form.branchEmail ?? "").trim();
    if (!email) next.branchEmail = "Branch email is required (used to log in)";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.branchEmail = "Enter a valid email";

    // password required on create; on edit only if a new one is typed
    if (!editBranch || form.password) {
      if (!form.password) next.password = "Password is required";
      else if (form.password.length < 6)
        next.password = "Password must be at least 6 characters";
      if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match";
    }
    if (!form.country) next.country = "Country is required";
    if (!form.state) next.state = "State is required";
    if (!form.city) next.city = "City is required";
    if (!fullAddress) next.fullAddress = "Full address is required";
    if (!contactNumber) next.contactNumber = "Contact number is required";
    else if (!/^[0-9]{10}$/.test(contactNumber))
      next.contactNumber = "Must be 10 digits";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        branchCode: form.branchCode.trim(),
        branchName: form.branchName.trim(),
        regionId: form.regionId ? Number(form.regionId) : null,
        country: form.country?.label || "",
        state: form.state?.label || "",
        city: form.city?.label || "",
        fullAddress: String(form.fullAddress).trim(),
        pinCode: String(form.pinCode || "").trim(),
        contactNumber: String(form.contactNumber).trim(),
        phoneNumber: String(form.phoneNumber || "").trim(),
        branchEmail: form.branchEmail.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        branchManagerId: form.branchManager ? Number(form.branchManager) : null,
        areaManagerId: form.areaManager ? Number(form.areaManager) : null,
        openingDate: form.openingDate || "",
        workingHours: form.workingHours || "",
        status: form.status,
      };

      // multipart: sab fields FormData me, photo alag se
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        fd.append(k, String(v));
      });
      if (photo) fd.append("profilePhoto", photo);

      let res: any;
      if (editBranch) {
        fd.append("branchId", String(editBranch.id));
        res = await Put("superadmin/branch/update", fd, true);
      } else {
        fd.append(
          "financialYearId",
          localStorage.getItem("financialYearId") || "",
        );
        res = await Post("superadmin/branch/create", fd, true);
      }

      // Backend business errors bhi HTTP 200 me aate hain, isliye success check
      if (res?.data?.success) {
        toast.success(
          res.data.message ||
            (editBranch
              ? "Branch updated successfully"
              : "Branch added successfully"),
        );
        onSaved();
        handleClose();
      } else {
        toast.error(res?.data?.message || "Failed to save the branch.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong while saving the branch.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const req = (text: string) => (
    <>
      {text}
      <span className="ml-0.5 text-red-500">*</span>
    </>
  );
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={handleClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[50%]"
        >
          {/* Header */}
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">
              {editBranch ? "Edit Branch" : "Add Branch"}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Profile Photo (Employee jaisa) */}
            <div className="mb-6 flex flex-col space-y-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Photo
              </span>
              <Avatar
                size={20}
                imgComponent={PreviewImg}
                imgProps={{ file: photo } as any}
                src={
                  form.profilePhoto || "/images/logos/company-placeholder.svg"
                }
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Branch ID */}
              {/* Branch ID */}
              <Input
                label="Branch ID"
                value={editBranch?.branchNo || nextNo || "Generating..."}
                readOnly
                disabled
              />

              {/* Branch Code */}
              <Input
                label={req("Branch Code")}
                placeholder="Enter code"
                value={form.branchCode}
                onChange={(e: any) => sf("branchCode", e.target.value)}
                error={errors.branchCode}
              />

              {/* Branch Name */}
              <Input
                label={req("Branch Name")}
                placeholder="Enter branch name"
                value={form.branchName}
                onChange={(e: any) => sf("branchName", e.target.value)}
                error={errors.branchName}
              />

              {/* Region */}
              <Listbox
                label="Region / Area"
                data={regionOptions}
                value={
                  regionOptions.find((r) => r.id === form.regionId) || null
                }
                onChange={(r: any) => sf("regionId", r?.id || "")}
                displayField="label"
                placeholder="Select region"
              />

              {/* Country */}
              <Combobox
                label={req("Country")}
                data={countryOptions}
                displayField="label"
                value={form.country}
                onChange={(v: any) => {
                  setForm((f) => ({
                    ...f,
                    country: v || null,
                    state: null,
                    city: null,
                  }));
                  if (errors.country) setErrors((p) => ({ ...p, country: "" }));
                }}
                placeholder="Search country..."
                searchFields={["label"]}
                error={errors.country}
              />

              {/* State */}
              <Combobox
                label={req("State")}
                data={stateOptions}
                displayField="label"
                value={form.state}
                onChange={(v: any) => {
                  setForm((f) => ({ ...f, state: v || null, city: null }));
                  if (errors.state) setErrors((p) => ({ ...p, state: "" }));
                }}
                placeholder="Search state..."
                searchFields={["label"]}
                error={errors.state}
              />

              {/* City */}
              <Combobox
                label={req("City")}
                data={cityOptions}
                displayField="label"
                value={form.city}
                onChange={(v: any) => {
                  sf("city", v || null);
                  if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                }}
                placeholder="Search city..."
                searchFields={["label"]}
                error={errors.city}
              />

              {/* Pin Code */}
              <Input
                label="Postal / PIN Code"
                placeholder="Enter PIN code"
                value={form.pinCode}
                onChange={(e: any) => sf("pinCode", e.target.value)}
              />

              {/* Contact */}
              <Input
                label={req("Contact Number")}
                placeholder="Enter contact number"
                value={form.contactNumber}
                onChange={(e: any) => sf("contactNumber", e.target.value)}
                error={errors.contactNumber}
              />

              {/* Phone */}
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                value={form.phoneNumber}
                onChange={(e: any) => sf("phoneNumber", e.target.value)}
              />

              {/* Email */}
              <Input
                label={req("Branch Email")}
                placeholder="Enter email"
                type="email"
                value={form.branchEmail}
                onChange={(e: any) => sf("branchEmail", e.target.value)}
                error={errors.branchEmail}
              />

              {/* Password */}
              <Input
                label={editBranch ? "Password" : req("Password")}
                type="password"
                autoComplete="new-password"
                placeholder={
                  editBranch ? "Leave blank to keep current" : "Enter password"
                }
                value={form.password}
                onChange={(e: any) => sf("password", e.target.value)}
                error={errors.password}
              />

              {/* Confirm Password */}
              <Input
                label={
                  editBranch ? "Confirm Password" : req("Confirm Password")
                }
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e: any) => sf("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
              />
              {/* Branch Manager */}
              <div>
                <FieldLabel>Branch Manager</FieldLabel>
                <Combobox
                  data={branchManagers}
                  displayField="label"
                  value={
                    branchManagers.find((e) => e.id === form.branchManager) ||
                    null
                  }
                  onChange={(v: any) => sf("branchManager", v?.id || "")}
                  placeholder="Search manager..."
                  searchFields={["label"]}
                />
              </div>

              {/* Area Manager */}
              <div>
                <FieldLabel>Area Manager</FieldLabel>
                <Combobox
                  data={areaManagers}
                  displayField="label"
                  value={
                    areaManagers.find((e) => e.id === form.areaManager) || null
                  }
                  onChange={(v: any) => sf("areaManager", v?.id || "")}
                  placeholder="Search manager..."
                  searchFields={["label"]}
                />
              </div>

              {/* Opening Date */}
              <div>
                <FieldLabel>Opening Date</FieldLabel>
                <DatePicker
                  placeholder="Choose date..."
                  value={form.openingDate ? [new Date(form.openingDate)] : []}
                  onChange={(dates: Date[]) => {
                    const picked = dates?.[0];
                    if (!picked) {
                      sf("openingDate", "");
                      return;
                    }
                    // Format to YYYY-MM-DD for consistency with backend
                    const yyyy = picked.getFullYear();
                    const mm = String(picked.getMonth() + 1).padStart(2, "0");
                    const dd = String(picked.getDate()).padStart(2, "0");
                    sf("openingDate", `${yyyy}-${mm}-${dd}`);
                  }}
                />
              </div>

              {/* Working Hours */}
              <div>
                <FieldLabel>Working Hours</FieldLabel>
                <Listbox
                  data={workingHoursOptions}
                  value={
                    workingHoursOptions.find(
                      (w) => w.id === form.workingHours,
                    ) || null
                  }
                  onChange={(w: any) => sf("workingHours", w?.id || "")}
                  displayField="label"
                  placeholder="Select hours"
                />
              </div>

              {/* Status */}
              <div>
                <FieldLabel required>Branch Status</FieldLabel>
                <Listbox
                  data={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.id === form.status) || null
                  }
                  onChange={(s: any) => sf("status", s?.id || "Active")}
                  displayField="label"
                  placeholder="Select status"
                />
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label={req("Full Address")}
                  placeholder="Enter full address"
                  rows={3}
                  value={form.fullAddress}
                  onChange={(e: any) => sf("fullAddress", e.target.value)}
                  error={errors.fullAddress}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="button"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editBranch
                  ? "Update Branch"
                  : "Add Branch"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
