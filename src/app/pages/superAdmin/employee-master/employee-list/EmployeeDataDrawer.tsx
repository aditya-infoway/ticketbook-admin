import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Country } from "country-state-city";
import type { Employee } from "../shared/types";

interface EmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editEmployee: Employee | null;
}

// Mock Dropdown Data
const EMPLOYEE_TYPES = [
  { id: "et1", label: "Full Time" },
  { id: "et2", label: "Part Time" },
  { id: "et3", label: "Contractor" },
];

const DESIGNATIONS = [
  { id: "d1", label: "Software Engineer" },
  { id: "d2", label: "Sales Executive" },
  { id: "d3", label: "HR Manager" },
];

const DEPARTMENTS = [
  { id: "dep1", label: "Engineering" },
  { id: "dep2", label: "Sales" },
  { id: "dep3", label: "Human Resources" },
];

const EMPLOYMENT_STATUSES = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

const ROLE_CATEGORIES = [
  { id: "rc1", label: "Management" },
  { id: "rc2", label: "Staff" },
  { id: "rc3", label: "Field Worker" },
];

const ROLES = [
  { id: "r1", label: "Admin" },
  { id: "r2", label: "Manager" },
  { id: "r3", label: "Executive" },
];

const dialCodeOptions = Country.getAllCountries()
  .filter((c) => c.phonecode)
  .map((c) => ({
    id: c.phonecode,
    label: `+${c.phonecode} (${c.isoCode})`,
    countryCode: c.isoCode,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function getInitialForm(editEmployee: Employee | null) {
  if (editEmployee) {
    return {
      id: editEmployee.id,
      employeeCode: editEmployee.employeeCode,
      employeeName: editEmployee.employeeName,
      profilePhoto: editEmployee.profilePhoto,
      officialEmail: editEmployee.officialEmail,
      mobileCountryCode: editEmployee.mobileCountryCode || "91",
      mobileNumber: editEmployee.mobileNumber,
      alternateCountryCode: editEmployee.alternateCountryCode || "91",
      alternateContact: editEmployee.alternateContact,
      employeeTypeId: editEmployee.employeeTypeId,
      designationId: editEmployee.designationId,
      dateOfJoining: editEmployee.dateOfJoining,
      employmentStatus: editEmployee.employmentStatus,
      employmentEndDate: editEmployee.employmentEndDate,
      remarks: editEmployee.remarks,
      additionalDepartments: editEmployee.additionalDepartments || [],
      roleCategoryId: "",
      roleId: "",
      password: "",
      confirmPassword: "",
    };
  }

  return {
    id: `EMP-ID-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeName: "",
    profilePhoto: "",
    officialEmail: "",
    mobileCountryCode: "91",
    mobileNumber: "",
    alternateCountryCode: "91",
    alternateContact: "",
    employeeTypeId: "",
    designationId: "",
    dateOfJoining: "",
    employmentStatus: "Active",
    employmentEndDate: "",
    remarks: "",
    additionalDepartments: [],
    roleCategoryId: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  };
}

export function EmployeeDataDrawer({
  isOpen,
  close,
  onSaved,
  editEmployee,
}: EmployeeDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editEmployee));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleClose = () => close();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.employeeCode.trim())
      next.employeeCode = "Employee code is required";
    if (!form.employeeName.trim())
      next.employeeName = "Employee name is required";
    if (!form.employmentStatus) next.employmentStatus = "Status is required";

    if (form.password && form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      console.log("Saving Employee:", form);
      toast.success(
        editEmployee
          ? "Employee updated successfully"
          : "Employee added successfully",
      );
      onSaved();
      handleClose();
    } catch {
      toast.error("Something went wrong while saving.");
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[60%]"
        >
          {/* Header */}
          <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">
              {editEmployee ? "Edit Employee" : "Add Employee"}
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
            <div className="space-y-6">
              {/* Profile Photo (Normal Top Layout) */}
              <div className="mb-6 flex items-center gap-4">
                <div className="dark:border-dark-600 dark:bg-dark-800 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {form.profilePhoto ? (
                    <img
                      src={form.profilePhoto}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Photo</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="dark:text-dark-200 dark:file:bg-dark-600 cursor-pointer text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:file:text-white"
                  />
                </div>
              </div>

              {/* A. Basic Details */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  A. Basic Details
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Employee ID */}
                  <div>
                    <FieldLabel>Employee ID (Auto)</FieldLabel>
                    <Input
                      value={form.id}
                      readOnly
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                  </div>

                  {/* Employee Code */}
                  <div>
                    <FieldLabel required>Employee Code</FieldLabel>
                    <Input
                      placeholder="Code"
                      value={form.employeeCode}
                      onChange={(e: any) => sf("employeeCode", e.target.value)}
                    />
                    {errors.employeeCode && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.employeeCode}
                      </p>
                    )}
                  </div>

                  {/* Employee Name */}
                  <div>
                    <FieldLabel required>Employee Name</FieldLabel>
                    <Input
                      placeholder="Full Name"
                      value={form.employeeName}
                      onChange={(e: any) => sf("employeeName", e.target.value)}
                    />
                    {errors.employeeName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.employeeName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Official Email */}
                  <div>
                    <FieldLabel>Official Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={form.officialEmail}
                      onChange={(e: any) => sf("officialEmail", e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Mobile Number</FieldLabel>
                    <div className="flex gap-2">
                      <div className="w-32 shrink-0">
                        <Combobox
                          data={dialCodeOptions}
                          displayField="label"
                          value={
                            dialCodeOptions.find(
                              (c) => c.id === form.mobileCountryCode,
                            ) || null
                          }
                          onChange={(v: any) =>
                            sf("mobileCountryCode", v?.id || "")
                          }
                          placeholder="+91"
                          searchFields={["label"]}
                        />
                      </div>
                      <Input
                        type="tel"
                        placeholder="Mobile Number"
                        value={form.mobileNumber}
                        onChange={(e: any) =>
                          sf("mobileNumber", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Alternate Contact</FieldLabel>
                    <div className="flex gap-2">
                      <div className="w-32 shrink-0">
                        <Combobox
                          data={dialCodeOptions}
                          displayField="label"
                          value={
                            dialCodeOptions.find(
                              (c) => c.id === form.alternateCountryCode,
                            ) || null
                          }
                          onChange={(v: any) =>
                            sf("alternateCountryCode", v?.id || "")
                          }
                          placeholder="+91"
                          searchFields={["label"]}
                        />
                      </div>
                      <Input
                        type="tel"
                        placeholder="Alternate Number"
                        value={form.alternateContact}
                        onChange={(e: any) =>
                          sf("alternateContact", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* B. Employment Details */}
              <div className="space-y-4 pt-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  B. Employment Details
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Employee Type</FieldLabel>
                    <Combobox
                      data={EMPLOYEE_TYPES}
                      displayField="label"
                      value={
                        EMPLOYEE_TYPES.find(
                          (t) => t.id === form.employeeTypeId,
                        ) || null
                      }
                      onChange={(v: any) => sf("employeeTypeId", v?.id || "")}
                      placeholder="Select Type"
                      searchFields={["label"]}
                    />
                  </div>

                  <div>
                    <FieldLabel>Designation</FieldLabel>
                    <Combobox
                      data={DESIGNATIONS}
                      displayField="label"
                      value={
                        DESIGNATIONS.find((t) => t.id === form.designationId) ||
                        null
                      }
                      onChange={(v: any) => sf("designationId", v?.id || "")}
                      placeholder="Select Designation"
                      searchFields={["label"]}
                    />
                  </div>

                  <div>
                    <FieldLabel>Date of Joining</FieldLabel>
                    <DatePicker
                      placeholder="Choose date..."
                      value={
                        form.dateOfJoining ? [new Date(form.dateOfJoining)] : []
                      }
                      onChange={(dates: Date[]) => {
                        const picked = dates?.[0];
                        if (!picked) return sf("dateOfJoining", "");
                        const yyyy = picked.getFullYear();
                        const mm = String(picked.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const dd = String(picked.getDate()).padStart(2, "0");
                        sf("dateOfJoining", `${yyyy}-${mm}-${dd}`);
                      }}
                    />
                  </div>

                  <div>
                    <FieldLabel required>Employment Status</FieldLabel>
                    <Listbox
                      data={EMPLOYMENT_STATUSES}
                      value={
                        EMPLOYMENT_STATUSES.find(
                          (s) => s.id === form.employmentStatus,
                        ) || null
                      }
                      onChange={(v: any) =>
                        sf("employmentStatus", v?.id || "Active")
                      }
                      displayField="label"
                      placeholder="Select Status"
                    />
                    {errors.employmentStatus && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.employmentStatus}
                      </p>
                    )}
                  </div>

                  <div>
                    <FieldLabel>Employment End Date</FieldLabel>
                    <DatePicker
                      placeholder="Choose date..."
                      value={
                        form.employmentEndDate
                          ? [new Date(form.employmentEndDate)]
                          : []
                      }
                      onChange={(dates: Date[]) => {
                        const picked = dates?.[0];
                        if (!picked) return sf("employmentEndDate", "");
                        const yyyy = picked.getFullYear();
                        const mm = String(picked.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const dd = String(picked.getDate()).padStart(2, "0");
                        sf("employmentEndDate", `${yyyy}-${mm}-${dd}`);
                      }}
                    />
                  </div>

                  {/* Role Category */}
                  <div>
                    <FieldLabel>Role Category</FieldLabel>
                    <Combobox
                      data={ROLE_CATEGORIES}
                      displayField="label"
                      value={
                        ROLE_CATEGORIES.find(
                          (t) => t.id === form.roleCategoryId,
                        ) || null
                      }
                      onChange={(v: any) => sf("roleCategoryId", v?.id || "")}
                      placeholder="Select Category"
                      searchFields={["label"]}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <FieldLabel>Role</FieldLabel>
                    <Combobox
                      data={ROLES}
                      displayField="label"
                      value={ROLES.find((t) => t.id === form.roleId) || null}
                      onChange={(v: any) => sf("roleId", v?.id || "")}
                      placeholder="Select Role"
                      searchFields={["label"]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Password */}
                  <div>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={form.password}
                      onChange={(e: any) => sf("password", e.target.value)}
                      prefix={
                        <LockClosedIcon className="size-5 text-gray-400" />
                      }
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="size-5" />
                          ) : (
                            <EyeIcon className="size-5" />
                          )}
                        </button>
                      }
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={form.confirmPassword}
                      onChange={(e: any) =>
                        sf("confirmPassword", e.target.value)
                      }
                      prefix={
                        <LockClosedIcon className="size-5 text-gray-400" />
                      }
                      suffix={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="size-5" />
                          ) : (
                            <EyeIcon className="size-5" />
                          )}
                        </button>
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <FieldLabel>Remarks</FieldLabel>
                    <textarea
                      className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                      rows={2}
                      placeholder="Optional remarks..."
                      value={form.remarks}
                      onChange={(e) => sf("remarks", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* C. Organization Mapping */}
              <div className="space-y-4 pt-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  C. Organization Mapping
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Additional Departments</FieldLabel>
                    <Combobox
                      data={DEPARTMENTS}
                      displayField="label"
                      value={null}
                      onChange={(v: any) =>
                        sf("additionalDepartments", v ? [v.id] : [])
                      }
                      placeholder="Search departments..."
                      searchFields={["label"]}
                    />
                  </div>
                </div>
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
                : editEmployee
                  ? "Update Employee"
                  : "Add Employee"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
