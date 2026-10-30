// src/app/pages/superAdmin/contractor-master/contractor-registration/ContractorDrawer.tsx
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
  DocumentArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Get, Post, Put } from "@/ApiHelper";
import { Button, Input, Textarea } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import type { Contractor } from "../shared/types";

interface ContractorDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editContractor: Contractor | null;
}

interface Opt {
  id: string;
  label: string;
  regionId?: string;
}

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

const PHONE_REGEX = /^[0-9]{10}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

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

function getInitialForm(editContractor: Contractor | null) {
  if (editContractor) {
    return {
      contractorName: editContractor.contractorName || "",
      companyName: editContractor.companyName || "",
      mobileNumber: editContractor.mobileNumber || "",
      email: editContractor.email || "",
      specialization: editContractor.specialization || "",
      address: editContractor.address || "",
      areaId: editContractor.areaId || "",
      branchId: editContractor.branchId || "",
      status: editContractor.status || "Active",
      password: "",
      confirmPassword: "",
    };
  }

  return {
    contractorName: "",
    companyName: "",
    mobileNumber: "",
    email: "",
    specialization: "",
    address: "",
    areaId: "",
    branchId: "",
    status: "Active",
    password: "",
    confirmPassword: "",
  };
}

type FormValues = ReturnType<typeof getInitialForm>;

