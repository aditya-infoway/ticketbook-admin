// src/app/pages/superAdmin/contractor-master/contractor-department/ContractorDepartmentDrawer.tsx
import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { Get, Post, Put } from "@/ApiHelper";
import { Button, Input, Textarea } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import type { ContractorDepartment } from "../shared/types";

interface ContractorDepartmentDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editDepartment: ContractorDepartment | null;
}

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function ContractorDepartmentDrawer({
  isOpen,
  close,
  onSaved,
  editDepartment,
}: ContractorDepartmentDrawerProps) {
  // 👇 Initialize state directly from props (No useEffect needed!)
  const [form, setForm] = useState(() => ({
    departmentName: editDepartment?.departmentName || "",
    departmentCode: editDepartment?.departmentCode || "",
    description: editDepartment?.description || "",
    status: editDepartment?.status || "Active",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextNo, setNextNo] = useState("");

  // 👇 Only use useEffect for the async API call
  useEffect(() => {
    if (!isOpen || editDepartment) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/contractor-department/next-number",
          { financialYearId: localStorage.getItem("financialYearId") },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.contractorDepartmentNo);
      } catch {
        console.error("Failed to get next number");
      }
    })();
  }, [isOpen, editDepartment]);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.departmentName.trim())
      next.departmentName = "Department Name is required";
    if (!form.departmentCode.trim())
      next.departmentCode = "Department Code is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);

      const payload = {
        departmentName: form.departmentName.trim(),
        departmentCode: form.departmentCode.trim(),
        description: form.description.trim(),
        status: form.status,
      };

      let res: any;
      if (editDepartment) {
        res = await Put(
          "superadmin/contractor-department/update",
          { ...payload, contractorDepartmentId: editDepartment.id },
          false,
        );
      } else {
        res = await Post(
          "superadmin/contractor-department/create",
          {
            ...payload,
            financialYearId: localStorage.getItem("financialYearId"),
          },
          false,
        );
      }

      if (res?.data?.success) {
        toast.success(
          res.data.message ||
            (editDepartment ? "Department updated" : "Department created"),
        );
        onSaved();
        close();
      } else {
        toast.error(res?.data?.message || "Failed to save department.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const req = (text: string) => (
    <>
      {text}
      <span className="ml-0.5 text-red-500">*</span>
    </>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={close}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[40%]"
        >
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">
              {editDepartment ? "Edit Department" : "Add Department"}
            </h3>
            <button
              type="button"
              onClick={close}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Department ID"
                value={
                  editDepartment?.departmentNo || nextNo || "Generating..."
                }
                readOnly
                disabled
              />
              <Input
                label={req("Department Name")}
                placeholder="Enter department name"
                value={form.departmentName}
                onChange={(e: any) => sf("departmentName", e.target.value)}
                error={errors.departmentName}
              />
              <Input
                label={req("Department Code")}
                placeholder="Enter unique code"
                value={form.departmentCode}
                onChange={(e: any) => sf("departmentCode", e.target.value)}
                error={errors.departmentCode}
              />
              <div>
                <FieldLabel required>Status</FieldLabel>
                <Listbox
                  data={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.id === form.status) || null
                  }
                  onChange={(s: any) => sf("status", s?.id || "Active")}
                  displayField="label"
                  placeholder="Select status"
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Enter department description"
                rows={4}
                value={form.description}
                onChange={(e: any) => sf("description", e.target.value)}
              />
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={close}
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
                : editDepartment
                  ? "Update Department"
                  : "Add Department"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
