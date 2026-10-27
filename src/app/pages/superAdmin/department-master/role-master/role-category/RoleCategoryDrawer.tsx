import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Textarea } from "@/components/ui";
import { RoleCategory } from "./data";
import { roleCategoryStatusOptions } from "./Options";

export type DrawerMode = "create" | "edit" | "view";

interface RoleCategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  mode: DrawerMode;
  roleCategory: RoleCategory | null;
  /** saari categories (unique Code check ke liye) */
  categories: RoleCategory[];
  onSave: (roleCategory: RoleCategory) => void;
}

const TITLES: Record<DrawerMode, string> = {
  create: "Add Role Category",
  edit: "Edit Role Category",
  view: "View Role Category",
};

export function RoleCategoryDrawer({
  isOpen,
  close,
  mode,
  roleCategory,
  categories,
  onSave,
}: RoleCategoryDrawerProps) {
  const isView = mode === "view";
  const isEditing = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RoleCategory>({
    values: roleCategory ?? undefined,
  });

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = (data: RoleCategory) => {
    // Category Code unique hona chahiye
    const codeTaken = categories.some(
      (c) =>
        c.roleCategoryCode.trim().toLowerCase() ===
          data.roleCategoryCode.trim().toLowerCase() &&
        c.id !== (roleCategory?.id || ""),
    );
    if (codeTaken) {
      setError("roleCategoryCode", {
        type: "manual",
        message: "Category code already exists.",
      });
      return;
    }

    onSave({
      ...data,
      roleCategoryCode: data.roleCategoryCode.trim(),
      roleCategoryName: data.roleCategoryName.trim(),
      id: roleCategory?.id || "",
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
              {/* Category Code (unique) */}
              <Input
                {...register("roleCategoryCode", {
                  required: "Category code is required",
                  onChange: () => clearErrors("roleCategoryCode"),
                })}
                label="Role Category Code"
                placeholder="e.g. SUPPORT"
                disabled={isView}
                error={errors.roleCategoryCode?.message}
              />

              {/* Category Name */}
              <Input
                {...register("roleCategoryName", {
                  required: "Category name is required",
                })}
                label="Role Category Name"
                placeholder="Enter role category name"
                disabled={isView}
                error={errors.roleCategoryName?.message}
              />

              {/* Description */}
              <Textarea
                {...register("description")}
                label="Description"
                placeholder="Short description (optional)"
                rows={3}
                disabled={isView}
              />

              {/* Display Order */}
              <Input
                {...register("displayOrder", {
                  validate: (v) =>
                    !v || /^\d+$/.test(String(v)) || "Enter a whole number",
                })}
                label="Display Order"
                type="number"
                placeholder="e.g. 1"
                disabled={isView}
                error={errors.displayOrder?.message}
              />

              {/* Status */}
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={roleCategoryStatusOptions}
                    value={
                      roleCategoryStatusOptions.find(
                        (item) => item.id === value,
                      ) || roleCategoryStatusOptions[0]
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Status"
                    placeholder="Select status"
                    displayField="label"
                    error={errors.status?.message}
                    inputProps={{ disabled: isView }}
                    {...rest}
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