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

// Mock Dropdown Data (Replace with API later)
const DEPARTMENTS = [
  { id: "dep1", label: "Technical Support" },
  { id: "dep2", label: "Sales" },
  { id: "dep3", label: "Operations" },
];

const EMPLOYEES = [
  { id: "emp1", label: "John Doe" },
  { id: "emp2", label: "Jane Smith" },
  { id: "emp3", label: "Mike Johnson" },
  { id: "emp4", label: "Sarah Williams" },
];

const COVERAGE_TYPES = [
  { id: "All", label: "All Regions" },
  { id: "Specific", label: "Specific Region(s)" },
];

const REGIONS = [
  { id: "r1", label: "North Region" },
  { id: "r2", label: "South Region" },
  { id: "r3", label: "East Region" },
];

const BRANCHES = [
  { id: "b1", label: "Mumbai Central" },
  { id: "b2", label: "Delhi North" },
  { id: "b3", label: "Bangalore South" },
];

const ASSIGNMENT_METHODS = [
  { id: "Auto", label: "Auto Assign" },
  { id: "Manual", label: "Manual Assign" },
];

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

// MultiSelect requires `name` instead of `label`
const employeeMultiOptions = EMPLOYEES.map((e) => ({
  id: e.id,
  name: e.label,
}));
const branchMultiOptions = BRANCHES.map((b) => ({ id: b.id, name: b.label }));

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

function getInitialForm(editTeam: ResolverTeam | null) {
  if (editTeam) {
    return {
      id: editTeam.id,
      teamName: editTeam.teamName,
      departmentId: editTeam.departmentId,
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
    teamName: "",
    departmentId: "",
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
              keepActive(r.status, String(r.departmentId), [form.departmentId]),
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
    if (!form.teamName.trim()) next.teamName = "Team name is required";
    if (!form.departmentId) next.departmentId = "Department is required";
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
        teamName: form.teamName.trim(),
        teamDescription: form.teamDescription.trim(),
        departmentId: Number(form.departmentId),
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
  const selectedBranches = branchOptions.filter((opt) =>
    form.assignedBranchIds.includes(opt.id),
  );

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
              {/* Team ID */}
              <div>
                <FieldLabel>Team ID</FieldLabel>
                <Input
                  value={editTeam?.resolverTeamNo || nextNo || "Generating..."}
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              {/* Team Name */}
              <div>
                <FieldLabel required>Team Name</FieldLabel>
                <Input
                  placeholder="Enter team name"
                  value={form.teamName}
                  onChange={(e: any) => sf("teamName", e.target.value)}
                />
                {errors.teamName && (
                  <p className="mt-1 text-xs text-red-500">{errors.teamName}</p>
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
                  onChange={(v: any) => sf("departmentId", v?.id || "")}
                  placeholder="Select department"
                  searchFields={["label"]}
                />
                {errors.departmentId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              {/* Team Leader */}
              <div>
                <FieldLabel>Team Leader</FieldLabel>
                <Combobox
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

              {/* Team Members (Multi-Select) */}
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

              {/* Coverage Type */}
              <div>
                <FieldLabel required>Coverage Type</FieldLabel>
                <Listbox
                  data={COVERAGE_TYPES}
                  value={
                    COVERAGE_TYPES.find((c) => c.id === form.coverageType) ||
                    null
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
                />
                {errors.coverageType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.coverageType}
                  </p>
                )}
              </div>

              {form.coverageType === "Specific" && (
                <>
                  {/* Region / Area */}
                  <div>
                    <FieldLabel>Region / Area</FieldLabel>
                    <Combobox
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
                    />
                    {errors.regionId && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.regionId}
                      </p>
                    )}
                  </div>

                  {/* Assigned Branches */}
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

              {/* Assignment Method */}
              <div>
                <FieldLabel required>Assignment Method</FieldLabel>
                <Listbox
                  data={ASSIGNMENT_METHODS}
                  value={
                    ASSIGNMENT_METHODS.find(
                      (a) => a.id === form.assignmentMethod,
                    ) || null
                  }
                  onChange={(v: any) => sf("assignmentMethod", v?.id || "")}
                  displayField="label"
                  placeholder="Select method"
                />
                {errors.assignmentMethod && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.assignmentMethod}
                  </p>
                )}
              </div>

              {/* Team Email */}
              <div>
                <FieldLabel>Team Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="team@company.com"
                  value={form.teamEmail}
                  onChange={(e: any) => sf("teamEmail", e.target.value)}
                />
                {errors.teamEmail && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.teamEmail}
                  </p>
                )}
              </div>

              {/* Team Description */}
              <div className="sm:col-span-2">
                <FieldLabel>Team Description</FieldLabel>
                <textarea
                  className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  rows={3}
                  placeholder="Optional description..."
                  value={form.teamDescription}
                  onChange={(e) => sf("teamDescription", e.target.value)}
                />
              </div>

              {/* Team Status */}
              <div className="sm:col-span-2">
                <FieldLabel required>Team Status</FieldLabel>
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
              {submitting ? "Saving..." : editTeam ? "Update Team" : "Add Team"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
