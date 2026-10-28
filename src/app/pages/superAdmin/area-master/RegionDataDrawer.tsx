import { Fragment, useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, Put } from "@/ApiHelper";
import type { Region } from "./shared/types";

interface RegionDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
  editRegion: Region | null;
}

interface Opt {
  id: string;
  label: string;
}

// Mock Region Type Options (Replace with API fetch later)

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
function getInitialForm(editRegion: Region | null) {
  if (editRegion) {
    const countryOptions = Country.getAllCountries().map((c) => ({
      id: c.isoCode,
      label: c.name,
    }));

    const country =
      countryOptions.find((o) => o.label === editRegion.country) || null;

    let state: Opt | null = null;
    let city: Opt | null = null;

    if (country) {
      const states = State.getStatesOfCountry(country.id).map((s) => ({
        id: s.isoCode,
        label: s.name,
      }));
      state = states.find((o) => o.label === editRegion.state) || null;

      if (state) {
        const cities = City.getCitiesOfState(country.id, state.id).map((c) => ({
          id: c.name,
          label: c.name,
        }));
        city = cities.find((o) => o.label === editRegion.city) || null;
      }
    }

    return {
      id: editRegion.id,
      regionCode: editRegion.regionCode,
      regionName: editRegion.regionName,
      regionTypeId: editRegion.regionTypeId,
      description: editRegion.description,
      country,
      state,
      city,
      displayOrder: editRegion.displayOrder,
      status: editRegion.status,
    };
  }

  // New region -> generate IDs only once
  return {
    id:"",
    regionCode: "",
    regionName: "",
    regionTypeId: "",
    description: "",
    country: { id: "IN", label: "India" } as Opt,
    state: null as Opt | null,
    city: null as Opt | null,
    displayOrder: 1,
    status: "Active",
  };
}

