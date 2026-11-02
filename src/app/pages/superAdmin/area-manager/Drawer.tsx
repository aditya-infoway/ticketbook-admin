import { Fragment, useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Delete, Get, Put, Post } from "@/ApiHelper";
import { Button, Input, Textarea, Avatar } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { PreviewImg } from "@/components/shared/PreviewImg";
import type { AreaManager } from "./shared/types";
import { State } from "country-state-city";

// --- Options ---
const GENDER_OPTIONS = [
  { id: "Male", label: "Male" },
  { id: "Female", label: "Female" },
  { id: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

// All states and union territories of India, from the library
const STATE_OPTIONS = State.getStatesOfCountry("IN").map((s) => ({
  id: s.name,
  label: s.name,
}));

// --- Helpers ---
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

const toYmd = (picked?: Date) => {
  if (!picked) return "";
  const yyyy = picked.getFullYear();
  const mm = String(picked.getMonth() + 1).padStart(2, "0");
  const dd = String(picked.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

function getInitialForm(manager: AreaManager | null) {
  if (manager) {
    return {
      id: manager.id,
      name: manager.name || "",
      profilePhoto: manager.profilePhotoUrl || "",
      gender: manager.gender || "",
      status: manager.status || "Active",
      mobileNumber: manager.mobileNumber || "",
      alternateMobile: manager.alternateMobile || "",
      email: manager.email || "",
      address: manager.address || "",
      city: manager.city || "",
      state: manager.state || "",
      pinCode: manager.pinCode || "",
      areaManagerId: manager.areaManagerNo || "",
      areaId: manager.areaId || "",
      description: manager.description || "",
      joiningDate: manager.joiningDate || "",
      username: manager.username || "",
      password: "",
      confirmPassword: "",
    };
  }
  return {
    id: "",
    name: "",
    profilePhoto: "",
    gender: "",
    status: "Active",
    mobileNumber: "",
    alternateMobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    areaManagerId: "",
    areaId: "",
    description: "", // <-- Changed from designation to description
    joiningDate: "",
    username: "",
    password: "",
    confirmPassword: "",
  };
}

type FormValues = ReturnType<typeof getInitialForm>;

interface AreaManagerDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  manager: AreaManager | null;
  areas: { id: string; label: string }[];
}

export function AreaManagerDrawer({
  isOpen,
  close,
  onSaved,
  manager,
  areas = [],
}: AreaManagerDrawerProps) {
  const isEdit = !!manager;

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
  } = useForm<FormValues>({
    defaultValues: getInitialForm(manager),
  });

  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profilePhoto = watch("profilePhoto");

  const [nextNo, setNextNo] = useState("");

  useEffect(() => {
    if (!isOpen || isEdit) return;
    (async () => {
      try {
        const res: any = await Get(
          "superadmin/area-manager/next-number",
          { financialYearId: localStorage.getItem("financialYearId") },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.areaManagerNo);
      } catch {
        // preview only
      }
    })();
  }, [isOpen, isEdit]);

  useEffect(() => {
    if (isOpen) {
      reset(getInitialForm(manager));
      setPhoto(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
      clearErrors();
    }
  }, [isOpen, manager, reset, clearErrors]);

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);

      const fd = new FormData();
      const fields: Record<string, unknown> = {
        name: values.name,
        gender: values.gender,
        status: values.status,
        mobileNumber: values.mobileNumber,
        alternateMobile: values.alternateMobile,
        email: values.email,
        address: values.address,
        city: values.city,
        state: values.state,
        pinCode: values.pinCode,
        areaId: values.areaId,
        description: values.description,
        joiningDate: values.joiningDate,
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v));
      });
      if (photo) fd.append("profilePhoto", photo);

      let res: any;
      if (isEdit) {
        fd.append("areaManagerId", String(manager!.id));
        res = await Put("superadmin/area-manager/update", fd, true);
      } else {
        fd.append(
          "financialYearId",
          localStorage.getItem("financialYearId") || "",
        );
        res = await Post("superadmin/area-manager/create", fd, true);
      }

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to save area manager.");
        return;
      }

      toast.success(
        res.data.message ||
          (isEdit ? "Area Manager updated!" : "Area Manager created!"),
      );
      onSaved();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
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
              {isEdit ? "Edit Area Manager" : "Add Area Manager"}
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
                          <label className="flex cursor-pointer items-center justify-center">
                            <HiPencil className="size-3.5" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0])
                                  setPhoto(e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    }
                  />
                </div>

                {/* A. Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    A. Personal Information
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <FieldLabel>Area Manager ID</FieldLabel>
                      <Input
                        value={
                          isEdit
                            ? getValues("areaManagerId")
                            : nextNo || "Generating..."
                        }
                        readOnly
                        disabled
                        className="bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <FieldLabel required>Name</FieldLabel>
                      <Input
                        placeholder="Full Name"
                        {...register("name", {
                          required: "Name is required",
                          minLength: { value: 2, message: "Min 2 characters" },
                          maxLength: {
                            value: 50,
                            message: "Max 50 characters",
                          },
                        })}
                        error={errors.name?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel>Gender</FieldLabel>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <Combobox
                            data={GENDER_OPTIONS}
                            displayField="label"
                            value={
                              GENDER_OPTIONS.find(
                                (g) => g.id === field.value,
                              ) || null
                            }
                            onChange={(v: any) => field.onChange(v?.id || "")}
                            placeholder="Select Gender"
                            searchFields={["label"]}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <Listbox
                            data={STATUS_OPTIONS}
                            value={
                              STATUS_OPTIONS.find(
                                (s) => s.id === field.value,
                              ) || null
                            }
                            onChange={(v: any) =>
                              field.onChange(v?.id || "Active")
                            }
                            displayField="label"
                            placeholder="Select Status"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* B. Contact Information */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    B. Contact Information
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <FieldLabel required>Mobile Number</FieldLabel>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        {...register("mobileNumber", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid 10-digit number",
                          },
                        })}
                        error={errors.mobileNumber?.message}
                      />
                    </div>
                    <div>
                      <FieldLabel>Alternate Mobile</FieldLabel>
                      <Input
                        type="tel"
                        placeholder="9876543210"
                        {...register("alternateMobile", {
                          validate: (v) =>
                            !v ||
                            /^[6-9]\d{9}$/.test(v) ||
                            "Invalid 10-digit number",
                        })}
                        error={errors.alternateMobile?.message}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Email Address</FieldLabel>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email format",
                          },
                        })}
                        error={errors.email?.message}
                      />
                    </div>

                    <div>
                      <FieldLabel>State</FieldLabel>
                      <Controller
                        control={control}
                        name="state"
                        render={({ field }) => (
                          <Combobox
                            data={STATE_OPTIONS}
                            displayField="label"
                            value={
                              STATE_OPTIONS.find((s) => s.id === field.value) ||
                              null
                            }
                            onChange={(v: any) => field.onChange(v?.id || "")}
                            placeholder="Select State"
                            searchFields={["label"]}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <FieldLabel>City</FieldLabel>
                      <Input
                        placeholder="Enter city"
                        {...register("city", {
                          maxLength: {
                            value: 50,
                            message: "Max 50 characters",
                          },
                        })}
                        error={errors.city?.message}
                      />
                    </div>

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
                        error={errors.pinCode?.message}
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <FieldLabel>Address</FieldLabel>
                      <Input
                        placeholder="Enter full address"
                        {...register("address", {
                          maxLength: {
                            value: 250,
                            message: "Max 250 characters",
                          },
                        })}
                        error={errors.address?.message}
                      />
                    </div>
                  </div>
                </div>

                {/* C. Organization & Assignment */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    C. Organization & Assignment
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                            value={
                              areas.find((a) => a.id === field.value) || null
                            }
                            onChange={(v: any) => field.onChange(v?.id || "")}
                            placeholder="Select Area"
                            searchFields={["label"]}
                            error={errors.areaId?.message}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Joining Date</FieldLabel>
                      <Controller
                        control={control}
                        name="joiningDate"
                        rules={{
                          required: "Joining Date is required",
                          validate: (v) =>
                            !v ||
                            v <= toYmd(new Date()) ||
                            "Joining date cannot be in the future",
                        }}
                        render={({ field }) => (
                          <DatePicker
                            placeholder="Choose date..."
                            options={{ maxDate: "today" }}
                            value={field.value ? [new Date(field.value)] : []}
                            onChange={(dates: Date[]) =>
                              field.onChange(toYmd(dates?.[0]))
                            }
                            error={errors.joiningDate?.message}
                          />
                        )}
                      />
                    </div>
                    {/* 👇 Replaced Designation with Description */}
                    <div className="sm:col-span-3">
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        rows={3}
                        placeholder="Enter description..."
                        {...register("description", {
                          maxLength: {
                            value: 500,
                            message: "Max 500 characters",
                          },
                        })}
                        error={errors.description?.message}
                      />
                    </div>
                  </div>
                </div>

                {/* D. Login Information */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                    D. Login Information
                  </h4>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel required>Password</FieldLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...register("password", {
                          validate: (v) => {
                            if (!isEdit && !v) return "Password is required";
                            if (v && String(v).length < 4) return "Min 4 characters";
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
                            className="cursor-pointer text-gray-400 hover:text-gray-600"
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
                      <FieldLabel required>Confirm Password</FieldLabel>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        {...register("confirmPassword", {
                          validate: (v) =>
                            v === getValues("password") ||
                            "Passwords do not match",
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
                            className="cursor-pointer text-gray-400 hover:text-gray-600"
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
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
