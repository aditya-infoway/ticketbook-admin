// src/app/(protected)/dashboards/home/TicketDirectory.tsx (Pehle EmployeeDirectory.tsx tha)
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../crm-analytics/shared/MasterTable"; // Path check kar lein
import { ticketColumns } from "./Columns";
import { Ticket, initialTickets } from "./data";

export function TicketDirectory() {
  const [data, setData] = useState<Ticket[]>(initialTickets);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns: ticketColumns, // Yahan naye columns pass kiye
    state: { globalFilter, sorting },
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
    <div>
      <div className="px-(--margin-x) pt-4">
        <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
          Recent Tickets
        </h2>
        <div className="mt-4 max-w-sm">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            classNames={{
              input: "ring-primary-500/50 h-9 text-sm focus:ring-3",
            }}
            placeholder="Search tickets..."
          />
        </div>
      </div>

      <MasterTable
        table={table}
        columnCount={ticketColumns.length}
        emptyMessage="No tickets found."
      />
    </div>
  );
}