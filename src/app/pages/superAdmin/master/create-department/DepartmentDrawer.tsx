import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useState } from "react";
import { Get } from "@/ApiHelper";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input} from "@/components/ui";
import { Department } from "./data";
import {  departmentStatusOptions } from "./options";

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


export function DepartmentDrawer({
  isOpen,
  close,
  mode = "create",
  department,
  onSave,
}: DepartmentDrawerProps) {
  const isEditing = Boolean(department?.id);
  const isView = mode === "view";

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<Department>({
    values: department ?? undefined,
  });

 
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
    onSave({
      ...data,
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