export function RegionDataDrawer({
  isOpen,
  close,
  onSaved,
  editRegion,
}: RegionDrawerProps) {
  const [form, setForm] = useState(() => getInitialForm(editRegion));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [nextNo, setNextNo] = useState("");
  const [regionTypes, setRegionTypes] = useState<Opt[]>([]);
  const sf = (k: keyof typeof form, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        id: c.isoCode,
        label: c.name,
      })),
    [],
  );

  useEffect(() => {
    if (!isOpen || editRegion) return; // sirf create mode me
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    (async () => {
      try {
        const res = await Get(
          "superadmin/region/next-number",
          { financialYearId },
          false,
        );
        if (res?.data?.success) {
          setNextNo(res.data.data.regionNo); // 👈 backend jo field de
        }
      } catch (error) {
        console.error("Region number error:", error);
      }
    })();
  }, [isOpen, editRegion]);
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const res = await Get("superadmin/region-type/list", {}, false);

        if (res?.data?.success) {
          const list = res.data.data || [];

          setRegionTypes(
            list.map((item: any) => ({
              id: String(item.regionTypeId),
              label: item.typeName,
            })),
          );
        } else {
          setRegionTypes([]);
        }
      } catch (error) {
        console.error("Region type list error:", error);
        setRegionTypes([]);
        toast.error("Failed to load region types");
      }
    })();
  }, [isOpen]);
  const stateOptions = useMemo(
    () =>
      form.country
        ? State.getStatesOfCountry(form.country.id).map((s) => ({
            id: s.isoCode,
            label: s.name,
          }))
        : [],
    [form.country],
  );

  const cityOptions = useMemo(
    () =>
      form.country && form.state
        ? City.getCitiesOfState(form.country.id, form.state.id).map((c) => ({
            id: c.name,
            label: c.name,
          }))
        : [],
    [form.country, form.state],
  );

  const handleClose = () => {
    close();
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.regionCode.trim()) next.regionCode = "Region code is required";
    if (!form.regionName.trim()) next.regionName = "Region name is required";
    if (!form.regionTypeId) next.regionTypeId = "Region type is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    const financialYearId = localStorage.getItem("financialYearId");
    const companyId = localStorage.getItem("companyId");

    if (!financialYearId) {
      toast.error("Financial Year not found. Please select a company year.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Create ke waqt Region ID = nextNo (API se aaya)
      // ✅ Edit ke waqt Region ID = form.id (existing record)
      const regionId = editRegion ? form.id : nextNo;

      const payload: any = {
        financialYearId: Number(financialYearId),

        ...(companyId ? { companyId: Number(companyId) } : {}),

        regionCode: form.regionCode,
        regionName: form.regionName,
        description: form.description,

        regionTypeId: form.regionTypeId ? Number(form.regionTypeId) : null,

        country: form.country?.label || "",
        state: form.state?.label || "",
        city: form.city?.label || "",

        displayOrder: form.displayOrder ? Number(form.displayOrder) : null,

        status: form.status,

        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      };

      console.log("Region Payload:", payload, "regionId:", regionId);

      let response;

      if (editRegion) {
        // ✅ Update — regionId body me
        response = await Put(
          "superadmin/region/update",
          { regionId, ...payload },
          false,
        );
      } else {
        // ✅ Create — regionId body me
        response = await Post(
          "superadmin/region/create",
          { regionId, ...payload },
          false,
        );
      }

      if (response.data?.success) {
        toast.success(
          response.data?.message ||
            (editRegion
              ? "Region updated successfully"
              : "Region added successfully"),
        );
        onSaved();
        handleClose();
      } else {
        toast.error(response.data?.message || "Failed to save region.");
      }
    } catch (error) {
      console.error("Region save error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  };
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
              {editRegion ? "Edit Region / Area" : "Add Region / Area"}
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
              {/* Region ID */}
              <div>
                <FieldLabel>Region ID (Auto)</FieldLabel>
                <Input
                  value={editRegion?.regionNo || nextNo || "Generating..."}
                  readOnly
                  disabled
                  className="dark:bg-dark-800 w-full truncate bg-gray-50 text-gray-500"
                />
              </div>

              {/* Region Code */}
              <div>
                <FieldLabel required>Region Code</FieldLabel>
                <Input
                  placeholder="Enter code"
                  value={form.regionCode}
                  onChange={(e: any) => sf("regionCode", e.target.value)}
                />
                {errors.regionCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.regionCode}
                  </p>
                )}
              </div>

              {/* Region Name */}
              <div>
                <FieldLabel required>Region Name</FieldLabel>
                <Input
                  placeholder="Enter region name"
                  value={form.regionName}
                  onChange={(e: any) => sf("regionName", e.target.value)}
                />
                {errors.regionName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.regionName}
                  </p>
                )}
              </div>

              {/* Region Type */}
              <div>
                <FieldLabel required>Region / Area Type</FieldLabel>
                <Combobox
                  data={regionTypes}
                  displayField="label"
                  value={
                    regionTypes.find((t) => t.id === form.regionTypeId) || null
                  }
                  onChange={(v: any) => {
                    sf("regionTypeId", v?.id || "");

                    if (errors.regionTypeId) {
                      setErrors((p) => ({
                        ...p,
                        regionTypeId: "",
                      }));
                    }
                  }}
                  placeholder="Select region type"
                  searchFields={["label"]}
                />
                {errors.regionTypeId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.regionTypeId}
                  </p>
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

              {/* Country */}
              <div>
                <FieldLabel>Country</FieldLabel>
                <Combobox
                  data={countryOptions}
                  displayField="label"
                  value={form.country}
                  onChange={(v: any) => {
                    setForm((f) => ({
                      ...f,
                      country: v || null,
                      state: null,
                      city: null,
                    }));
                  }}
                  placeholder="Search country..."
                  searchFields={["label"]}
                />
              </div>

              {/* State */}
              <div>
                <FieldLabel>State</FieldLabel>
                <Combobox
                  data={stateOptions}
                  displayField="label"
                  value={form.state}
                  onChange={(v: any) => {
                    setForm((f) => ({ ...f, state: v || null, city: null }));
                  }}
                  placeholder="Search state..."
                  searchFields={["label"]}
                />
              </div>

              {/* City */}
              <div>
                <FieldLabel>City</FieldLabel>
                <Combobox
                  data={cityOptions}
                  displayField="label"
                  value={form.city}
                  onChange={(v: any) => sf("city", v || null)}
                  placeholder="Search city..."
                  searchFields={["label"]}
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
              <div className="sm:col-span-2">
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
              {submitting
                ? "Saving..."
                : editRegion
                  ? "Update Region"
                  : "Add Region"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
