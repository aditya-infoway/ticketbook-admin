// AssignTicketModal.tsx
import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button } from "@/components/ui";
import { Get, Post } from "@/ApiHelper";
import { toast } from "sonner";

interface AssignTicketDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  ticket: any | null;
  contractors: {
    id: string;
    label: string;
    departmentId?: string;
    departmentName?: string;
  }[];
}

export function AssignTicketModal({
  isOpen,
  close,
  onSaved,
  ticket,
  contractors = [],
}: AssignTicketDrawerProps) {
  return (
    <AssignTicketModalContent
      key={`${isOpen}-${ticket?.ticketId ?? ticket?.id ?? ""}-${ticket?.branchName ?? ""}`}
      isOpen={isOpen}
      close={close}
      onSaved={onSaved}
      ticket={ticket}
      contractors={contractors}
    />
  );
}

function AssignTicketModalContent({
  isOpen,
  close,
  onSaved,
  ticket,
  contractors = [],
}: AssignTicketDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(contractors);
  const [formData, setFormData] = useState({
    assignId: isOpen ? "Generating..." : "",
    branchId: isOpen ? ticket?.branchName || "" : "",
    contractorId: "",
    contractorDepartment: "",
    assignDate: isOpen
      ? new Date().toLocaleString("en-IN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    remarks: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      try {
        const res: any = await Get(
          "branch/ticket/assign/next-number",
          {},
          false,
        );
        if (!cancelled && res?.data?.success) {
          setFormData((p) => ({
            ...p,
            assignId: res.data.data.ticketAssignNo,
          }));
        }
      } catch {
        // preview only
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res: any = await Get("branch/ticket/contractors", {}, false);
        if (res?.data?.success) setList(res.data.data || []);
        else toast.error(res?.data?.message || "Failed to load contractors");
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Failed to load contractors",
        );
      }
    })();
  }, [isOpen]);

  const handleContractorChange = (selected: any) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        contractorId: selected.id,
        contractorDepartment:
          selected.departmentName || selected.departmentId || "N/A",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contractorId: "",
        contractorDepartment: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractorId) {
      toast.error("Please select a contractor");
      return;
    }

    setLoading(true);
    try {
      const res: any = await Post(
        "branch/ticket/assign",
        {
          ticketId: ticket?.ticketId ?? ticket?.id,
          contractorId: formData.contractorId,
          remarks: formData.remarks,
        },
        false,
      );
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to assign ticket");
        return;
      }
      toast.success(res.data.message || "Ticket assigned successfully");
      onSaved();
      close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={close}>
        {/* Overlay */}
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

        {/* Panel */}
        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed inset-y-0 right-0 flex w-full max-w-2xl transform-gpu flex-col bg-white text-gray-900 shadow-2xl transition-transform duration-200 dark:text-gray-100"
        >
          {/* Header */}
          <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-6 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">Assign Ticket</h2>
              {ticket?.ticketNumber && (
                <p className="text-primary-200 text-sm">
                  Ticket: {ticket.ticketNumber}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <form
              id="assign-ticket-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Assignment Info Card */}
              <div className="dark:border-dark-600 dark:bg-dark-800/50 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="dark:text-dark-300 mb-3 text-xs font-semibold text-gray-500 uppercase">
                  Assignment Information
                </h4>

                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  {/* 1. Assign ID */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">
                      Assign ID
                    </label>
                    <input
                      type="text"
                      value={formData.assignId}
                      readOnly
                      className="dark:border-dark-600 dark:bg-dark-900/40 w-full cursor-not-allowed rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 outline-none dark:text-gray-400"
                    />
                  </div>

                  {/* 2. Branch Name */}
                  <div>
                    <label className="mb-1 block text-xs text-gray-400">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      value={formData.branchId}
                      readOnly
                      className="dark:border-dark-600 dark:bg-dark-900/40 w-full cursor-not-allowed rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 outline-none dark:text-gray-400"
                    />
                  </div>

                  {/* 3. Assign Date & Time */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-400">
                      Assign Date &amp; Time
                    </label>
                    <input
                      type="text"
                      value={formData.assignDate}
                      readOnly
                      className="dark:border-dark-600 dark:bg-dark-900/40 w-full cursor-not-allowed rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 outline-none dark:text-gray-400"
                    />
                  </div>

                  {/* 4. Contractor */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Contractor<span className="ml-0.5 text-red-500">*</span>
                    </label>
                    <Combobox
                      data={list}
                      displayField="label"
                      value={
                        list.find((c) => c.id === formData.contractorId) || null
                      }
                      onChange={handleContractorChange}
                      placeholder="Select Contractor"
                      searchFields={["label"]}
                    />
                  </div>

                  {/* 5. Contractor Department */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-gray-400">
                      Contractor Department
                    </label>
                    <input
                      type="text"
                      value={formData.contractorDepartment}
                      readOnly
                      placeholder="Auto-filled..."
                      className="dark:border-dark-600 dark:bg-dark-900/40 w-full cursor-not-allowed rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 outline-none dark:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks Card */}
              <div className="dark:border-dark-600 dark:bg-dark-800/50 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="dark:text-dark-300 mb-3 text-xs font-semibold text-gray-500 uppercase">
                  Additional Details
                </h4>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">
                    Remarks (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    placeholder="Enter remarks..."
                    className="dark:border-dark-600 dark:bg-dark-900/40 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 focus:ring-1 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="dark:border-dark-600 dark:bg-dark-800 flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
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
              type="submit"
              form="assign-ticket-form"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign Ticket"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}