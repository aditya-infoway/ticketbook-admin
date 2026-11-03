// src/app/pages/employee/my-ticket/TicketDetailsPage.tsx
import { useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  PaperClipIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TagIcon,
  BuildingOffice2Icon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";

export default function TicketDetailsPage() {
  const navigate = useNavigate();

  // STATIC MOCK DATA FOR PREMIUM DESIGN VIEW
  const ticket = {
    ticketNo: "#TKT-2026-00125",
    subject: "Unable to access monthly report",
    status: "In Progress",
    createdDate: "30 Oct 2026, 09:15 AM",
    department: "Accounts",
    category: "System Issue",
    priority: "High",
    assignedTo: "IT Support",
    description:
      "Unable to access the monthly report from the employee dashboard. When I click on the 'Generate Report' button, the page loads for a few seconds and then displays a blank screen. I have tried clearing my cache and using a different browser, but the issue persists.",
    attachments: ["error-screenshot.pdf"],
    timeline: [
      {
        title: "Ticket Created",
        time: "30 Oct 2026, 09:15 AM",
        desc: "Ticket submitted by employee.",
      },
      {
        title: "Assigned to IT Support",
        time: "30 Oct 2026, 09:30 AM",
        desc: "Ticket assigned to resolver team.",
      },
      {
        title: "Status Changed: In Progress",
        time: "30 Oct 2026, 10:00 AM",
        desc: "Work started by resolver team.",
      },
    ],
  };

  return (
    <Page title={`Ticket ${ticket.ticketNo}`}>
      <div className="mx-auto max-w-6xl pb-10">
        {/* ================= HEADER ================= */}
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 mt-1 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition hover:bg-gray-50"
            >
              <ArrowLeftIcon className="size-4 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {ticket.ticketNo}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/30">
                  <span className="size-1.5 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
                  {ticket.status}
                </span>
              </div>
              <h2 className="mt-1.5 text-lg font-medium text-gray-700 dark:text-gray-200">
                {ticket.subject}
              </h2>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {ticket.createdDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              className="dark:border-dark-600 h-10 border-gray-300"
            >
              Reassign
            </Button>
            <Button
              color="primary"
              className="shadow-primary-500/30 h-10 shadow-sm"
            >
              Add Reply
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ================= LEFT COLUMN (MAIN CONTENT) ================= */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <DocumentTextIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Issue Description
                </h3>
              </div>
              <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {ticket.description}
              </div>
            </div>

            {/* Attachments Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <PaperClipIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Attachments
                </h3>
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                {ticket.attachments.map((file, i) => (
                  <a
                    key={i}
                    href="#"
                    className="group dark:border-dark-600 dark:hover:border-dark-500 dark:bg-dark-700/50 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-gray-300 hover:bg-gray-100"
                  >
                    <div className="rounded-md bg-red-100 p-2 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                      <DocumentTextIcon className="size-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {file}
                      </p>
                      <p className="text-xs text-gray-500">Click to download</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Activity Timeline Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <ClockIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Activity Timeline
                </h3>
              </div>
              <div className="p-6">
                <div className="dark:border-dark-600 relative ml-3 space-y-8 border-l-2 border-gray-100 pb-2">
                  {ticket.timeline.map((event, i) => (
                    <div key={i} className="relative pl-6">
                      <span className="dark:bg-dark-800 dark:ring-dark-800 absolute top-0.5 -left-[9px] flex size-4 items-center justify-center rounded-full bg-white ring-4 ring-white">
                        <span className="bg-primary-500 size-2.5 rounded-full" />
                      </span>
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-500">
                          {event.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Comment Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <ChatBubbleLeftRightIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Add Reply
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  className="focus:border-primary-500 focus:ring-primary-500 dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  rows={4}
                  placeholder="Type your reply here..."
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    You can also attach screenshots.
                  </p>
                  <Button color="primary" className="gap-2 px-6">
                    <PaperAirplaneIcon className="size-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR METADATA) ================= */}
          <div className="space-y-6">
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ticket Details
                </h3>
              </div>
              <div className="dark:divide-dark-700 divide-y divide-gray-100">
                {/* Department */}
                <div className="dark:hover:bg-dark-700/50 flex items-start gap-3 p-4 px-6 transition hover:bg-gray-50">
                  <BuildingOffice2Icon className="mt-0.5 size-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ticket.department}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="dark:hover:bg-dark-700/50 flex items-start gap-3 p-4 px-6 transition hover:bg-gray-50">
                  <TagIcon className="mt-0.5 size-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Category
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ticket.category}
                    </p>
                  </div>
                </div>

                {/* Priority */}
                <div className="dark:hover:bg-dark-700/50 flex items-start gap-3 p-4 px-6 transition hover:bg-gray-50">
                  <ShieldCheckIcon className="mt-0.5 size-5 text-gray-400" />
                  <div className="w-full">
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Priority
                    </p>
                    <div className="mt-1.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          ticket.priority === "High"
                            ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30"
                            : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="dark:hover:bg-dark-700/50 flex items-start gap-3 p-4 px-6 transition hover:bg-gray-50">
                  <UserCircleIcon className="mt-0.5 size-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Assigned To
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 flex size-6 items-center justify-center rounded-full text-xs font-bold">
                        IT
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ticket.assignedTo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
