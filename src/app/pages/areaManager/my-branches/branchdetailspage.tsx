import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  HashtagIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { toast } from "sonner";
import type { Branch } from "./shared/types";

const mapApiBranch = (r: any): Branch => {
  // 👇 Debug: Check what the API is returning

  return {
    id: String(r.id ?? r.branchId),
    branchId: r.branchId ?? r.branch_id ?? "",
    branchCode: r.branchCode ?? r.branch_code ?? "",
    branchName: r.branchName ?? r.branch_name ?? "",
    region: r.region ?? "",
    country: r.country ?? "India",
    state: r.state ?? "",
    city: r.city ?? "",
    contactNumber: r.contactNumber ?? r.contact ?? r.contact_number ?? "",
    phoneNumber: r.phoneNumber ?? r.phone_number ?? "",
    email: r.email ?? "",
    branchManager: r.branchManager ?? r.branch_manager ?? "",
    areaManager: r.areaManager ?? r.area_manager ?? "",
    openingDate: r.openingDate ?? r.opening_date ?? "",
    workingHours: r.workingHours ?? r.working_hours ?? "",
    status:
      r.status === "Inactive" || r.status === false ? "Inactive" : "Active",
    postalCode: r.postalCode ?? r.postal_code ?? "",
    fullAddress: r.fullAddress ?? r.full_address ?? "",
    profilePhoto: r.profilePhoto ?? r.profile_photo ?? null,
    createdAt: r.createdAt ?? r.created_at,
    updatedAt: r.updatedAt ?? r.updated_at,
  };
};

export default function BranchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 👇 CHANGE THIS URL to match your backend route
        const res: any = await Get(`area-manager/branch/${id}`, {}, false);

        if (res?.data?.success) {
          setBranch(mapApiBranch(res.data.data));
        }
      } catch (err) {
        toast.error("Failed to load branch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Page title="Branch Details">
        <div className="flex h-64 items-center justify-center text-gray-500">
          Loading branch details...
        </div>
      </Page>
    );
  }

  if (!branch) {
    return (
      <Page title="Branch Details">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Branch not found.</p>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Page>
    );
  }

  const isActive = branch.status === "Active";
  const initials = (branch.branchName || "B")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Page title={`Branch • ${branch.branchName}`}>
      <div className="w-full px-10 py-4 pb-10 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="dark:border-dark-600 dark:bg-dark-800 dark:hover:bg-dark-700 mt-1 cursor-pointer rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeftIcon className="size-4 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-start gap-5">
            {/* Profile Photo Rendering */}
            <div className="via-primary-500 shadow-primary-500/30 relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
              {branch.profilePhoto ? (
                <img
                  src={branch.profilePhoto}
                  alt={branch.branchName}
                  className="size-full object-cover"
                  onError={(e) => {
                    // If image fails to load, hide it and let the background show
                    console.error(
                      "Profile photo failed to load:",
                      branch.profilePhoto,
                    );
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {branch.branchName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/30"
                      : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/30"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isActive
                        ? "animate-pulse bg-emerald-600 dark:bg-emerald-400"
                        : "bg-red-600 dark:bg-red-400"
                    }`}
                  />
                  {branch.status}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-primary-600 dark:text-primary-400 flex items-center gap-1.5 font-mono">
                  <HashtagIcon className="size-4" />
                  {branch.branchId}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="font-mono">{branch.branchCode}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-4" />
                  {branch.city}, {branch.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {branch.workingHours}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="size-4" />
                  Opened {formatDate(branch.openingDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Full Width Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Contact Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <PhoneIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h3>
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                <InfoItem
                  icon={<PhoneIcon className="size-4" />}
                  label="Contact Number"
                  value={branch.contactNumber}
                />
                <InfoItem
                  icon={<PhoneIcon className="size-4" />}
                  label="Phone Number"
                  value={branch.phoneNumber || "—"}
                />
                <InfoItem
                  icon={<EnvelopeIcon className="size-4" />}
                  label="Email"
                  value={branch.email}
                />
                <InfoItem
                  icon={<HashtagIcon className="size-4" />}
                  label="Postal / PIN Code"
                  value={branch.postalCode || "—"}
                  mono
                />
              </div>
            </div>

            {/* Management Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <UserCircleIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Management
                </h3>
              </div>
              <div className="grid gap-0 sm:grid-cols-2">
                <InfoItem
                  icon={<UserCircleIcon className="size-4" />}
                  label="Branch Manager"
                  value={branch.branchManager}
                />
                <InfoItem
                  icon={<UserCircleIcon className="size-4" />}
                  label="Area Manager"
                  value={branch.areaManager}
                />
                <InfoItem
                  icon={<BuildingOffice2Icon className="size-4" />}
                  label="Region / Area"
                  value={branch.region}
                />
                <InfoItem
                  icon={<ClockIcon className="size-4" />}
                  label="Working Hours"
                  value={branch.workingHours}
                />
              </div>
            </div>

            {/* Full Address Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                <MapPinIcon className="size-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Full Address
                </h3>
              </div>
              <div className="p-6">
                <div className="border-primary-300/60 bg-primary-50/50 dark:border-primary-500/30 dark:bg-primary-900/10 rounded-lg border border-dashed p-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {branch.fullAddress || "No address provided."}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Location Details
                </h3>
              </div>
              <div className="dark:divide-dark-700 divide-y divide-gray-100">
                <SidebarItem
                  icon={<GlobeAltIcon className="size-5" />}
                  label="Country"
                  value={branch.country}
                />
                <SidebarItem
                  icon={<MapPinIcon className="size-5" />}
                  label="State"
                  value={branch.state}
                />
                <SidebarItem
                  icon={<BuildingOffice2Icon className="size-5" />}
                  label="City"
                  value={branch.city}
                />
                <SidebarItem
                  icon={<CalendarDaysIcon className="size-5" />}
                  label="Opening Date"
                  value={formatDate(branch.openingDate)}
                />
              </div>
            </div>

            {/* System Info Card */}
            <div className="dark:border-dark-700 dark:bg-dark-800 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="dark:border-dark-700 border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  System Info
                </h3>
              </div>
              <div className="dark:divide-dark-700 divide-y divide-gray-100">
                <SidebarItem
                  icon={<HashtagIcon className="size-5" />}
                  label="Branch ID"
                  value={branch.branchId}
                  mono
                />
                <SidebarItem
                  icon={<HashtagIcon className="size-5" />}
                  label="Branch Code"
                  value={branch.branchCode}
                  mono
                />
                <SidebarItem
                  icon={<CheckBadgeIcon className="size-5" />}
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
                      />
                      {branch.status}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* ---------- Helper Components ---------- */

function InfoItem({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="dark:border-dark-700/50 flex items-start gap-3 border-b border-gray-50 p-4 px-6 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          {label}
        </p>
        <p
          className={`mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="dark:hover:bg-dark-700/50 flex items-start gap-3 p-4 px-6 transition hover:bg-gray-50">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
          {label}
        </p>
        <div
          className={`mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 ${mono ? "font-mono" : ""}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
