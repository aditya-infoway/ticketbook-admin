import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, Put } from "@/ApiHelper";
import type { Region } from "./shared/types";

interface RegionDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editRegion: Region | null;
}


// Mock Region Type Options (Replace with API fetch later)

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];


// Helper to create initial form
function getInitialForm(editRegion: Region | null) {
  if (editRegion) {
    return {
      id: editRegion.id,
      regionName: editRegion.regionName,
      status: editRegion.status,
    };
  }

  // New region -> generate IDs only once
  return {
    id: "",
    regionName: "",
    status: "Active",
  };
}
const req = (text: string) => (
  <>
    {text}
    <span className="ml-0.5 text-red-500">*</span>
  </>
);
export function RegionDataDrawer({
  isOpen,
  close,
  onSaved,
  editRegion,
}: RegionDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editRegion));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextNo, setNextNo] = useState("");

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  useEffect(() => {
    if (!isOpen || editRegion) return; // sirf create mode me
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res = await Get(
          "superadmin/region/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) {
          setNextNo(res.data.data.regionNo); // 👈 backend jo field de
        }
      } catch (error) {
        console.error("Region number error:", error);
      }
    })();
  }, [isOpen, editRegion]);

  const handleClose = () => {
    close();
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.regionName.trim()) next.regionName = "Region name is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    const financialYearId = localStorage.getItem("financialYearId");
    const companyId = localStorage.getItem("companyId");

    if (!financialYearId) {
      toast.error("Financial Year not found. Please select a company year.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Create ke waqt Region ID = nextNo (API se aaya)
      // ✅ Edit ke waqt Region ID = form.id (existing record)
      const regionId = editRegion ? form.id : nextNo;

      const payload: any = {
        financialYearId: Number(financialYearId),

        ...(companyId ? { companyId: Number(companyId) } : {}),

        regionName: form.regionName,

        status: form.status,

        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      };

      console.log("Region Payload:", payload, "regionId:", regionId);

      let response;

      if (editRegion) {
        // ✅ Update — regionId body me
        response = await Put(
          "superadmin/region/update",
          { regionId, ...payload },
          false,
        );
      } else {
        // ✅ Create — regionId body me
        response = await Post(
          "superadmin/region/create",
          { regionId, ...payload },
          false,
        );
      }

      if (response.data?.success) {
        toast.success(
          response.data?.message ||
            (editRegion
              ? "Region updated successfully"
              : "Region added successfully"),
        );
        onSaved();
        handleClose();
      } else {
        toast.error(response.data?.message || "Failed to save region.");
      }
    } catch (error) {
      console.error("Region save error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={handleClose}>
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
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">
              {editRegion ? "Edit Zone" : "Add Zone"}
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
              {/* Region ID */}
              <Input
                label="Zone ID (Auto)"
                value={editRegion?.regionNo || nextNo || "Generating..."}
                readOnly
                disabled
              />

              {/* Region Name */}
              <Input
                label={req("Zone Name")}
                placeholder="Enter zone name"
                value={form.regionName}
                onChange={(e: any) => sf("regionName", e.target.value)}
                error={errors.regionName}
              />

              {/* Status */}
              <div className="sm:col-span-2">
                <Listbox
                  label={req("Status")}
                  data={STATUS_OPTIONS}
                  value={
                    STATUS_OPTIONS.find((s) => s.id === form.status) || null
                  }
                  onChange={(s: any) => sf("status", s?.id || "Active")}
                  displayField="label"
                  placeholder="Select status"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
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
                : editRegion
                  ? "Update Zone"
                  : "Add Zone"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
