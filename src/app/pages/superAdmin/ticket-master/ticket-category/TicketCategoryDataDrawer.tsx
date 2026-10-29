import { Fragment, useEffect, useMemo, useState } from "react";
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
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import type { TicketCategory } from "../shared/types";

interface TicketCategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editCategory: TicketCategory | null;
}

interface Opt {
  id: string;
  label: string;
  departmentId?: string; // resolver teams only
}

const STATUS_OPTIONS: Opt[] = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

// Active records, plus whatever this category already has selected
const keepActive = (status: string, id: string, selected: string[]) =>
  status === "Active" || selected.includes(id);

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

function getInitialForm(editCategory: TicketCategory | null) {
  if (editCategory) {
    return {
      id: editCategory.id,
      categoryCode: editCategory.categoryCode,
      categoryName: editCategory.categoryName,
      departmentId: editCategory.departmentId,
      description: editCategory.description,
      defaultResolverTeamId: editCategory.defaultResolverTeamId,
      displayOrder: editCategory.displayOrder,
      status: editCategory.status,
    };
  }

  return {
    id: "",
    categoryCode: "",
    categoryName: "",
    departmentId: "",
    description: "",
    defaultResolverTeamId: "",
    displayOrder: 1,
    status: "Active" as const,
  };
}

export function TicketCategoryDataDrawer({
  isOpen,
  close,
  onSaved,
  editCategory,
}: TicketCategoryDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editCategory));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [nextNo, setNextNo] = useState("");
  const [departments, setDepartments] = useState<Opt[]>([]);
  const [teams, setTeams] = useState<Opt[]>([]);

  // Dropdown data from the DB
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const [deptRes, teamRes]: any[] = await Promise.all([
          Get("superadmin/department/list", {}, false),
          Get("superadmin/resolver-team/list", {}, false),
        ]);

        const rows = (res: any): any[] => res?.data?.data ?? [];

        setDepartments(
          rows(deptRes)
            .filter((r) =>
              keepActive(r.status, String(r.departmentId), [form.departmentId]),
            )
            .map((r) => ({
              id: String(r.departmentId),
              label: r.departmentName,
            })),
        );
        setTeams(
          rows(teamRes)
            .filter((r) =>
              keepActive(r.status, String(r.resolverTeamId), [
                form.defaultResolverTeamId,
              ]),
            )
            .map((r) => ({
              id: String(r.resolverTeamId),
              label: r.teamName,
              departmentId: r.departmentId ? String(r.departmentId) : "",
            })),
        );
      } catch (error) {
        console.error("Ticket category dropdown error:", error);
        toast.error("Failed to load dropdown data");
      }
    })();
  }, [isOpen]);

  // Category ID preview (prefix + FY), new categories only
  useEffect(() => {
    if (!isOpen || editCategory) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/ticket-category/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.ticketCategoryNo);
      } catch (error) {
        console.error("Category number error:", error);
      }
    })();
  }, [isOpen, editCategory]);

  // Teams shown depend on the selected department
  const teamOptions = useMemo(
    () => teams.filter((t) => t.departmentId === form.departmentId),
    [teams, form.departmentId],
  );

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleClose = () => close();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.categoryCode.trim())
      next.categoryCode = "Category code is required";
    if (!form.categoryName.trim())
      next.categoryName = "Category name is required";
    if (!form.departmentId) next.departmentId = "Department is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      // only fields the backend validator allows (no `id`)
      const payload = {
        categoryCode: form.categoryCode.trim(),
        categoryName: form.categoryName.trim(),
        description: form.description.trim(),
        departmentId: Number(form.departmentId),
        defaultResolverTeamId: form.defaultResolverTeamId
          ? Number(form.defaultResolverTeamId)
          : null,
        displayOrder: form.displayOrder,
        status: form.status,
      };

      if (editCategory) {
        await Put(
          "superadmin/ticket-category/update",
          { ...payload, ticketCategoryId: editCategory.id },
          false,
        );
      } else {
        await Post(
          "superadmin/ticket-category/create",
          {
            ...payload,
            financialYearId: localStorage.getItem("financialYearId"),
          },
          false,
        );
      }
      toast.success(
        editCategory
          ? "Category updated successfully"
          : "Category added successfully",
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
              {editCategory ? "Edit Ticket Category" : "Add Ticket Category"}
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
              {/* Category ID */}
              <div>
                <FieldLabel>Category ID</FieldLabel>
                <Input
                  value={
                    editCategory?.ticketCategoryNo || nextNo || "Generating..."
                  }
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              {/* Category Code (Manually) */}
              <div>
                <FieldLabel required>Category Code</FieldLabel>
                <Input
                  placeholder="Enter category code"
                  value={form.categoryCode}
                  onChange={(e: any) => sf("categoryCode", e.target.value)}
                />
                {errors.categoryCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.categoryCode}
                  </p>
                )}
              </div>

              {/* Category Name */}
              <div className="sm:col-span-2">
                <FieldLabel required>Category Name</FieldLabel>
                <Input
                  placeholder="Enter category name"
                  value={form.categoryName}
                  onChange={(e: any) => sf("categoryName", e.target.value)}
                />
                {errors.categoryName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.categoryName}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <FieldLabel required>Department</FieldLabel>
                <Combobox
                  data={departments}
                  displayField="label"
                  value={
                    departments.find((d) => d.id === form.departmentId) || null
                  }
                  onChange={(v: any) =>
                    setForm((f) => ({
                      ...f,
                      departmentId: v?.id || "",
                      defaultResolverTeamId: "",
                    }))
                  }
                  placeholder="Select department"
                  searchFields={["label"]}
                />
                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              {/* Default Resolver Team */}
              <div>
                <FieldLabel>Default Resolver Team</FieldLabel>
                <Combobox
                  data={teamOptions}
                  displayField="label"
                  value={
                    teamOptions.find(
                      (t) => t.id === form.defaultResolverTeamId,
                    ) || null
                  }
                  onChange={(v: any) =>
                    sf("defaultResolverTeamId", v?.id || "")
                  }
                  placeholder={
                    form.departmentId
                      ? "Select team"
                      : "Select a department first"
                  }
                  searchFields={["label"]}
                />
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
                : editCategory
                  ? "Update Category"
                  : "Add Category"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
