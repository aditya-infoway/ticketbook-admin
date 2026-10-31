// ReviewDrawer.tsx  (contractor ka submit kiya kaam: details (read-only) + reassign)
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
import type { ContractorReview } from "./Columns";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  work: ContractorReview | null;
  contractors: { id: string; label: string }[];
  toFileUrl: (p?: string | null) => string;
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

export function ReviewDrawer({
  isOpen,
  close,
  onSaved,
  work,
  contractors,
  toFileUrl,
}: Props) {
  const [contractorId, setContractorId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !work) return;
    setContractorId(work.contractorId || ""); // default: wahi contractor
    setRemarks("");
    setErrors({});
  }, [isOpen, work]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!contractorId) next.contractorId = "Contractor is required";
    if (!remarks.trim()) next.remarks = "Remarks are required";
    else if (remarks.trim().length < 3)
      next.remarks = "Remarks must be at least 3 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!work || !validate()) return;

    try {
      setSubmitting(true);
      const res: any = await Put(
        `branch/contractor-review/reassign/${work.id}`,
        { contractorId, remarks: remarks.trim() },
        false,
      );
      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Failed to reassign work");
        return;
      }
      toast.success(res.data.message || "Work reassigned successfully");
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
            <h3 className="text-base font-bold">Contractor Work Review</h3>
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
              {/* Ticket info */}
              <div className="dark:border-dark-600 dark:bg-dark-800/50 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h4 className="dark:text-dark-300 mb-3 text-xs font-semibold text-gray-500 uppercase">
                  Ticket Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="Ticket ID" value={work?.ticketNumber} />
                  <Info label="Ticket Title" value={work?.ticketTitle} />
                  <Info label="Branch" value={work?.branchName} />
                  <Info label="Department" value={work?.departmentName} />
                  <Info label="Contractor" value={work?.contractorName} />
                  <Info label="Status" value={work?.status} />
                </div>
              </div>

              {/* Completion details */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  Completion Details
                </h4>
                <Info label="Completion Date" value={work?.completionDate} />
                <div>
                  <span className="block text-xs text-gray-400">
                    Completion Remarks
                  </span>
                  <p className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                    {work?.completionRemarks || "-"}
                  </p>
                </div>
                <div>
                  <span className="mb-1 block text-xs text-gray-400">
                    Attachments
                  </span>
                  {work?.attachments?.length ? (
                    <div className="flex flex-col gap-1">
                      {work.attachments.map((a, i) => (
                        <a
                          key={`${a}-${i}`}
                          href={toFileUrl(a)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 dark:text-primary-400 inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        >
                          <PaperClipIcon className="size-4" />
                          {`Attachment ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </div>
              </div>

              {/* Reassign */}
              <div className="space-y-4">
                <h4 className="text-primary-600 dark:text-primary-400 dark:border-dark-600 border-b border-gray-200 pb-1 text-sm font-semibold">
                  Reassign Work
                </h4>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Contractor<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <Combobox
                    data={contractors}
                    displayField="label"
                    value={contractors.find((c) => c.id === contractorId) || null}
                    onChange={(v: any) => {
                      setContractorId(v?.id || "");
                      setErrors((e) => ({ ...e, contractorId: "" }));
                    }}
                    placeholder="Select contractor"
                    searchFields={["label"]}
                  />
                  {errors.contractorId && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.contractorId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Remarks<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <textarea
                    className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                    rows={4}
                    placeholder="Kya sudhaar karna hai, wo likho..."
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                      setErrors((er) => ({ ...er, remarks: "" }));
                    }}
                  />
                  {errors.remarks && (
                    <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>
                  )}
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
              Close
            </Button>
            <Button
              color="primary"
              type="button"
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "Reassigning..." : "Reassign Work"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}