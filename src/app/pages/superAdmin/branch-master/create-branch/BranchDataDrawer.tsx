import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
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

const regionOptions = [
  { id: "North", label: "North" },
  { id: "South", label: "South" },
  { id: "East", label: "East" },
  { id: "West", label: "West" },
  { id: "Central", label: "Central" },
];

const employeeOptions = [
  { id: "emp-1", label: "John Doe" },
  { id: "emp-2", label: "Jane Smith" },
  { id: "emp-3", label: "Mike Johnson" },
  { id: "emp-4", label: "Sarah Williams" },
];

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
      region: editBranch.region,
      country,
      state,
      city,
      fullAddress: editBranch.fullAddress,
      pinCode: editBranch.pinCode,
      contactNumber: editBranch.contactNumber,
      phoneNumber: editBranch.phoneNumber || "",
      branchEmail: editBranch.branchEmail,
      branchManager: editBranch.branchManager,
      areaManager: editBranch.areaManager,
      openingDate: editBranch.openingDate,
      workingHours: editBranch.workingHours,
      status: editBranch.status,
    };
  }

  // New branch → generate IDs only once (on mount)
  return {
    branchId: `BR-ID-${Math.floor(100 + Math.random() * 900)}`,
    branchCode: `BR-${Math.floor(100 + Math.random() * 900)}`,
    branchName: "",
    region: "",
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
      // TODO: Replace with actual API call
      console.log("Saving Branch:", {
        ...form,
        country: form.country?.label,
        state: form.state?.label,
        city: form.city?.label,
      });

      // 👈 Improved toast messages
      toast.success(
        editBranch
          ? "Branch updated successfully"
          : "Branch added successfully",
      );
      onSaved();
      handleClose();
    } catch {
      toast.error("Something went wrong while saving the branch.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={handleClose}>
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
          <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Branch ID */}
              <div>
                <FieldLabel>Branch ID (Auto)</FieldLabel>
                <Input
                  value={form.branchId}
                  readOnly
                  disabled
                  className="dark:bg-dark-800 w-full truncate bg-gray-50 text-gray-500"
                />
              </div>

              {/* Branch Code */}
              <div>
                <FieldLabel required>Branch Code</FieldLabel>
                <Input
                  placeholder="Enter code"
                  value={form.branchCode}
                  onChange={(e: any) => sf("branchCode", e.target.value)}
                />
                {errors.branchCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.branchCode}
                  </p>
                )}
              </div>

              {/* Branch Name */}
              <div>
                <FieldLabel required>Branch Name</FieldLabel>
                <Input
                  placeholder="Enter branch name"
                  value={form.branchName}
                  onChange={(e: any) => sf("branchName", e.target.value)}
                />
                {errors.branchName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.branchName}
                  </p>
                )}
              </div>

              {/* Region */}
              <div>
                <FieldLabel>Region / Area</FieldLabel>
                <Listbox
                  data={regionOptions}
                  value={
                    regionOptions.find((r) => r.id === form.region) || null
                  }
                  onChange={(r: any) => sf("region", r?.id || "")}
                  displayField="label"
                  placeholder="Select region"
                />
              </div>

              {/* Country */}
              <div>
                <FieldLabel required>Country</FieldLabel>
                <Combobox
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
                    if (errors.country)
                      setErrors((p) => ({ ...p, country: "" }));
                  }}
                  placeholder="Search country..."
                  searchFields={["label"]}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                )}
              </div>

              {/* State */}
              <div>
                <FieldLabel required>State</FieldLabel>
                <Combobox
                  data={stateOptions}
                  displayField="label"
                  value={form.state}
                  onChange={(v: any) => {
                    setForm((f) => ({ ...f, state: v || null, city: null }));
                    if (errors.state) setErrors((p) => ({ ...p, state: "" }));
                  }}
                  placeholder="Search state..."
                  searchFields={["label"]}
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-red-500">{errors.state}</p>
                )}
              </div>

              {/* City */}
              <div>
                <FieldLabel required>City</FieldLabel>
                <Combobox
                  data={cityOptions}
                  displayField="label"
                  value={form.city}
                  onChange={(v: any) => {
                    sf("city", v || null);
                    if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                  }}
                  placeholder="Search city..."
                  searchFields={["label"]}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <FieldLabel required>Full Address</FieldLabel>
                <Input
                  placeholder="Enter full address"
                  value={form.fullAddress}
                  onChange={(e: any) => sf("fullAddress", e.target.value)}
                />
                {errors.fullAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fullAddress}
                  </p>
                )}
              </div>

              {/* Pin Code */}
              <div>
                <FieldLabel>Postal / PIN Code</FieldLabel>
                <Input
                  placeholder="Enter PIN code"
                  value={form.pinCode}
                  onChange={(e: any) => sf("pinCode", e.target.value)}
                />
              </div>

              {/* Contact */}
              <div>
                <FieldLabel required>Contact Number</FieldLabel>
                <Input
                  placeholder="Enter contact number"
                  value={form.contactNumber}
                  onChange={(e: any) => sf("contactNumber", e.target.value)}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.contactNumber}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>Phone Number</FieldLabel>
                <Input
                  placeholder="Enter phone number"
                  value={form.phoneNumber}
                  onChange={(e: any) => sf("phoneNumber", e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <FieldLabel>Branch Email</FieldLabel>
                <Input
                  placeholder="Enter email"
                  type="email"
                  value={form.branchEmail}
                  onChange={(e: any) => sf("branchEmail", e.target.value)}
                />
              </div>

              {/* Branch Manager */}
              <div>
                <FieldLabel>Branch Manager</FieldLabel>
                <Listbox
                  data={employeeOptions}
                  value={
                    employeeOptions.find((e) => e.id === form.branchManager) ||
                    null
                  }
                  onChange={(e: any) => sf("branchManager", e?.id || "")}
                  displayField="label"
                  placeholder="Select manager"
                />
              </div>

              {/* Area Manager */}
              <div>
                <FieldLabel>Area Manager</FieldLabel>
                <Listbox
                  data={employeeOptions}
                  value={
                    employeeOptions.find((e) => e.id === form.areaManager) ||
                    null
                  }
                  onChange={(e: any) => sf("areaManager", e?.id || "")}
                  displayField="label"
                  placeholder="Select manager"
                />
              </div>

              {/* Opening Date — 👈 Updated to use DatePicker */}
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
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
