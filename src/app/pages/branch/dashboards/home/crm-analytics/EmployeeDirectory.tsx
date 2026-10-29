// src/app/(protected)/dashboards/home/TicketDirectory.tsx
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { MasterTable } from "../crm-analytics/shared/MasterTable"; 
import { ticketColumns } from "./Columns";
import { Ticket, initialTickets } from "./data"; // Ensure data.ts mein Ticket interface ho

export function TicketDirectory() {
  const [data, setData] = useState<Ticket[]>(initialTickets);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns: ticketColumns,
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
        <div className="flex items-center justify-between">
            <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
            Recent Tickets
            </h2>
            {/* Real projects mein yahan "Book New Ticket" ka button hota hai */}
           
        </div>
        <div className="mt-4 max-w-sm">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            placeholder="Search tickets by ID, subject..."
          />
        </div>
      </div>
      <MasterTable table={table} columnCount={ticketColumns.length} emptyMessage="No tickets found." />
    </div>
  );
}