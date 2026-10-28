import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
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
import { exportToExcel, exportToPdf } from "@/app/pages/dashboards/home/crm-analytics/shared/export";
import { MasterTable } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterToolbar";
import { DepartmentTypeDrawer, DrawerMode } from "./Departmenttypedrawer";
import { columns, exportColumns } from "./Columns";
import {
  DepartmentType,
  emptyDepartmentType,
  formatDate,
  mapApiTypeToDepartmentType,
} from "./data";
import { typeStatusOptions } from "./Options";

interface Option {
  id: string;
  label: string;
}

const ALL: Option = { id: "", label: "All" };

// Backend: app.use("/superadmin/department-type", routes)
const API = {
  list: "superadmin/department-type/list",
  create: "superadmin/department-type/create",
  update: "superadmin/department-type/update",
  delete: "superadmin/department-type/delete",
};

// DatePicker gives Date[] -> keep "YYYY-MM-DD" string in state
const formatDateForApi = (value: Date | undefined): string => {
  if (!value || isNaN(value.getTime())) return "";
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function DepartmentTypePage() {
  const [data, setData] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editing, setEditing] = useState<DepartmentType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // ---- Fetch department types ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get(API.list, {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiTypeToDepartmentType));
      } else {
        toasterrormsg(
          response.data?.message || "Failed to fetch department types.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while fetching department types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  
  }, []);

  const statusFilterOptions = [ALL, ...typeStatusOptions];

  // Search by Code / Name = toolbar search (global filter).
  // Status and Created Date = filter panel.
  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (filterStatus && item.status !== filterStatus) return false;

        const created = item.createdAt ? new Date(item.createdAt) : null;
        if (filterFrom && (!created || created < new Date(`${filterFrom}T00:00:00`)))
          return false;
        if (
          filterTo &&
          (!created || created > new Date(`${filterTo}T23:59:59`))
        )
          return false;

        return true;
      }),
    [data, filterStatus, filterFrom, filterTo],
  );

  const exportRows = filteredData.map((row) => ({
    ...row,
    createdAtText: formatDate(row.createdAt),
  }));

  // ---- Save (create or update) via API ----
  const buildPayload = (item: DepartmentType) => ({
    typeCode: item.typeCode,
    typeName: item.typeName,
    description: item.description,
    displayOrder: item.displayOrder ? Number(item.displayOrder) : null,
    status: item.status,
  });

  const handleSave = async (item: DepartmentType) => {
    try {
      if (item.id) {
        const response = await Put(
          API.update,
          { departmentTypeId: item.id, ...buildPayload(item) },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Department type updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(
            response.data?.message || "Failed to update department type.",
          );
        }
      } else {
        const response = await Post(
          API.create,
          buildPayload(item),
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Department type created successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(
            response.data?.message || "Failed to create department type.",
          );
        }
      }
    } catch {
      toasterrormsg("Something went wrong while saving the department type.");
    }
  };

  // ---- Activate / Deactivate ----
  const handleToggleStatus = async (row: DepartmentType) => {
    const nextStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await Put(
        API.update,
        {
          departmentTypeId: row.id,
          ...buildPayload({ ...row, status: nextStatus }),
        },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            `Department type ${nextStatus === "Active" ? "activated" : "deactivated"} successfully.`,
        );
        setData((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, status: nextStatus } : item,
          ),
        );
      } else {
        toasterrormsg(response.data?.message || "Failed to update status.");
      }
    } catch {
      toasterrormsg("Something went wrong while updating the status.");
    }
  };

  // ---- Delete ----
  const handleDelete = async (row: DepartmentType) => {
    try {
      const response = await Delete(
        API.delete,
        { departmentTypeId: row.id },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Department type deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(
          response.data?.message || "Failed to delete department type.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while deleting the department type.");
    }
  };

  const openDrawer = (mode: DrawerMode, row: DepartmentType | null) => {
    setDrawerMode(mode);
    setEditing(row);
    setDrawerOpen(true);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    getRowId: (row) => row.id,
    meta: {
      openViewDrawer: (row: DepartmentType) => openDrawer("view", row),
      openEditDrawer: (row: DepartmentType) => openDrawer("edit", row),
      deleteRow: (row: any) => handleDelete(row.original),
      toggleStatus: (row: DepartmentType) => handleToggleStatus(row),
    } as any,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Create Type">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Department Type"
          createLabel="Add Type"
          searchPlaceholder="Search by code or name..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer("create", emptyDepartmentType())}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "department-types")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Department Type List",
              "department-types",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
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
              <DatePicker
                label="Created From"
                value={filterFrom}
                onChange={(selectedDates: Date[]) =>
                  setFilterFrom(formatDateForApi(selectedDates?.[0]))
                }
                placeholder="Select Date"
              />
              <DatePicker
                label="Created To"
                value={filterTo}
                onChange={(selectedDates: Date[]) =>
                  setFilterTo(formatDateForApi(selectedDates?.[0]))
                }
                placeholder="Select Date"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading department types..."
              : "No department types found. Click Add Type to add one."
          }
        />
      </div>

      <DepartmentTypeDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        mode={drawerMode}
        departmentType={editing}
        types={data}
        onSave={handleSave}
      />
    </Page>
  );
}