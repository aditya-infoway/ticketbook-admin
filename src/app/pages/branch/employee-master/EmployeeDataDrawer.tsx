// src/app/pages/branch-master/employee/EmployeeDataDrawer.tsx
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";
import { HiPencil } from "react-icons/hi";
import { Controller, useForm } from "react-hook-form";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { toast } from "sonner";
import { Get, Post, Put } from "@/ApiHelper";
import { Button, Input, Textarea, Upload, Avatar } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Country, State, City } from "country-state-city";
import type { Employee } from "./shared/types";

interface EmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editEmployee: Employee | null;
  isBranchUser?: boolean; // 👈 Hide Branch dropdown for branch users
}

interface Opt {
  id: string;
  label: string;
}

const keepActive = (status: string, id: string, selected: string[]) =>
  status === "Active" || selected.includes(id);

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

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9]{6,15}$/;
const CODE_REGEX = /^[A-Za-z0-9_-]{2,30}$/;

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
      employeeCode: editEmployee.employeeCode || "",
      employeeName: editEmployee.employeeName || "",
      profilePhoto: editEmployee.profilePhoto || "",
      officialEmail: editEmployee.officialEmail || "",
      mobileCountryCode: editEmployee.mobileCountryCode || "91",
      mobileNumber: editEmployee.mobileNumber || "",
      alternateCountryCode: editEmployee.alternateCountryCode || "91",
      alternateContact: editEmployee.alternateContact || "",
      country: (editEmployee as any).country || "India",
      state: (editEmployee as any).state || "",
      district: (editEmployee as any).district || "",
      city: (editEmployee as any).city || "",
      address: (editEmployee as any).address || "",
      pinCode: (editEmployee as any).pinCode || "",
      employmentStatus: editEmployee.employmentStatus || "Active",
      remarks: editEmployee.remarks || "",
      additionalDepartments: (editEmployee.additionalDepartments || []).map(
        String,
      ) as string[],
      branchId: String((editEmployee as any).branchId ?? ""),

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
    country: "India",
    state: "",
    district: "",
    city: "",
    address: "",
    pinCode: "",
    employmentStatus: "Active",
    employmentEndDate: "",
    remarks: "",
    additionalDepartments: [] as string[],
    branchId: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  };
}

type FormValues = ReturnType<typeof getInitialForm>;