export function ContractorDrawer({
  isOpen,
  close,
  onSaved,
  editContractor,
}: ContractorDrawerProps) {
  const initial = useMemo(
    () => getInitialForm(editContractor),
    [editContractor],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: initial });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dropdowns
  const [areas, setAreas] = useState<Opt[]>([]);
  const [branches, setBranches] = useState<Opt[]>([]);

  // Files
  const [files, setFiles] = useState<File[]>([]);
  const [existingDocs, setExistingDocs] = useState<string[]>(
    editContractor?.documents || [],
  );

  // Fetch dropdowns
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const [areaRes, branchRes]: any[] = await Promise.all([
          Get("superadmin/region/list", {}, false),
          Get("superadmin/branch/list", {}, false),
        ]);

        const rows = (res: any): any[] => res?.data?.data ?? [];

        setAreas(
          rows(areaRes)
            .filter(
              (r) =>
                r.status === "Active" || String(r.regionId) === initial.areaId,
            )
            .map((r) => ({ id: String(r.regionId), label: r.regionName })),
        );

        setBranches(
          rows(branchRes)
            .filter(
              (r) =>
                r.status === "Active" ||
                String(r.branchId) === initial.branchId,
            )
            .map((r) => ({
              id: String(r.branchId),
              label: r.branchName,
              regionId: String(r.regionId ?? ""),
            })),
        );
      } catch (error) {
        console.error("Dropdown error:", error);
        toast.error("Failed to load dropdown data");
      }
    })();
  }, [isOpen, initial]);

  const handleClose = () => {
    reset();
    clearErrors();
    setFiles([]);
    close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingDoc = (index: number) =>
    setExistingDocs((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const fd = new FormData();

      Object.entries(values).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, String(v));
      });

      files.forEach((file) => fd.append("documents", file));
      if (!editContractor) {
        fd.append(
          "financialYearId",
          localStorage.getItem("financialYearId") || "",
        );
      }
      if (editContractor) {
        fd.append("existingDocuments", JSON.stringify(existingDocs));
      }

      let res: any;
      if (editContractor) {
        fd.append("contractorId", editContractor.id);
        res = await Put("superadmin/contractor/update", fd, true);
      } else {
        res = await Post("superadmin/contractor/register", fd, true);
      }

      if (res?.data?.success) {
        toast.success(
          res.data.message ||
            (editContractor
              ? "Contractor updated successfully"
              : "Contractor registered successfully"),
        );
        onSaved();
        handleClose();
      } else {
        toast.error(res?.data?.message || "Failed to save contractor");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAreaId = watch("areaId");
  // show only branches of the chosen area (all, if the list has no region info)
  const branchOptions = branches.filter(
    (b) => !selectedAreaId || !b.regionId || b.regionId === selectedAreaId,
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
              {editContractor ? "Edit Contractor" : "Register Contractor"}
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
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Contractor Name</FieldLabel>
                  <Input
                    placeholder="Enter contractor name"
                    {...register("contractorName", {
                      required: "Contractor name is required",
                    })}
                    error={errors.contractorName?.message}
                  />
                </div>

                <div>
                  <FieldLabel>Company Name</FieldLabel>
                  <Input
                    placeholder="Enter company name"
                    {...register("companyName")}
                    error={errors.companyName?.message}
                  />
                </div>

                <div>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    {...register("mobileNumber", {
                      required: "Mobile number is required",
                      pattern: {
                        value: PHONE_REGEX,
                        message: "Enter 10 digits",
                      },
                    })}
                    error={errors.mobileNumber?.message}
                  />
                </div>

                <div>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...register("email", {
                      pattern: {
                        value: EMAIL_REGEX,
                        message: "Enter a valid email",
                      },
                    })}
                    error={errors.email?.message}
                  />
                </div>

                <div>
                  <FieldLabel>Specialization</FieldLabel>
                  <Input
                    placeholder="e.g. Electrical, Plumbing"
                    {...register("specialization")}
                    error={errors.specialization?.message}
                  />
                </div>

                <div>
                  <FieldLabel required>Status</FieldLabel>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Listbox
                        data={STATUS_OPTIONS}
                        value={
                          STATUS_OPTIONS.find((s) => s.id === field.value) ||
                          null
                        }
                        onChange={(s: any) => field.onChange(s?.id || "Active")}
                        displayField="label"
                        placeholder="Select status"
                      />
                    )}
                  />
                </div>

                <div>
                  <FieldLabel required>Area</FieldLabel>
                  <Controller
                    control={control}
                    name="areaId"
                    rules={{ required: "Area is required" }}
                    render={({ field }) => (
                      <Combobox
                        data={areas}
                        displayField="label"
                        value={areas.find((a) => a.id === field.value) || null}
                        onChange={(v: any) => {
                          field.onChange(v?.id || "");
                          setValue("branchId", "");
                        }}
                        placeholder="Select area"
                        searchFields={["label"]}
                        error={errors.areaId?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <FieldLabel required>Branch</FieldLabel>
                  <Controller
                    control={control}
                    name="branchId"
                    rules={{ required: "Branch is required" }}
                    render={({ field }) => (
                      <Combobox
                        data={branchOptions}
                        displayField="label"
                        value={
                          branches.find((b) => b.id === field.value) || null
                        }
                        onChange={(v: any) => field.onChange(v?.id || "")}
                        placeholder="Select branch"
                        searchFields={["label"]}
                        error={errors.branchId?.message}
                      />
                    )}
                  />
                </div>

                {/* 👇 PASSWORD FIELDS WITH ICONS ONLY */}
                <div>
                  <FieldLabel required={!editContractor}>Password</FieldLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={
                      editContractor
                        ? "Leave blank to keep current"
                        : "Enter password"
                    }
                    {...register("password", {
                      validate: (v) => {
                        if (!editContractor && !v)
                          return "Password is required";
                        if (v && v.length < 6)
                          return "Password must be at least 6 characters";
                        return true;
                      },
                    })}
                    prefix={<LockClosedIcon className="size-5 text-gray-400" />}
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
                  <FieldLabel required={!editContractor}>
                    Confirm Password
                  </FieldLabel>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={
                      editContractor
                        ? "Leave blank to keep current"
                        : "Re-enter password"
                    }
                    {...register("confirmPassword", {
                      validate: (v) => {
                        const pw = getValues("password");
                        if (!pw && !v) return true;
                        if (!v) return "Confirm password is required";
                        return v === pw || "Passwords do not match";
                      },
                    })}
                    prefix={<LockClosedIcon className="size-5 text-gray-400" />}
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

                <div className="sm:col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <Textarea
                    placeholder="Enter full address"
                    rows={3}
                    {...register("address")}
                    error={errors.address?.message}
                  />
                </div>

                {/* Documents */}
                <div className="mt-2 sm:col-span-2">
                  <FieldLabel>Documents (Optional)</FieldLabel>
                  <label className="dark:border-dark-600 dark:bg-dark-700/50 hover:bg-primary-50 dark:hover:bg-dark-700 flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors">
                    <DocumentArrowUpIcon className="mb-1 size-6 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Click to upload documents
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>

                  {existingDocs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        Uploaded Documents:
                      </p>
                      {existingDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="dark:border-dark-600 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                        >
                          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                            {doc}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExistingDoc(idx)}
                            className="text-primary-500 hover:text-primary-700 cursor-pointer"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500">
                        New Files to Upload:
                      </p>
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="border-primary-200 bg-primary-50 dark:border-primary-900/50 dark:bg-primary-900/20 flex items-center justify-between rounded-lg border p-2"
                        >
                          <span className="text-primary-800 dark:text-primary-300 truncate text-sm">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editContractor
                    ? "Update Contractor"
                    : "Register Contractor"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
