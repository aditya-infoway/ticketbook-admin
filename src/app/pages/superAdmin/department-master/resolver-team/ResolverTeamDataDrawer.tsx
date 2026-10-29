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
import { Button, Input, Textarea } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { MultiSelect } from "@/components/shared/form/MultiSelect";
import type { ResolverTeam } from "../shared/types";

interface ResolverTeamDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editTeam: ResolverTeam | null;
}

interface Opt {
  id: string;
  label: string;
  regionId?: string; // branches only
}

const COVERAGE_TYPES = [
  { id: "All", label: "All Regions" },
  { id: "Specific", label: "Specific Region(s)" },
];

const ASSIGNMENT_METHODS = [
  { id: "Auto", label: "Auto Assign" },
  { id: "Manual", label: "Manual Assign" },
];

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

const keepActive = (status: string, id: string, selected: string[]) =>
  status === "Active" || selected.includes(id);

// Label with red asterisk
const req = (text: string) => (
  <>
    {text}
    <span className="ml-0.5 text-red-500">*</span>
  </>
);

// Sirf MultiSelect ke liye (agar uska label/error prop support nahi karta)
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

function getInitialForm(editTeam: ResolverTeam | null) {
  if (editTeam) {
    return {
      id: editTeam.id,
      // ResolverTeam type me teamCode add kar lena, tab `as any` hata sakte ho
      teamCode: ((editTeam as any).teamCode as string) || "",
      teamName: editTeam.teamName,
      departmentIds: (
        (editTeam as any).departmentIds ||
        (editTeam.departmentId ? [editTeam.departmentId] : [])
      ).map(String) as string[],

      // new wale return me

      teamDescription: editTeam.teamDescription,
      teamLeaderId: editTeam.teamLeaderId,
      teamMemberIds: (editTeam.teamMemberIds || []).map(String) as string[],
      coverageType: editTeam.coverageType,
      regionId: editTeam.regionId,
      assignedBranchIds: (editTeam.assignedBranchIds || []).map(
        String,
      ) as string[],
      assignmentMethod: editTeam.assignmentMethod,
      teamEmail: editTeam.teamEmail,
      status: editTeam.status,
    };
  }

  return {
    id: "",
    teamCode: "",
    teamName: "",
    departmentIds: [] as string[],
    teamDescription: "",
    teamLeaderId: "",
    teamMemberIds: [] as string[],
    coverageType: "All",
    regionId: "",
    assignedBranchIds: [] as string[],
    assignmentMethod: "Auto",
    teamEmail: "",
    status: "Active" as const,
  };
}

