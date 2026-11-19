import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment } from "react";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button, Input } from "@/components/ui";
import { Role } from "./data";
import { roleStatusOptions } from "./Options";

export type DrawerMode = "create" | "edit" | "view";

interface RoleDrawerProps {
  isOpen: boolean;
  close: () => void;
  mode: DrawerMode;
  role: Role | null;
  /** saare roles (unique Code check ke liye) */
  roles: Role[];
  departments: { id: string; label: string }[];
  /** dynamic: Role Category dropdown */
  nextRoleNo?: string;
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
  departments,
  nextRoleNo,
  onSave,
}: RoleDrawerProps) {
  const isView = mode === "view";
  const isEditing = mode === "edit";
  const displayRoleNo =
    mode === "create" ? (nextRoleNo ?? "") : (role?.roleNo ?? "");

  const safeDepartments = departments ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<Role>({
    values: role ?? undefined,
  });

  const handleClose = () => {
    // Reset to the current role values, or empty defaults if creating
    reset(
      role ?? {
        id: "",
        departmentId: "",
        roleName: "",
        status: "Active",
        roleNo: "",
        departmentName: "",
        createdAt: "",
      },
    );
    clearErrors();
    close();
  };

  const onSubmit = (data: Role) => {
    // Role Code unique hona chahiye

    onSave({
      ...data,
      roleName: data.roleName.trim(),
      // "All Departments" ho to purani selection clear
      id: role?.id || "",
      departmentId: data.departmentId || "",
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
              <Input
                label="Role ID"
                value={displayRoleNo}
                placeholder={mode === "create" ? "Generating..." : "—"}
                disabled
                readOnly
              />

              <div>
                <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                  Department <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="departmentId"
                  rules={{ required: "Department is required" }}
                  render={({ field }) => (
                    <Combobox
                      data={safeDepartments}
                      displayField="label"
                      value={
                        // 👇 Convert both to String() to avoid number vs string mismatch
                        safeDepartments.find(
                          (department) =>
                            String(department.id) === String(field.value ?? ""),
                        ) || null
                      }
                      onChange={(department: any) =>
                        field.onChange(department?.id || "")
                      }
                      placeholder="Select department..."
                      searchFields={["label"]}
                      inputProps={{ disabled: isView }}
                      error={errors.departmentId?.message}
                    />
                  )}
                />
              </div>

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
