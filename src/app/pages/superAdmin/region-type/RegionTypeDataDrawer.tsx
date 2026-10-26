import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { Get, Post, Put } from "../../../../ApiHelper";
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import type { RegionType } from "./shared/types";

interface RegionTypeDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editRegionType: RegionType | null;
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

// Helper to create initial form
function getInitialForm(editRegionType: RegionType | null) {
  if (editRegionType) {
    return {
      id: editRegionType.id,
      regionTypeNo: editRegionType.regionTypeNo ?? "",
      typeCode: editRegionType.typeCode,
      typeName: editRegionType.typeName,
      description: editRegionType.description,
      displayOrder: editRegionType.displayOrder,
      status: editRegionType.status,
    };
  }

  // New region type -> generate IDs only once
  return {
    id: "",
    regionTypeNo: "",
    typeCode: "",
    typeName: "",
    description: "",
    displayOrder: 1,
    status: "Active",
  };
}

export function RegionTypeDataDrawer({
  isOpen,
  close,
  onSaved,
  editRegionType,
}: RegionTypeDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editRegionType));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [nextNo, setNextNo] = useState("");

  useEffect(() => {
    if (!isOpen || editRegionType) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/region-type/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.regionTypeNo);
      } catch (error) {
        console.error("Region type number error:", error);
      }
    })();
  }, [isOpen, editRegionType]);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleClose = () => {
    close();
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.typeCode.trim()) next.typeCode = "Type code is required";
    if (!form.typeName.trim()) next.typeName = "Type name is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      // only the fields the backend validator allows (no `id`)
      const payload = {
        typeCode: form.typeCode.trim(),
        typeName: form.typeName.trim(),
        description: form.description.trim(),
        displayOrder: form.displayOrder,
        status: form.status,
      };

      if (editRegionType) {
        await Put(
          "superadmin/region-type/update",
          { ...payload, regionTypeId: editRegionType.id },
          false,
        );
      } else {
        await Post(
          "superadmin/region-type/create",
          {
            ...payload,
            financialYearId: localStorage.getItem("financialYearId"),
          },
          false,
        );
      }

      toast.success(
        editRegionType
          ? "Region type updated successfully"
          : "Region type added successfully",
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
              {editRegionType ? "Edit Region Type" : "Add Region Type"}
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
              {/* Type ID */}
              <div>
                <FieldLabel>Type ID</FieldLabel>
                <Input
                  value={
                    editRegionType?.regionTypeNo || nextNo || "Generating..."
                  }
                  readOnly
                  disabled
                  className="dark:bg-dark-800 w-full truncate bg-gray-50 text-gray-500"
                />
              </div>

              {/* Type Code */}
              <div>
                <FieldLabel required>Type Code</FieldLabel>
                <Input
                  placeholder="Enter code"
                  value={form.typeCode}
                  onChange={(e: any) => sf("typeCode", e.target.value)}
                />
                {errors.typeCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.typeCode}</p>
                )}
              </div>

              {/* Type Name */}
              <div className="sm:col-span-2">
                <FieldLabel required>Type Name</FieldLabel>
                <Input
                  placeholder="Enter type name"
                  value={form.typeName}
                  onChange={(e: any) => sf("typeName", e.target.value)}
                />
                {errors.typeName && (
                  <p className="mt-1 text-xs text-red-500">{errors.typeName}</p>
                )}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <FieldLabel>Description</FieldLabel>
                <textarea
                  className="dark:bg-dark-800 dark:border-dark-600 focus:border-primary-500 focus:ring-primary-500 dark:text-dark-100 dark:placeholder:text-dark-400 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  rows={3}
                  placeholder="Enter description (optional)"
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                />
              </div>

              {/* Display Order */}
              <div>
                <FieldLabel>Display Order</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter display order"
                  value={form.displayOrder}
                  onChange={(e: any) =>
                    sf("displayOrder", Number(e.target.value))
                  }
                />
              </div>

              {/* Status */}
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
                : editRegionType
                  ? "Update Region Type"
                  : "Add Region Type"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