export function ResolverTeamDataDrawer({
  isOpen,
  close,
  onSaved,
  editTeam,
}: ResolverTeamDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editTeam));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const [nextNo, setNextNo] = useState("");
  const [departments, setDepartments] = useState<Opt[]>([]);
  const [employees, setEmployees] = useState<Opt[]>([]);
  const [regions, setRegions] = useState<Opt[]>([]);
  const [branches, setBranches] = useState<Opt[]>([]);

  // Dropdown data from the DB
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const [deptRes, empRes, regRes, brRes]: any[] = await Promise.all([
          Get("superadmin/department/list", {}, false),
          Get("superadmin/employee/list", {}, false),
          Get("superadmin/region/list", {}, false),
          Get("superadmin/branch/list", {}, false),
        ]);

        const rows = (res: any): any[] => res?.data?.data ?? [];

        setDepartments(
          rows(deptRes)
            .filter((r) =>
              keepActive(r.status, String(r.departmentId), form.departmentIds),
            )
            .map((r) => ({
              id: String(r.departmentId),
              label: r.departmentName,
            })),
        );
        setEmployees(
          rows(empRes)
            .filter((r) =>
              keepActive(r.employmentStatus, String(r.employeeId), [
                form.teamLeaderId,
                ...form.teamMemberIds,
              ]),
            )
            .map((r) => ({ id: String(r.employeeId), label: r.employeeName })),
        );
        setRegions(
          rows(regRes)
            .filter((r) =>
              keepActive(r.status, String(r.regionId), [form.regionId]),
            )
            .map((r) => ({ id: String(r.regionId), label: r.regionName })),
        );
        setBranches(
          rows(brRes)
            .filter((r) =>
              keepActive(r.status, String(r.branchId), form.assignedBranchIds),
            )
            .map((r) => ({
              id: String(r.branchId),
              label: r.branchName,
              regionId: r.regionId ? String(r.regionId) : "",
            })),
        );
      } catch (error) {
        console.error("Resolver team dropdown error:", error);
        toast.error("Failed to load dropdown data");
      }
    })();
  }, [isOpen]);

  // Team ID preview (prefix + FY), new teams only
  useEffect(() => {
    if (!isOpen || editTeam) return;
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res: any = await Get(
          "superadmin/resolver-team/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) setNextNo(res.data.data.resolverTeamNo);
      } catch (error) {
        console.error("Team number error:", error);
      }
    })();
  }, [isOpen, editTeam]);

  // MultiSelect needs `name` instead of `label`
  const memberOptions = useMemo(
    () => employees.map((e) => ({ id: e.id, name: e.label })),
    [employees],
  );
  const departmentOptions = useMemo(
    () => departments.map((d) => ({ id: d.id, name: d.label })),
    [departments],
  );
  // Branches shown depend on the selected region
  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => !form.regionId || b.regionId === form.regionId)
        .map((b) => ({ id: b.id, name: b.label })),
    [branches, form.regionId],
  );

  const handleClose = () => close();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.teamCode.trim()) next.teamCode = "Team code is required";
    if (!form.teamName.trim()) next.teamName = "Team name is required";
    if (form.departmentIds.length === 0)
      next.departmentIds = "At least one department is required";
    if (form.teamMemberIds.length === 0)
      next.teamMemberIds = "At least one member is required";
    if (!form.coverageType) next.coverageType = "Coverage type is required";
    if (!form.assignmentMethod)
      next.assignmentMethod = "Assignment method is required";

    const email = form.teamEmail.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      next.teamEmail = "Enter a valid email";

    if (
      form.coverageType === "Specific" &&
      !form.regionId &&
      form.assignedBranchIds.length === 0
    )
      next.regionId = "Select a region or at least one branch";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      // only fields the backend validator allows (no `id`)
      const payload = {
        teamCode: form.teamCode.trim(),
        teamName: form.teamName.trim(),
        teamDescription: form.teamDescription.trim(),
        departmentIds: form.departmentIds.map(Number),
        teamLeaderId: form.teamLeaderId ? Number(form.teamLeaderId) : null,
        teamMemberIds: form.teamMemberIds.map(Number),
        coverageType: form.coverageType,
        regionId: form.regionId ? Number(form.regionId) : null,
        assignedBranchIds: form.assignedBranchIds.map(Number),
        assignmentMethod: form.assignmentMethod,
        teamEmail: form.teamEmail.trim(),
        status: form.status,
      };

      if (editTeam) {
        await Put(
          "superadmin/resolver-team/update",
          { ...payload, resolverTeamId: editTeam.id },
          false,
        );
      } else {
        await Post(
          "superadmin/resolver-team/create",
          {
            ...payload,
            financialYearId: localStorage.getItem("financialYearId"),
          },
          false,
        );
      }
      toast.success(
        editTeam ? "Team updated successfully" : "Team added successfully",
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

  // Convert ID arrays back to object arrays for the MultiSelect display
  const selectedMembers = memberOptions.filter((opt) =>
    form.teamMemberIds.includes(opt.id),
  );
  const selectedDepartments = departmentOptions.filter((opt) =>
    form.departmentIds.includes(opt.id),
  );
  const selectedBranches = branchOptions.filter((opt) =>
    form.assignedBranchIds.includes(opt.id),
  );

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
              {editTeam ? "Edit Resolver Team" : "Add Resolver Team"}
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
              {/* 1. Team ID (Auto) */}
              <Input
                label="Team ID"
                value={editTeam?.resolverTeamNo || nextNo || "Generating..."}
                readOnly
                disabled
              />

              {/* 2. Team Code */}
              <Input
                label={req("Team Code")}
                placeholder="Enter team code"
                value={form.teamCode}
                onChange={(e: any) => sf("teamCode", e.target.value)}
                error={errors.teamCode}
              />

              {/* 3. Team Name */}
              <Input
                label={req("Team Name")}
                placeholder="Enter team name"
                value={form.teamName}
                onChange={(e: any) => sf("teamName", e.target.value)}
                error={errors.teamName}
              />

              {/* 4. Department (Multi-Select) */}
              <div className="sm:col-span-2">
                <FieldLabel required>Department</FieldLabel>
                <MultiSelect
                  data={departmentOptions}
                  displayField="name"
                  value={selectedDepartments}
                  onChange={(selected) =>
                    sf(
                      "departmentIds",
                      selected.map((s) => s.id),
                    )
                  }
                  placeholder="Search and select departments..."
                  searchFields={["name"]}
                />
                {errors.departmentIds && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.departmentIds}
                  </p>
                )}
              </div>

              {/* 5. Team Description */}
              <div className="sm:col-span-2">
                <Textarea
                  label="Team Description"
                  placeholder="Optional description..."
                  rows={3}
                  value={form.teamDescription}
                  onChange={(e: any) => sf("teamDescription", e.target.value)}
                />
              </div>

              {/* 6. Team Leader */}
              <div className="sm:col-span-2">
                <Combobox
                  label="Team Leader"
                  data={employees}
                  displayField="label"
                  value={
                    employees.find((e) => e.id === form.teamLeaderId) || null
                  }
                  onChange={(v: any) => sf("teamLeaderId", v?.id || "")}
                  placeholder="Select leader"
                  searchFields={["label"]}
                />
              </div>

              {/* 7. Team Members (Multi-Select) */}
              <div className="sm:col-span-2">
                <FieldLabel required>Team Members</FieldLabel>
                <MultiSelect
                  data={memberOptions}
                  displayField="name"
                  value={selectedMembers}
                  onChange={(selected) =>
                    sf(
                      "teamMemberIds",
                      selected.map((s) => s.id),
                    )
                  }
                  placeholder="Search and select members..."
                  searchFields={["name"]}
                />
                {errors.teamMemberIds && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.teamMemberIds}
                  </p>
                )}
              </div>

              {/* 8. Coverage Type */}
              <Listbox
                label={req("Coverage Type")}
                data={COVERAGE_TYPES}
                value={
                  COVERAGE_TYPES.find((c) => c.id === form.coverageType) || null
                }
                onChange={(v: any) =>
                  setForm((f) => ({
                    ...f,
                    coverageType: v?.id || "",
                    ...(v?.id === "All"
                      ? { regionId: "", assignedBranchIds: [] as string[] }
                      : {}),
                  }))
                }
                displayField="label"
                placeholder="Select coverage"
                error={errors.coverageType}
              />

              {/* 11. Assignment Method */}
              <Listbox
                label={req("Assignment Method")}
                data={ASSIGNMENT_METHODS}
                value={
                  ASSIGNMENT_METHODS.find(
                    (a) => a.id === form.assignmentMethod,
                  ) || null
                }
                onChange={(v: any) => sf("assignmentMethod", v?.id || "")}
                displayField="label"
                placeholder="Select method"
                error={errors.assignmentMethod}
              />

              {/* 9 & 10. Conditional: Region + Branches */}
              {form.coverageType === "Specific" && (
                <>
                  <div className="sm:col-span-2">
                    <Combobox
                      label="Region / Area"
                      data={regions}
                      displayField="label"
                      value={
                        regions.find((r) => r.id === form.regionId) || null
                      }
                      onChange={(v: any) =>
                        setForm((f) => ({
                          ...f,
                          regionId: v?.id || "",
                          // keep only branches that belong to the newly picked region
                          assignedBranchIds: f.assignedBranchIds.filter(
                            (id) =>
                              !v?.id ||
                              branches.find((b) => b.id === id)?.regionId ===
                                v.id,
                          ),
                        }))
                      }
                      placeholder="Select region"
                      searchFields={["label"]}
                      error={errors.regionId}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FieldLabel>Assigned Branches</FieldLabel>
                    <MultiSelect
                      data={branchOptions}
                      displayField="name"
                      value={selectedBranches}
                      onChange={(selected) =>
                        sf(
                          "assignedBranchIds",
                          selected.map((s) => s.id),
                        )
                      }
                      placeholder="Search and select branches..."
                      searchFields={["name"]}
                    />
                  </div>
                </>
              )}

              {/* 12. Team Email */}
              <Input
                label="Team Email"
                type="email"
                placeholder="team@company.com"
                value={form.teamEmail}
                onChange={(e: any) => sf("teamEmail", e.target.value)}
                error={errors.teamEmail}
              />

              {/* 13. Team Status */}
              <Listbox
                label={req("Team Status")}
                data={STATUS_OPTIONS}
                value={STATUS_OPTIONS.find((s) => s.id === form.status) || null}
                onChange={(v: any) => sf("status", v?.id || "Active")}
                displayField="label"
                placeholder="Select status"
              />
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
              {submitting ? "Saving..." : editTeam ? "Update Team" : "Add Team"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
