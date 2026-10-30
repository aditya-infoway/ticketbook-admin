// TicketStatusDrawer.tsx  (branch panel: ticket details (read-only) + status manage)
import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { Put } from "@/ApiHelper";
import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";

export interface StatusTicket {
  id: string;
  ticketNumber: string;
  ticketNo?: string;
  subject: string;
  issueDescription?: string;
  employeeName?: string;
  employeeCode?: string;
  branchName?: string;
  contactNumber?: string;
  departmentName?: string;
  categoryName?: string;
  attachmentUrl?: string;
  status: string;
  statusId: string;
}

interface Props {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  ticket: StatusTicket | null;
  statuses: { id: string; label: string }[];
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="block text-xs text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {value || "-"}
      </span>
    </div>
  );
}

export function TicketStatusDrawer({
  isOpen,
  close,
  onSaved,
  ticket,
  statuses,
}: Props) {
  const [statusId, setStatusId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !ticket) return;
    setStatusId(ticket.statusId || "");
    setError("");
  }, [isOpen, ticket]);

  const onSubmit = async () => {
    if (!ticket) return;
    if (!statusId) {
      setError("Status is required");
      return;
    }
    if (statusId === ticket.statusId) {
      setError("Please select a different status");
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await Put(
        `superadmin/ticket/status/${ticket.id}`,
        { ticketStatusId: statusId },
        false,
      );
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to update status");
        return;
      }
      toast.success(res.data.message || "Status updated successfully");
      onSaved();
      close();
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
      <Dialog as="div" className="relative z-[110]" onClose={close}>
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
            <h3 className="text-base font-bold">Ticket Details & Status</h3>
            <button
              type="button"
              onClick={close}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="space-y-6">
              {/* Employee + ticket info (read-only) */}
              <div className="dark:border-dark-600 dark:bg-dark-800/50 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="dark:text-dark-300 mb-3 text-xs font-semibold text-gray-500 uppercase">
                  Ticket Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="Ticket ID" value={ticket?.ticketNo} />
                  <Info label="Ticket Number" value={ticket?.ticketNumber} />
                  <Info label="Employee Name" value={ticket?.employeeName} />
                  <Info label="Employee Code" value={ticket?.employeeCode} />
                  <Info label="Branch" value={ticket?.branchName} />
                  <Info label="Contact Number" value={ticket?.contactNumber} />
                  <Info label="Department" value={ticket?.departmentName} />
                  <Info label="Category" value={ticket?.categoryName} />
                </div>
              </div>

              {/* Issue (read-only) */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  Issue Details
                </h4>
                <Info label="Subject" value={ticket?.subject} />
                <div>
                  <span className="block text-xs text-gray-400">
                    Issue Description
                  </span>
                  <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {ticket?.issueDescription || "-"}
                  </p>
                </div>
                {ticket?.attachmentUrl && (
                  <a
                    href={ticket.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 dark:text-primary-400 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    <PaperClipIcon className="size-4" />
                    View Attachment
                  </a>
                )}
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  Update Status
                </h4>
                <p className="text-xs text-gray-500">
                  Current status:{" "}
                  <span className="font-semibold">{ticket?.status}</span>
                </p>
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    New Status<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <Combobox
                    data={statuses}
                    displayField="label"
                    value={statuses.find((s) => s.id === statusId) || null}
                    onChange={(v: any) => {
                      setStatusId(v?.id || "");
                      setError("");
                    }}
                    placeholder="Select status"
                    searchFields={["label"]}
                  />
                  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
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
              {submitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}