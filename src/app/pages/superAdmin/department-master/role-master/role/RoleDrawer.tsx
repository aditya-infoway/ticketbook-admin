import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useMemo } from "react";

import { Combobox } from "@/components/shared/form/StyledCombobox";
import {
  MultiSelect,
  MultiSelectOption,
} from "@/components/shared/form/MultiSelect";
import { Button, Input, Textarea } from "@/components/ui";
import { Role } from "./data";
import {
  dataScopeOptions,
  departmentRestrictionOptions,
  roleStatusOptions,
} from "./Options";

export type DrawerMode = "create" | "edit" | "view";

interface Option {
  id: string;
  label: string;
}

interface RoleDrawerProps {
  isOpen: boolean;
  close: () => void;
  mode: DrawerMode;
  role: Role | null;
  /** saare roles (unique Code check ke liye) */
  roles: Role[];
  /** dynamic: Role Category dropdown */
  categories: Option[];
  /** dynamic: Department multi-select */
  departments: Option[];
  onSave: (role: Role) => void;
}

const TITLES: Record<DrawerMode, string> = {
  create: "Add Role",
  edit: "Edit Role",
  view: "View Role",
};

export function RoleDrawer({
  isOpen,
  close,
  mode,
  role,
  roles,
  categories,
  departments,
  onSave,
}: RoleDrawerProps) {
  const isView = mode === "view";
  const isEditing = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Role>({
    values: role ?? undefined,
  });

  const restriction = watch("departmentRestriction");

  // MultiSelect ko { id, name } format chahiye
  const departmentSelectOptions: MultiSelectOption[] = useMemo(
    () => departments.map((d) => ({ id: d.id, name: d.label })),
    [departments],
  );

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = (data: Role) => {
    // Role Code unique hona chahiye
    const codeTaken = roles.some(
      (r) =>
        r.roleCode.trim().toLowerCase() === data.roleCode.trim().toLowerCase() &&
        r.id !== (role?.id || ""),
    );
    if (codeTaken) {
      setError("roleCode", {
        type: "manual",
        message: "Role code already exists.",
      });
      return;
    }

    // Conditional: "Selected Departments" me kam se kam 1 department chahiye
    if (
      data.departmentRestriction === "selected" &&
      !data.departmentIds?.length
    ) {
      setError("departmentIds", {
        type: "manual",
        message: "Select at least one department.",
      });
      return;
    }

    onSave({
      ...data,
      roleCode: data.roleCode.trim(),
      roleName: data.roleName.trim(),
      // "All Departments" ho to purani selection clear
      departmentIds:
        data.departmentRestriction === "selected" ? data.departmentIds : [],
      id: role?.id || "",
    });
    handleClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">{TITLES[mode]}</h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full"
            >
              <XMarkIcon className="size-4.5 text-white" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Role Code (unique) */}
              <Input
                {...register("roleCode", {
                  required: "Role code is required",
                  onChange: () => clearErrors("roleCode"),
                })}
                label="Role Code"
                placeholder="e.g. SUPPORT_AGENT"
                disabled={isView}
                error={errors.roleCode?.message}
              />

              {/* Role Name */}
              <Input
                {...register("roleName", {
                  required: "Role name is required",
                })}
                label="Role Name"
                placeholder="Enter role name"
                disabled={isView}
                error={errors.roleName?.message}
              />

              {/* Role Category (dynamic) */}
              <Controller
                control={control}
                name="roleCategoryId"
                rules={{ required: "Role category is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={categories}
                    value={categories.find((c) => c.id === value) || null}
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="Role Category"
                    placeholder="Select category"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.roleCategoryId?.message}
                    inputProps={{ disabled: isView }}
                  />
                )}
              />

              {/* Description */}
              <Textarea
                {...register("description")}
                label="Description"
                placeholder="Short description (optional)"
                rows={3}
                disabled={isView}
              />

              {/* Default Data Scope */}
              <Controller
                control={control}
                name="defaultDataScope"
                rules={{ required: "Data scope is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={dataScopeOptions}
                    value={dataScopeOptions.find((o) => o.id === value) || null}
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="Default Data Scope"
                    placeholder="Select data scope"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.defaultDataScope?.message}
                    inputProps={{ disabled: isView }}
                  />
                )}
              />

              {/* Department Restriction */}
              <Controller
                control={control}
                name="departmentRestriction"
                rules={{ required: "Department restriction is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={departmentRestrictionOptions}
                    value={
                      departmentRestrictionOptions.find(
                        (o) => o.id === value,
                      ) || departmentRestrictionOptions[0]
                    }
                    onChange={(item: any) => {
                      onChange(item?.id || "all");
                      clearErrors("departmentIds");
                    }}
                    label="Department Restriction"
                    placeholder="Select restriction"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.departmentRestriction?.message}
                    inputProps={{ disabled: isView }}
                  />
                )}
              />

              {/* Department(s): sirf "Selected Departments" par */}
              {restriction === "selected" && (
                <Controller
                  control={control}
                  name="departmentIds"
                  render={({ field: { value, onChange } }) => {
                    const ids = value ?? [];
                    const selectedOptions = departmentSelectOptions.filter(
                      (o) => ids.includes(o.id),
                    );

                    return (
                      <div>
                        <label className="dark:text-dark-100 mb-1 block text-sm font-medium text-gray-700">
                          Department(s)
                        </label>

                        {/* View mode me select band */}
                        <div
                          className={
                            isView ? "pointer-events-none opacity-60" : ""
                          }
                        >
                          <MultiSelect
                            data={departmentSelectOptions}
                            displayField="name"
                            searchFields={["name"]}
                            value={selectedOptions}
                            onChange={(selected) => {
                              onChange(selected.map((s) => s.id));
                              clearErrors("departmentIds");
                            }}
                            placeholder="Select departments..."
                          />
                        </div>

                        {errors.departmentIds?.message && (
                          <p className="text-error mt-1 text-xs">
                            {errors.departmentIds.message as string}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              )}

              {/* Status */}
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={roleStatusOptions}
                    value={
                      roleStatusOptions.find((item) => item.id === value) ||
                      roleStatusOptions[0]
                    }
                    onChange={(item: any) => onChange(item?.id || "Active")}
                    label="Status"
                    placeholder="Select status"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.status?.message}
                    inputProps={{ disabled: isView }}
                  />
                )}
              />
            </div>

            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
              <Button type="button" onClick={handleClose}>
                {isView ? "Close" : "Cancel"}
              </Button>
              {!isView && (
                <Button type="submit" color="primary">
                  {isEditing ? "Update" : "Create"}
                </Button>
              )}
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}