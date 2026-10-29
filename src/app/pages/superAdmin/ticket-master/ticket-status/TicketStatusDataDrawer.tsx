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
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import type { TicketStatus } from "../shared/types";

interface TicketStatusDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editStatus: TicketStatus | null;
}

interface Opt {
  id: string;
  label: string;
}

const STATUS_OPTIONS: Opt[] = [
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
    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function getInitialForm(editStatus: TicketStatus | null) {
  if (editStatus) {
    return {
      id: editStatus.id,
      statusCode: editStatus.statusCode,
      statusName: editStatus.statusName,
      description: editStatus.description,
      displayOrder: editStatus.displayOrder,
      status: editStatus.status,
    };
  }

  return {
    id: "",
    statusCode: "",
    statusName: "",
    description: "",
    displayOrder: 1,
    status: "Active" as const,
  };
}

export function TicketStatusDataDrawer({
  isOpen,
  close,
  onSaved,
  editStatus,
}: TicketStatusDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editStatus));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextNo, setNextNo] = useState("");

  // Status ID preview (new records only)
  useEffect(() => {
    if (!isOpen || editStatus) return;

    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/ticket-status/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) {
          setNextNo(res.data.data.ticketStatusNo);
        }
      } catch (error) {
        console.error("Status number error:", error);
      }
    })();
  }, [isOpen, editStatus]);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleClose = () => close();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.statusCode.trim()) next.statusCode = "Status code is required";
    if (!form.statusName.trim()) next.statusName = "Status name is required";
    if (form.displayOrder === undefined || form.displayOrder === null) {
      next.displayOrder = "Display order is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        statusCode: form.statusCode.trim(),
        statusName: form.statusName.trim(),
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder),
        status: form.status,
      };

      if (editStatus) {
        await Put(
          "superadmin/ticket-status/update",
          { ...payload, ticketStatusId: editStatus.id },
          false,
        );
      } else {
        await Post(
          "superadmin/ticket-status/create",
          {
            ...payload,
            financialYearId: localStorage.getItem("financialYearId"),
          },
          false,
        );
      }

      toast.success(
        editStatus
          ? "Status updated successfully"
          : "Status added successfully",
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
      <Dialog as="div" className="relative z-[110]" onClose={handleClose}>
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
          <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">
              {editStatus ? "Edit Ticket Status" : "Add Ticket Status"}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Status ID (Auto) */}
              <div>
                <FieldLabel>Status ID</FieldLabel>
                <Input
                  value={
                    editStatus?.ticketStatusNo || nextNo || "Generating..."
                  }
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              {/* Status Code */}
              <div>
                <FieldLabel required>Status Code</FieldLabel>
                <Input
                  placeholder="Enter status code"
                  value={form.statusCode}
                  onChange={(e: any) => sf("statusCode", e.target.value)}
                />
                {errors.statusCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.statusCode}
                  </p>
                )}
              </div>

              {/* Status Name */}
              <div className="sm:col-span-2">
                <FieldLabel required>Status Name</FieldLabel>
                <Input
                  placeholder="Enter status name"
                  value={form.statusName}
                  onChange={(e: any) => sf("statusName", e.target.value)}
                />
                {errors.statusName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.statusName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  rows={3}
                  placeholder="Optional description..."
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                />
              </div>

              {/* Display Order */}
              <div>
                <FieldLabel required>Display Order</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter display order"
                  value={form.displayOrder}
                  onChange={(e: any) =>
                    sf("displayOrder", Number(e.target.value))
                  }
                />
                {errors.displayOrder && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.displayOrder}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <FieldLabel required>Status</FieldLabel>
                <Listbox
                  data={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.id === form.status) || null
                  }
                  onChange={(v: any) => sf("status", v?.id || "Active")}
                  displayField="label"
                  placeholder="Select status"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
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
                : editStatus
                  ? "Update Status"
                  : "Add Status"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
