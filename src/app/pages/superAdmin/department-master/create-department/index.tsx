import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Get,
  Post,
  Put,
  Delete,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
// NOTE: adjust to where your shared master files live
import {
  exportToExcel,
  exportToPdf,
} from "@/app/pages/dashboards/home/crm-analytics/shared/export";
import { MasterTable } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterToolbar";
import { DepartmentDrawer } from "./DepartmentDrawer";
import { columns, exportColumns } from "./columns";
import {
  Department,
  emptyDepartment,
  formatDateTime,
  mapApiDepartmentToDepartment,
} from "./data";
import { departmentStatusOptions, getScopeLabel } from "./options";

interface Option {
  id: string;
  label: string;
}

const ALL: Option = { id: "", label: "All" };

export default function DepartmentPage() {
  const [data, setData] = useState<Department[]>([]);
  const [types, setTypes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const API = {
    list: "superadmin/department/list",
    create: "superadmin/department/create",
    update: "superadmin/department/update",
    delete: "superadmin/department/delete",
  };
  // ---- Fetch departments + department types ----
  // TODO: confirm endpoint names / response fields with your backend.
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [deptRes, typeRes] = await Promise.all([
        Get(API.list, {}, false).catch(() => null),
        Get("superadmin/department-type/list", {}, false).catch(() => null),
      ]);

      if (typeRes?.data?.success) {
        setTypes(
          (typeRes.data.data || []).map((t: any) => ({
            id: String(t.departmentTypeId ?? t.id),
            label: t.typeCode
              ? `${t.typeName} (${t.typeCode})`
              : (t.typeName ?? ""),
            status: t.status,
          })),
        );
      }

      if (deptRes?.data?.success) {
        setData((deptRes.data.data || []).map(mapApiDepartmentToDepartment));
      } else {
        toasterrormsg(deptRes?.data?.message || "Failed to fetch departments.");
      }
    } catch {
      toasterrormsg("Something went wrong while fetching department data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeFilterOptions = [ALL, ...types];
  const statusFilterOptions = [ALL, ...departmentStatusOptions];

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (
          filterName &&
          !item.name.toLowerCase().includes(filterName.toLowerCase())
        )
          return false;
        if (filterType && item.typeId !== filterType) return false;
        if (filterStatus && item.status !== filterStatus) return false;
        return true;
      }),
    [data, filterName, filterType, filterStatus],
  );

  const exportRows = filteredData.map((row) => ({
    ...row,
    scopeName: getScopeLabel(row.scope),
    createdAtText: formatDateTime(row.createdAt),
  }));
const buildPayload = (item: Department) => {
  const financialYearId = localStorage.getItem("financialYearId");
  const companyId = localStorage.getItem("companyId");

  return {
    financialYearId: Number(financialYearId),
    ...(companyId ? { companyId: Number(companyId) } : {}),
    departmentCode: item.code,
    departmentName: item.name,
    description: item.description,
    departmentTypeId: item.typeId
      ? Number(item.typeId)
      : null,
    parentDepartmentId: item.parentId
      ? Number(item.parentId)
      : null,
    scope: item.scope,
    status: item.status,
    displayOrder: item.displayOrder
      ? Number(item.displayOrder)
      : null,
    createdBy: companyId
      ? Number(companyId)
      : undefined,
    createdType: "Super Admin",
  };
};
  // ---- Save (create or update) via API ----
  const handleSave = async (item: Department) => {
  const financialYearId = localStorage.getItem("financialYearId");

  if (!financialYearId) {
    toasterrormsg(
      "Financial Year not found. Please select a company year.",
    );
    return;
  }

  const payload = buildPayload(item);

  try {
    if (item.id) {
      const response = await Put(
        API.update,
        {
          departmentId: item.id,
          ...payload,
        },
        false,
      );

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            "Department updated successfully.",
        );
        fetchAll();
      } else {
        toasterrormsg(
          response.data?.message ||
            "Failed to update department.",
        );
      }
    } else {
      const response = await Post(
        API.create,
        payload,
        false,
      );

      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            "Department created successfully.",
        );
        fetchAll();
      } else {
        toasterrormsg(
          response.data?.message ||
            "Failed to create department.",
        );
      }
    }
  } catch {
    toasterrormsg(
      "Something went wrong while saving the department.",
    );
  }
};
  const handleToggleStatus = async (row: Department) => {
  const nextStatus = row.status === "Active" ? "Inactive" : "Active";

  try {
    const response = await Put(
      API.update,
      {
        departmentId: row.id,
        ...buildPayload({
          ...row,
          status: nextStatus,
        }),
      },
      false,
    );

    if (response.data?.success) {
      toastsuccessmsg(
        response.data?.message ||
          `Department ${
            nextStatus === "Active" ? "activated" : "deactivated"
          } successfully.`,
      );

      setData((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
    } else {
      toasterrormsg(
        response.data?.message || "Failed to update status.",
      );
    }
  } catch {
    toasterrormsg(
      "Something went wrong while updating the status.",
    );
  }
};
  const handleDeleteOne = async (row: Department) => {
    try {
      const response = await Delete(
        "master/department/delete",
        { departmentId: row.id },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Department deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete department.");
      }
    } catch {
      toasterrormsg("Something went wrong while deleting the department.");
    }
  };

  const handleDeleteMany = async (rows: { original: Department }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(
            "master/department/delete",
            { departmentId: r.original.id },
            false,
          ),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected departments deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting departments.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openViewDrawer: (row: Department) => {
        setDrawerMode("view");
        setEditing(row);
        setDrawerOpen(true);
      },
      openEditDrawer: (row: Department) => {
        setDrawerMode("edit");
        setEditing(row);
        setDrawerOpen(true);
      },
      deleteRow: (row: any) => handleDeleteOne(row.original),
      deleteRows: (rows: any) => handleDeleteMany(rows),
      toggleStatus: (row: Department) => handleToggleStatus(row),
    } as any,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Create Department">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Create Department"
          createLabel="Add Department"
          searchPlaceholder="Search departments..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setDrawerMode("create");
            setEditing(emptyDepartment());
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "departments")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Department List",
              "departments",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Department Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Filter by name"
              />
              <Listbox
                data={typeFilterOptions}
                value={
                  typeFilterOptions.find((i) => i.id === filterType) || ALL
                }
                onChange={(item) => setFilterType(item.id)}
                label="Type"
                placeholder="All types"
                displayField="label"
              />
              <Listbox
                data={statusFilterOptions}
                value={
                  statusFilterOptions.find((i) => i.id === filterStatus) || ALL
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading departments..."
              : "No departments found. Click Add Department to add one."
          }
        />
      </div>
      <DepartmentDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        mode={drawerMode}
        department={editing}
        departments={data}
        types={types}
        onSave={handleSave}
      />
    </Page>
  );
}