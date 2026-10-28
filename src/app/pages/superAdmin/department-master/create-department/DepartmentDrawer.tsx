import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Get } from "@/ApiHelper";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button, Input, Textarea } from "@/components/ui";
import { Department } from "./data";
import { departmentScopeOptions, departmentStatusOptions } from "./options";

interface Option {
  id: string;
  label: string;
  status?: string;
}

export type DrawerMode = "create" | "edit" | "view";

interface DepartmentDrawerProps {
  isOpen: boolean;
  close: () => void;
  mode?: DrawerMode;
  department: Department | null;
  departments: Department[];
  types: Option[];
  onSave: (department: Department) => void;
}

const NONE: Option = { id: "", label: "None" };

export function DepartmentDrawer({
  isOpen,
  close,
  mode = "create",
  department,
  departments,
  types,
  onSave,
}: DepartmentDrawerProps) {
  const isEditing = Boolean(department?.id);
  const isView = mode === "view";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Department>({
    values: department ?? undefined,
  });

  const typeOptions: Option[] = useMemo(
    () =>
      types.filter((t) => t.status === "Active" || t.id === department?.typeId),
    [types, department?.typeId],
  );
  // Parent Department: every other department (a department can't be its own parent)
  const parentOptions: Option[] = useMemo(
    () => [
      NONE,
      ...departments
        .filter((d) => d.id !== department?.id)
        .map((d) => ({ id: d.id, label: d.name })),
    ],
    [departments, department?.id],
  );
  const [nextNo, setNextNo] = useState("");

  useEffect(() => {
    if (!isOpen || isEditing) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res = await Get(
          "superadmin/department/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.departmentNo);
      } catch (error) {
        console.error("Department number error:", error);
      }
    })();
  }, [isOpen, isEditing]);
  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = (data: Department) => {
    // Department Code must be unique
    const codeTaken = departments.some(
      (d) =>
        d.code.trim().toLowerCase() === data.code.trim().toLowerCase() &&
        d.id !== (department?.id || ""),
    );
    if (codeTaken) {
      setError("code", {
        type: "manual",
        message: "Department code already exists.",
      });
      return;
    }

    onSave({
      ...data,
      code: data.code.trim(),
      name: data.name.trim(),
      id: department?.id || "",
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
            <h3 className="text-lg font-semibold text-white">
              {isView
                ? "View Department"
                : isEditing
                  ? "Edit Department"
                  : "Add Department"}
            </h3>
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
              {/* 1. Department ID: auto (prefix + FY), read only */}
              <Input
                label="Department ID"
                value={department?.departmentNo || nextNo || "Generating..."}
                readOnly
                disabled
              />

              {/* 2. Department Code */}
              {/* 2. Department Code */}
              <Input
                {...register("code", {
                  required: "Department code is required",
                  onChange: () => clearErrors("code"),
                })}
                label="Department Code"
                placeholder="e.g. DEP-IT"
                error={errors.code?.message}
                disabled={isView}
              />

              {/* 3. Department Name */}
              <Input
                {...register("name", {
                  required: "Department name is required",
                })}
                label="Department Name"
                placeholder="Enter department name"
                error={errors.name?.message}
                disabled={isView}
              />

              {/* 4. Department Description */}
              <Textarea
                {...register("description")}
                label="Department Description"
                placeholder="Enter description (optional)"
                rows={3}
                disabled={isView}
              />

              {/* 5. Department Type */}
              <Controller
                control={control}
                name="typeId"
                rules={{ required: "Department type is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={typeOptions}
                    value={
                      typeOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item: any) => onChange(item?.id ?? "")}
                    label="Department Type"
                    placeholder="Select type"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.typeId?.message}
                    disabled={isView}
                  />
                )}
              />

              {/* 6. Parent Department */}
              <Controller
                control={control}
                name="parentId"
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={parentOptions}
                    value={
                      parentOptions.find((item) => item.id === (value || "")) ||
                      NONE
                    }
                    onChange={(item: any) => onChange(item?.id ?? "")}
                    label="Parent Department"
                    placeholder="None"
                    displayField="label"
                    searchFields={["label"]}
                    disabled={isView}
                  />
                )}
              />

              {/* 7. Department Scope */}
              <Controller
                control={control}
                name="scope"
                rules={{ required: "Department scope is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={departmentScopeOptions}
                    value={
                      departmentScopeOptions.find(
                        (item) => item.id === value,
                      ) || null
                    }
                    onChange={(item: any) => onChange(item?.id ?? "")}
                    label="Department Scope"
                    placeholder="Select scope"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.scope?.message}
                    disabled={isView}
                  />
                )}
              />

              {/* 9. Display Order */}
              <Input
                {...register("displayOrder", {
                  validate: (v) =>
                    !v || /^\d+$/.test(String(v)) || "Enter a whole number",
                })}
                label="Display Order"
                type="number"
                placeholder="e.g. 1"
                error={errors.displayOrder?.message}
                disabled={isView}
              />
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={departmentStatusOptions}
                    value={
                      departmentStatusOptions.find(
                        (item) => item.id === value,
                      ) || departmentStatusOptions[0]
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Department Status"
                    placeholder="Select status"
                    displayField="label"
                    error={errors.status?.message}
                    disabled={isView}
                    {...rest}
                  />
                )}
              />
              {/* 10-12 system fields: read only, only when editing */}
              {/* {isEditing && (
                <div className="dark:bg-dark-600 space-y-1 rounded-lg bg-gray-50 p-3 text-xs">
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {department?.createdBy || "—"} •{" "}
                    {formatDateTime(department?.createdAt || "")}
                  </p>
                  <p>
                    <span className="font-medium">Updated:</span>{" "}
                    {department?.updatedBy || "—"} •{" "}
                    {formatDateTime(department?.updatedAt || "")}
                  </p>
                </div>
              )} */}
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
