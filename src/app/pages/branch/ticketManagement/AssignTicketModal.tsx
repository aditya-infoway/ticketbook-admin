import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@/components/shared/form/StyledCombobox";

interface AssignTicketDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  ticket: any | null;
  contractors: { id: string; label: string; departmentId?: string; departmentName?: string }[];
}

export function AssignTicketModal({
  isOpen,
  close,
  onSaved,
  ticket,
  contractors = [],
}: AssignTicketDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assignId: "",
    branchId: "", // <-- ADDED Branch ID to state
    contractorId: "",
    contractorDepartment: "",
    assignDate: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      const mockId = `ASN-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Assuming `ticket` object contains the branchId or branchName
      // If your backend strictly auto-fetches it based on the logged-in user,
      // you can just leave this string empty and the backend will ignore it.
      const mockBranchId = ticket?.branchId || ticket?.branchName || "BR-001"; 

      setFormData({
        assignId: mockId,
        branchId: mockBranchId, 
        contractorId: "",
        contractorDepartment: "",
        assignDate: formattedDate,
        remarks: "",
      });
    }
  }, [isOpen, ticket]);

  const handleContractorChange = (selected: any) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        contractorId: selected.id,
        contractorDepartment: selected.departmentName || selected.departmentId || "N/A",
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
      alert("Please select a contractor");
      return;
    }

    setLoading(true);
    try {
      // API Call Placeholder
      // await Post("branch/ticket/assign", {
      //   ticketId: ticket.id,
      //   branchId: formData.branchId, // Sending it, though backend auto-fetches
      //   contractorId: formData.contractorId,
      //   remarks: formData.remarks,
      // });
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSaved();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-[#0F111A] text-gray-200 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-purple-600 px-6 py-4 text-white">
          <div>
            <h2 className="text-lg font-semibold">Assign Ticket</h2>
            {ticket?.ticketNumber && (
              <p className="text-sm text-purple-200">
                Ticket: {ticket.ticketNumber}
              </p>
            )}
          </div>
          <button
            onClick={close}
            className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="assign-ticket-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="rounded-lg border border-gray-800 bg-[#161925] p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Assignment Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Assign ID */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Assign ID
                  </label>
                  <input
                    type="text"
                    value={formData.assignId}
                    readOnly
                    className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>

                {/* 2. Branch ID (Added) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.branchId}
                    readOnly
                    className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>

                {/* 3. Assign Date - Time */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Assign Date & Time
                  </label>
                  <input
                    type="text"
                    value={formData.assignDate}
                    readOnly
                    className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>

                {/* 4. Contractor */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Contractor <span className="text-red-500">*</span>
                  </label>
                  <Combobox
                    data={contractors}
                    displayField="label"
                    value={contractors.find((c) => c.id === formData.contractorId) || null}
                    onChange={handleContractorChange}
                    placeholder="Select Contractor"
                    searchFields={["label"]}
                  />
                </div>

                {/* 5. Contractor Department */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Contractor Department
                  </label>
                  <input
                    type="text"
                    value={formData.contractorDepartment}
                    readOnly
                    placeholder="Auto-filled..."
                    className="w-full cursor-not-allowed rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Remarks Card */}
            <div className="rounded-lg border border-gray-800 bg-[#161925] p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Additional Details
              </h3>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Remarks (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Enter remarks..."
                  className="w-full rounded-md border border-gray-700 bg-[#0F111A] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-800 bg-[#161925] p-4">
          <button
            onClick={close}
            type="button"
            className="rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assign-ticket-form"
            disabled={loading}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign Ticket"}
          </button>
        </div>
      </div>
    </>
  );
}