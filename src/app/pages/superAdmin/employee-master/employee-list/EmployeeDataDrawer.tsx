import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  // PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { HiPencil } from "react-icons/hi";
import { PreviewImg } from "@/components/shared/PreviewImg";

import { toast } from "sonner";
import { Get, Post, Put } from "@/ApiHelper";
import { Button, Input, Upload, Avatar } from "@/components/ui";
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

interface Opt {
  id: string;
  label: string;
  categoryId?: string; // roles only: which role category they belong to
}

// Active records, plus whatever this employee already has selected
const keepActive = (status: string, id: string, selected: string[]) =>
  status === "Active" || selected.includes(id);

const DESIGNATIONS = [
  { id: "d1", label: "Software Engineer" },
  { id: "d2", label: "Sales Executive" },
  { id: "d3", label: "HR Manager" },
];

const EMPLOYMENT_STATUSES = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
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
      additionalDepartments: (editEmployee.additionalDepartments || []).map(
        String,
      ) as string[],
      roleCategoryId: editEmployee.roleCategoryId || "",
      roleId: editEmployee.roleId || "",
      password: "",
      confirmPassword: "",
    };
  }

  return {
    id: "",
    employeeCode: "",
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
    additionalDepartments: [] as string[],
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
  const [photo, setPhoto] = useState<File | null>(null);
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nextNo, setNextNo] = useState("");
  const [employeeTypes, setEmployeeTypes] = useState<Opt[]>([]);
  const [roleCategories, setRoleCategories] = useState<Opt[]>([]);
  const [roles, setRoles] = useState<Opt[]>([]);
  const [departments, setDepartments] = useState<Opt[]>([]);

  // Dropdown data from the DB
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const [typeRes, catRes, roleRes, deptRes]: any[] = await Promise.all([
          Get("superadmin/employee-type/list", {}, false),
          Get("superadmin/role-category/list", {}, false),
          Get("superadmin/role/list", {}, false),
          Get("superadmin/department/list", {}, false),
        ]);

        const rows = (res: any): any[] => res?.data?.data ?? [];

        setEmployeeTypes(
          rows(typeRes)
            .filter((r) =>
              keepActive(r.status, String(r.employeeTypeId), [
                form.employeeTypeId,
              ]),
            )
            .map((r) => ({ id: String(r.employeeTypeId), label: r.typeName })),
        );
        setRoleCategories(
          rows(catRes)
            .filter((r) =>
              keepActive(r.status, String(r.roleCategoryId), [
                form.roleCategoryId,
              ]),
            )
            .map((r) => ({
              id: String(r.roleCategoryId),
              label: r.roleCategoryName,
            })),
        );
        setRoles(
          rows(roleRes)
            .filter((r) =>
              keepActive(r.status, String(r.roleId), [form.roleId]),
            )
            .map((r) => ({
              id: String(r.roleId),
              label: r.roleName,
              categoryId: String(r.roleCategoryId),
            })),
        );
        setDepartments(
          rows(deptRes)
            .filter((r) =>
              keepActive(
                r.status,
                String(r.departmentId),
                form.additionalDepartments,
              ),
            )
            .map((r) => ({
              id: String(r.departmentId),
              label: r.departmentName,
            })),
        );
      } catch (error) {
        console.error("Employee dropdown error:", error);
        toast.error("Failed to load dropdown data");
      }
    })();
  }, [isOpen]);

  // Employee ID preview (prefix + FY), new employees only
  useEffect(() => {
    if (!isOpen || editEmployee) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/employee/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.employeeNo);
      } catch (error) {
        console.error("Employee number error:", error);
      }
    })();
  }, [isOpen, editEmployee]);

  // Roles shown depend on the selected category
  const roleOptions = useMemo(
    () => roles.filter((r) => r.categoryId === form.roleCategoryId),
    [roles, form.roleCategoryId],
  );

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

    const email = form.officialEmail.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      next.officialEmail = "Enter a valid email";

    if (form.mobileNumber && !/^[0-9]{6,15}$/.test(form.mobileNumber.trim()))
      next.mobileNumber = "Enter 6-15 digits";
    if (
      form.alternateContact &&
      !/^[0-9]{6,15}$/.test(form.alternateContact.trim())
    )
      next.alternateContact = "Enter 6-15 digits";

    if (
      form.dateOfJoining &&
      form.employmentEndDate &&
      form.employmentEndDate < form.dateOfJoining
    )
      next.employmentEndDate = "End date cannot be before the joining date";
    // password is optional; when typed it needs an email (login id) and a match
    if (form.password) {
      if (!email)
        next.officialEmail = "Official email is required to set a password";
      if (form.password.length < 6)
        next.password = "Password must be at least 6 characters";
      if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

 const onSubmit = async () => {
  if (!validate()) return;

  try {
    setSubmitting(true);
    const payload = {
      employeeCode: form.employeeCode.trim(),
      employeeName: form.employeeName.trim(),
      officialEmail: form.officialEmail.trim(),
      mobileCountryCode: form.mobileCountryCode,
      mobileNumber: form.mobileNumber.trim(),
      alternateCountryCode: form.alternateCountryCode,
      alternateContact: form.alternateContact.trim(),
      employeeTypeId: form.employeeTypeId ? Number(form.employeeTypeId) : null,
      // Designation has no backend yet: keep whatever was saved, never clear it
      designationId: editEmployee?.designationId
        ? Number(editEmployee.designationId)
        : null,
      dateOfJoining: form.dateOfJoining,
      employmentStatus: form.employmentStatus,
      employmentEndDate: form.employmentEndDate,
      remarks: form.remarks.trim(),
      roleCategoryId: form.roleCategoryId ? Number(form.roleCategoryId) : null,
      roleId: form.roleId ? Number(form.roleId) : null,
      additionalDepartments: form.additionalDepartments.map(Number),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    // multipart: sab fields FormData me, photo alag se
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
    });
    if (photo) fd.append("profilePhoto", photo);

    if (editEmployee) {
      fd.append("employeeId", String(editEmployee.id));
      await Put("superadmin/employee/update", fd, true);
    } else {
      fd.append(
        "financialYearId",
        localStorage.getItem("financialYearId") || "",
      );
      await Post("superadmin/employee/create", fd, true);
    }

    toast.success(
      editEmployee
        ? "Employee updated successfully"
        : "Employee added successfully",
    );
    onSaved();
    handleClose();
  } catch (err: any) {
    toast.error(
      err?.response?.data?.message || "Something went wrong while saving.",
    );
  } finally {
    setSubmitting(false);
  }
};

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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[60%]"
        >
          {/* Header */}
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-5 py-4 text-white">
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
              {/* A. Basic Details */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  A. Basic Details
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Employee ID */}
                  <div>
                    <FieldLabel>Employee ID</FieldLabel>
                    <Input
                      value={
                        editEmployee?.employeeNo || nextNo || "Generating..."
                      }
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

                {/* Email, Mobile, Alternate: ek row me 3 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Official Email */}
                  <div>
                    <FieldLabel>Official Email</FieldLabel>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={form.officialEmail}
                      onChange={(e: any) => sf("officialEmail", e.target.value)}
                    />
                    {errors.officialEmail && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.officialEmail}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <FieldLabel>Mobile Number</FieldLabel>
                    <div className="flex gap-2">
                      <div className="w-28 shrink-0">
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
                    {errors.mobileNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Alternate Contact */}
                  <div>
                    <FieldLabel>Alternate Contact</FieldLabel>
                    <div className="flex gap-2">
                      <div className="w-28 shrink-0">
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
                    {errors.alternateContact && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.alternateContact}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* B. Employment Details */}
              <div className="space-y-4 pt-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  B. Employment Details
                </h4>

                {/* Saare fields: ek row me 3 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Row 1 */}
                  <div>
                    <FieldLabel>Employee Type</FieldLabel>
                    <Combobox
                      data={employeeTypes}
                      displayField="label"
                      value={
                        employeeTypes.find(
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

                  {/* Row 2 */}
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
                    {errors.employmentEndDate && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.employmentEndDate}
                      </p>
                    )}
                  </div>

                  {/* Role Category */}
                  <div>
                    <FieldLabel>Role Category</FieldLabel>
                    <Combobox
                      data={roleCategories}
                      displayField="label"
                      value={
                        roleCategories.find(
                          (t) => t.id === form.roleCategoryId,
                        ) || null
                      }
                      onChange={(v: any) =>
                        setForm((f) => ({
                          ...f,
                          roleCategoryId: v?.id || "",
                          roleId: "",
                        }))
                      }
                      placeholder="Select Category"
                      searchFields={["label"]}
                    />
                  </div>

                  {/* Row 3 */}
                  {/* Role */}
                  <div>
                    <FieldLabel>Role</FieldLabel>
                    <Combobox
                      data={roleOptions}
                      displayField="label"
                      value={
                        roleOptions.find((t) => t.id === form.roleId) || null
                      }
                      onChange={(v: any) => sf("roleId", v?.id || "")}
                      placeholder={
                        form.roleCategoryId
                          ? "Select Role"
                          : "Select a role category first"
                      }
                      searchFields={["label"]}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={
                        editEmployee
                          ? "Leave blank to keep current"
                          : "Enter password"
                      }
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
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <FieldLabel>Confirm Password</FieldLabel>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={
                        editEmployee
                          ? "Leave blank to keep current"
                          : "Enter password"
                      }
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

                {/* Remarks: poori width */}
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
                      data={departments}
                      displayField="label"
                      value={
                        departments.find((d) =>
                          form.additionalDepartments.includes(d.id),
                        ) || null
                      }
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