export function EmployeeDataDrawer({
  isOpen,
  close,
  onSaved,
  editEmployee,
  isBranchUser = false,
}: EmployeeDrawerProps) {
  const initial = useMemo(() => getInitialForm(editEmployee), [editEmployee]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: initial });

  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nextNo, setNextNo] = useState("");
  const [roles, setRoles] = useState<Opt[]>([]);
  const [departments, setDepartments] = useState<Opt[]>([]);
  const [branches, setBranches] = useState<Opt[]>([]);

  const profilePhoto = watch("profilePhoto");

  // Dropdown data from the DB
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const [roleRes, deptRes, branchRes]: any[] = await Promise.all([
          Get("superadmin/role/list", {}, false),
          Get("superadmin/department/list", {}, false),
          // Fetch branches only if Super Admin
          !isBranchUser ? Get("superadmin/branch/list", {}, false) : null,
        ]);

        const rows = (res: any): any[] => res?.data?.data ?? [];

        setRoles(
          rows(roleRes)
            .filter((r) =>
              keepActive(r.status, String(r.roleId), [initial.roleId]),
            )
            .map((r) => ({
              id: String(r.roleId),
              label: r.roleName,
            })),
        );
        setDepartments(
          rows(deptRes)
            .filter((r) =>
              keepActive(
                r.status,
                String(r.departmentId),
                initial.additionalDepartments,
              ),
            )
            .map((r) => ({
              id: String(r.departmentId),
              label: r.departmentName,
            })),
        );

        // Only set branches if not branch user
        if (branchRes) {
          setBranches(
            rows(branchRes)
              .filter((r) =>
                keepActive(r.status, String(r.branchId), [initial.branchId]),
              )
              .map((r) => ({
                id: String(r.branchId),
                label: r.branchName,
              })),
          );
        }
      } catch (error) {
        console.error("Employee dropdown error:", error);
        toast.error("Failed to load dropdown data");
      }
    })();
  }, [isOpen, isBranchUser, initial]);

  // Employee ID preview (prefix + FY), new employees only
  useEffect(() => {
    if (!isOpen || editEmployee) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        // Uses the branch-specific endpoint
        const res: any = await Get(
          "branch/employee/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.employeeNo);
      } catch (error) {
        console.error("Employee number error:", error);
      }
    })();
  }, [isOpen, editEmployee]);

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        employeeCode: values.employeeCode.trim(),
        employeeName: values.employeeName.trim(),
        officialEmail: values.officialEmail.trim(),
        mobileCountryCode: values.mobileCountryCode,
        mobileNumber: values.mobileNumber.trim(),
        alternateCountryCode: values.alternateCountryCode,
        alternateContact: values.alternateContact.trim(),
        country: values.country,
        state: values.state,
        district: values.district,
        city: values.city,
        address: values.address,
        pinCode: values.pinCode,
        employmentStatus: values.employmentStatus,
        remarks: values.remarks.trim(),

        roleId: values.roleId ? Number(values.roleId) : null,
        // Only send branchId if Super Admin
        branchId:
          !isBranchUser && values.branchId
            ? Number(values.branchId)
            : undefined,
        additionalDepartments: values.additionalDepartments.map(Number),
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
      });
      if (photo) fd.append("profilePhoto", photo);

      if (editEmployee) {
        fd.append("employeeId", String(editEmployee.id));
        // 👇 Branch User endpoints
        await Put("branch/employee/update", fd, true);
      } else {
        fd.append(
          "financialYearId",
          localStorage.getItem("financialYearId") || "",
        );
        // 👇 Branch User endpoints
        await Post("branch/employee/create", fd, true);
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

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        id: c.isoCode,
        label: c.name,
      })),
    [],
  );

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  const stateOptions = useMemo(() => {
    const country = countryOptions.find((c) => c.label === selectedCountry);
    if (!country) return [];
    return State.getStatesOfCountry(country.id).map((s) => ({
      id: s.name,
      label: s.name,
    }));
  }, [selectedCountry, countryOptions]);

  const cityOptions = useMemo(() => {
    const country = countryOptions.find((c) => c.label === selectedCountry);
    if (!country || !selectedState) return [];
    const state = State.getStatesOfCountry(country.id).find(
      (s) => s.name === selectedState,
    );
    if (!state) return [];
    return City.getCitiesOfState(country.id, state.isoCode).map((c) => ({
      id: c.name,
      label: c.name,
    }));
  }, [selectedCountry, selectedState, countryOptions]);

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

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-6">
                {/* Profile Photo */}
                <div className="mb-6 flex flex-col space-y-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Photo
                  </span>
                  <Avatar
                    size={20}
                    imgComponent={PreviewImg}
                    imgProps={{ file: photo } as any}
                    src={
                      profilePhoto || "/images/logos/company-placeholder.svg"
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

                    <div>
                      <FieldLabel required>Employee Code</FieldLabel>
                      <Input
                        placeholder="Code"
                        {...register("employeeCode", {
                          required: "Employee code is required",
                          pattern: {
                            value: CODE_REGEX,
                            message:
                              "2-30 characters (letters, numbers, - or _)",
                          },
                        })}
                        error={errors.employeeCode?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel required>Employee Name</FieldLabel>
                      <Input
                        placeholder="Full Name"
                        {...register("employeeName", {
                          required: "Employee name is required",
                          validate: (v) =>
                            v.trim().length > 0 || "Employee name is required",
                          maxLength: {
                            value: 150,
                            message: "Name is too long (max 150)",
                          },
                        })}
                        error={errors.employeeName?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <FieldLabel required>Official Email</FieldLabel>
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        {...register("officialEmail", {
                          required: "Official email is required",
                          pattern: {
                            value: EMAIL_REGEX,
                            message: "Enter a valid email",
                          },
                        })}
                        error={errors.officialEmail?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel required>Mobile Number</FieldLabel>
                      <div className="flex items-start gap-2">
                        <div className="w-28 shrink-0">
                          <Controller
                            control={control}
                            name="mobileCountryCode"
                            rules={{ required: "Required" }}
                            render={({ field }) => (
                              <Combobox
                                data={dialCodeOptions}
                                displayField="label"
                                value={
                                  dialCodeOptions.find(
                                    (c) => c.id === field.value,
                                  ) || null
                                }
                                onChange={(v: any) =>
                                  field.onChange(v?.id || "")
                                }
                                placeholder="+91"
                                searchFields={["label"]}
                                error={errors.mobileCountryCode?.message}
                              />
                            )}
                          />
                        </div>
                        <Input
                          type="tel"
                          placeholder="Mobile Number"
                          {...register("mobileNumber", {
                            required: "Mobile number is required",
                            pattern: {
                              value: PHONE_REGEX,
                              message: "Enter 6-15 digits",
                            },
                          })}
                          error={errors.mobileNumber?.message}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Alternate Contact</FieldLabel>
                      <div className="flex items-start gap-2">
                        <div className="w-28 shrink-0">
                          <Controller
                            control={control}
                            name="alternateCountryCode"
                            render={({ field }) => (
                              <Combobox
                                data={dialCodeOptions}
                                displayField="label"
                                value={
                                  dialCodeOptions.find(
                                    (c) => c.id === field.value,
                                  ) || null
                                }
                                onChange={(v: any) =>
                                  field.onChange(v?.id || "")
                                }
                                placeholder="+91"
                                searchFields={["label"]}
                              />
                            )}
                          />
                        </div>
                        <Input
                          type="tel"
                          placeholder="Alternate Number"
                          {...register("alternateContact", {
                            validate: (v) =>
                              !v ||
                              PHONE_REGEX.test(v.trim()) ||
                              "Enter 6-15 digits",
                          })}
                          error={errors.alternateContact?.message}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Address / Location */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    B. Address / Location
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Country */}
                    <div>
                      <FieldLabel required>Country</FieldLabel>
                      <Controller
                        control={control}
                        name="country"
                        rules={{ required: "Country is required" }}
                        render={({ field }) => (
                          <Combobox
                            data={countryOptions}
                            displayField="label"
                            value={
                              countryOptions.find(
                                (c) => c.label === field.value,
                              ) || null
                            }
                            onChange={(v: any) => {
                              field.onChange(v?.label || "");
                              setValue("state", "");
                              setValue("city", "");
                              setValue("district", "");
                            }}
                            placeholder="Select Country"
                            searchFields={["label"]}
                            error={errors.country?.message as any}
                          />
                        )}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <FieldLabel required>State</FieldLabel>
                      <Controller
                        control={control}
                        name="state"
                        rules={{ required: "State is required" }}
                        render={({ field }) => (
                          <Combobox
                            data={stateOptions}
                            displayField="label"
                            value={
                              stateOptions.find(
                                (s) => s.label === field.value,
                              ) || null
                            }
                            onChange={(v: any) => {
                              field.onChange(v?.label || "");
                              setValue("city", "");
                              setValue("district", "");
                            }}
                            placeholder="Select State"
                            searchFields={["label"]}
                            error={errors.state?.message as any}
                          />
                        )}
                      />
                    </div>

                    {/* District */}
                    <div>
                      <FieldLabel required>District</FieldLabel>
                      <Controller
                        control={control}
                        name="district"
                        rules={{ required: "District is required" }}
                        render={({ field }) => (
                          <Combobox
                            data={cityOptions}
                            displayField="label"
                            value={
                              cityOptions.find(
                                (c) => c.label === field.value,
                              ) || null
                            }
                            onChange={(v: any) =>
                              field.onChange(v?.label || "")
                            }
                            placeholder="Select District"
                            searchFields={["label"]}
                            error={errors.district?.message as any}
                          />
                        )}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <FieldLabel required>City</FieldLabel>
                      <Controller
                        control={control}
                        name="city"
                        rules={{ required: "City is required" }}
                        render={({ field }) => (
                          <Combobox
                            data={cityOptions}
                            displayField="label"
                            value={
                              cityOptions.find(
                                (c) => c.label === field.value,
                              ) || null
                            }
                            onChange={(v: any) =>
                              field.onChange(v?.label || "")
                            }
                            placeholder="Select City"
                            searchFields={["label"]}
                            error={errors.city?.message as any}
                          />
                        )}
                      />
                    </div>

                    {/* PIN Code */}
                    <div>
                      <FieldLabel>PIN Code</FieldLabel>
                      <Input
                        placeholder="400001"
                        maxLength={6}
                        {...register("pinCode", {
                          validate: (v) =>
                            !v ||
                            /^\d{6}$/.test(v) ||
                            "PIN Code must be exactly 6 digits",
                        })}
                        error={errors.pinCode?.message as any}
                      />
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-3">
                      <FieldLabel required>Address</FieldLabel>
                      <Textarea
                        rows={2}
                        placeholder="Full address..."
                        {...register("address", {
                          required: "Address is required",
                          maxLength: {
                            value: 500,
                            message: "Max 500 characters",
                          },
                        })}
                        error={errors.address?.message as any}
                      />
                    </div>
                  </div>
                </div>

                {/* C. Employment Details */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    C. Employment Details
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <FieldLabel required>Role</FieldLabel>
                      <Controller
                        control={control}
                        name="roleId"
                        rules={{ required: "Role is required" }}
                        render={({ field }) => (
                          <Combobox
                            data={roles}
                            displayField="label"
                            value={
                              roles.find((t) => t.id === field.value) || null
                            }
                            onChange={(v: any) => field.onChange(v?.id || "")}
                            placeholder="Select Role"
                            searchFields={["label"]}
                            error={errors.roleId?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <FieldLabel required={!editEmployee}>Password</FieldLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={
                          editEmployee
                            ? "Leave blank to keep current"
                            : "Enter password"
                        }
                        {...register("password", {
                          validate: (v) => {
                            if (!editEmployee && !v)
                              return "Password is required";
                            if (v && v.length < 6)
                              return "Password must be at least 6 characters";
                            return true;
                          },
                        })}
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
                        error={errors.password?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel required={!editEmployee}>
                        Confirm Password
                      </FieldLabel>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={
                          editEmployee
                            ? "Leave blank to keep current"
                            : "Enter password"
                        }
                        {...register("confirmPassword", {
                          validate: (v) => {
                            const pw = getValues("password");
                            if (!pw && !v) return true;
                            if (!v) return "Confirm password is required";
                            return v === pw || "Passwords do not match";
                          },
                        })}
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
                        error={errors.confirmPassword?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel required>Employment Status</FieldLabel>
                      <Controller
                        control={control}
                        name="employmentStatus"
                        rules={{ required: "Status is required" }}
                        render={({ field }) => (
                          <Listbox
                            data={EMPLOYMENT_STATUSES}
                            value={
                              EMPLOYMENT_STATUSES.find(
                                (s) => s.id === field.value,
                              ) || null
                            }
                            onChange={(v: any) =>
                              field.onChange(v?.id || "Active")
                            }
                            displayField="label"
                            placeholder="Select Status"
                            error={errors.employmentStatus?.message}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <FieldLabel>Remarks</FieldLabel>
                      <Textarea
                        rows={2}
                        placeholder="Optional remarks..."
                        {...register("remarks", {
                          maxLength: {
                            value: 500,
                            message: "Remarks can be max 500 characters",
                          },
                        })}
                        error={errors.remarks?.message}
                      />
                    </div>
                  </div>
                </div>

                {/* D. Organization Mapping */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    D. Organization Mapping
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Branch: show only for Super Admin */}
                    {!isBranchUser && (
                      <div>
                        <FieldLabel required>Branch</FieldLabel>
                        <Controller
                          control={control}
                          name="branchId"
                          rules={{ required: "Branch is required" }}
                          render={({ field }) => (
                            <Combobox
                              data={branches}
                              displayField="label"
                              value={
                                branches.find(
                                  (b) => b.id === String(field.value),
                                ) || null
                              }
                              onChange={(v: any) => field.onChange(v?.id || "")}
                              placeholder="Select Branch"
                              searchFields={["label"]}
                              error={errors.branchId?.message}
                            />
                          )}
                        />
                      </div>
                    )}

                    <div>
                      <FieldLabel required>Department</FieldLabel>
                      <Controller
                        control={control}
                        name="additionalDepartments"
                        rules={{
                          validate: (v) =>
                            (v && v.length > 0) || "Department is required",
                        }}
                        render={({ field }) => (
                          <Combobox
                            data={departments}
                            displayField="label"
                            value={
                              departments.find((d) =>
                                (field.value || []).includes(d.id),
                              ) || null
                            }
                            onChange={(v: any) =>
                              field.onChange(v ? [v.id] : [])
                            }
                            placeholder="Search departments..."
                            searchFields={["label"]}
                            error={errors.additionalDepartments?.message as any}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
              <Button
                variant="outlined"
                color="secondary"
                type="button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editEmployee
                    ? "Update Employee"
                    : "Add Employee"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
