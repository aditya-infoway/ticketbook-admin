import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { Get, Post } from "@/ApiHelper";
import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";

export interface TicketFormData {
  employee: {
    employeeName: string;
    employeeCode: string;
    branchName: string;
    contactNumber: string;
  };
  departments: { id: string; label: string }[];
  categories: { id: string; label: string; departmentId: string }[];
  statuses: { id: string; label: string }[];
}

interface TicketDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  formData: TicketFormData | null;
}

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
 
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

export function TicketDataDrawer({
  isOpen,
  close,
  onSaved,
  formData,
}: TicketDrawerProps) {
  const [form, setForm] = useState({
    departmentId: "",
    categoryId: "",
    subject: "",
    issueDescription: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [preview, setPreview] = useState({ ticketNo: "", ticketCode: "" });

  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const res: any = await Get("employee/ticket/next-number", {}, false);
        if (res?.data?.success) {
          setPreview(res.data.data);
        }
      } catch {
        // preview only
      }
    })();
  }, [isOpen]);

  const emp = formData?.employee;
  const departments = formData?.departments || [];
  const categoryOptions = useMemo(
    () =>
      (formData?.categories || []).filter(
        (c) => c.departmentId === form.departmentId,
      ),
    [formData, form.departmentId],
  );

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    e.target.value = "";
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      toast.error("Only PNG, JPG or PDF files are allowed.");
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      toast.error("Attachment must be 5MB or smaller.");
      return;
    }
    setFile(picked);
  };

  const handleClose = () => close();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.departmentId) next.departmentId = "Department is required";
    if (!form.categoryId) next.categoryId = "Category is required";
    if (!form.subject.trim()) next.subject = "Subject is required";
    if (!form.issueDescription.trim())
      next.issueDescription = "Description is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("departmentId", form.departmentId);
      fd.append("categoryId", form.categoryId);
      fd.append("subject", form.subject.trim());
      fd.append("issueDescription", form.issueDescription.trim());
      if (file) fd.append("attachment", file);

      const res: any = await Post("employee/ticket/create", fd, true);
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to create ticket");
        return;
      }

      toast.success(res.data.message || "Ticket created successfully");
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
            <h3 className="text-base font-bold">Create New Ticket</h3>
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
            <div className="space-y-6">
              {/* Auto-Fetched User Info (Read-Only) */}
              <div className="dark:border-dark-600 dark:bg-dark-800/50 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="dark:text-dark-300 mb-3 text-xs font-semibold text-gray-500 uppercase">
                  Employee Details (Auto-fetched)
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Ticket ID */}
                  <div>
                    <span className="block text-xs text-gray-400">
                      Ticket ID
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.ticketNo || "Generating..."}
                    </span>
                  </div>

                  {/* Ticket Number */}
                  <div>
                    <span className="block text-xs text-gray-400">
                      Ticket Number
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {preview.ticketCode || "Generating..."}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-400">
                      Employee Name
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {emp?.employeeName || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">
                      Employee Code
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {emp?.employeeCode || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">Branch</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {emp?.branchName || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400">
                      Contact Number
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {emp?.contactNumber || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  Issue Details
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Department */}
                  <div>
                    <FieldLabel required>Department</FieldLabel>
                    <Combobox
                      data={departments}
                      displayField="label"
                      value={
                        departments.find((d) => d.id === form.departmentId) ||
                        null
                      }
                      onChange={(v: any) => {
                        sf("departmentId", v?.id || "");
                        sf("categoryId", "");
                      }}
                      placeholder="Select department"
                      searchFields={["label"]}
                    />
                    {errors.departmentId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.departmentId}
                      </p>
                    )}
                  </div>

                  {/* Ticket Category */}
                  <div>
                    <FieldLabel required>Ticket Category</FieldLabel>
                    <Combobox
                      data={categoryOptions}
                      displayField="label"
                      value={
                        categoryOptions.find((c) => c.id === form.categoryId) ||
                        null
                      }
                      onChange={(v: any) => sf("categoryId", v?.id || "")}
                      placeholder="Select category"
                      searchFields={["label"]}
                    />
                    {errors.categoryId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.categoryId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticket Subject */}
                <div>
                  <FieldLabel required>Ticket Subject</FieldLabel>
                  <Input
                    placeholder="Brief summary of the issue"
                    value={form.subject}
                    onChange={(e: any) => sf("subject", e.target.value)}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Issue Description */}
                <div>
                  <FieldLabel required>Issue Description</FieldLabel>
                  <textarea
                    className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                    rows={5}
                    placeholder="Describe the issue in detail..."
                    value={form.issueDescription}
                    onChange={(e) => sf("issueDescription", e.target.value)}
                  />
                  {errors.issueDescription && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.issueDescription}
                    </p>
                  )}
                </div>

                {/* Attachment */}
                <div>
                  <FieldLabel>Attachment (Optional)</FieldLabel>
                  <label className="dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
                    <PaperClipIcon className="mb-2 h-6 w-6 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {file ? file.name : "Click to upload a file"}
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG or PDF up to 5MB
                    </span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      className="hidden"
                      onChange={onPickFile}
                    />
                  </label>
                </div>
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
              {submitting ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
