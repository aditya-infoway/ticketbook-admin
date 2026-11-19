import { useForm, Controller } from "react-hook-form";
import { Page } from "@/components/shared/Page";
import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Country, State, City } from "country-state-city";
import { Account, emptyAccount } from "./shared/types";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useEffect } from "react";

export default function CreateAccountPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, control, watch, setValue } = useForm<Account>(
    {
      defaultValues: emptyAccount(),
    },
  );

  const accountName = watch("accountName");

  useEffect(() => {
    setValue("printName", accountName, { shouldValidate: true });
  }, [accountName, setValue]);

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  // Country/State/City Options based on country-state-city package
  const countryOptions = Country.getAllCountries().map((c) => ({
    id: c.isoCode,
    label: c.name,
  }));

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(
        countryOptions.find((c) => c.label === selectedCountry)?.id || "",
      ).map((s) => ({ id: s.name, label: s.name }))
    : [];

  const cityOptions =
    selectedCountry && selectedState
      ? City.getCitiesOfState(
          countryOptions.find((c) => c.label === selectedCountry)?.id || "",
          State.getStatesOfCountry(
            countryOptions.find((c) => c.label === selectedCountry)?.id || "",
          ).find((s) => s.name === selectedState)?.isoCode || "",
        ).map((c) => ({ id: c.name, label: c.name }))
      : [];

  const onSubmit = (data: Account) => {
    console.log("Saving Account:", data);
    toast.success("Account saved successfully");
    navigate("/user-master/account-master");
  };

  return (
    <Page title="Create Account">
      {/* Added primary color background to the card */}
      <div className="dark:bg-dark-800 border-primary-100 dark:border-dark-600 w-full rounded-xl border bg-white shadow-md">
        {/* Header with primary background */}
        <div className="dark:bg-dark-700 border-primary-100 bg-primary-50 dark:border-dark-600 flex items-center justify-between rounded-t-xl border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-400 dark:text-white">
            Create Account
          </h2>
          <Button
            variant="outlined"
            color="secondary"
            className="hover:bg-primary-100"
            onClick={() => navigate("/user-master/account-master")}
          >
            Back
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 lg:p-8">
          {/* 3-Column Grid: Left | Divider | Right (items-start keeps right side at the top) */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("accountName", { required: true })}
                  placeholder="Enter Account Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Print Name
                  </label>
                  <Input
                    {...register("printName")}
                    placeholder="Auto-filled from Account Name"
                    readOnly
                    disabled
                    className="dark:bg-dark-800 cursor-not-allowed bg-gray-50" // 👈 Add for visual cue
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Group <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="groupId"
                    rules={{ required: "Group is required" }}
                    render={({ field }) => (
                      <Combobox
                        data={[
                          { id: "1", label: "Sundry Debtors" },
                          { id: "2", label: "Sundry Creditors" },
                        ]}
                        value={
                          field.value
                            ? { id: field.value, label: field.value }
                            : null
                        }
                        onChange={(v: any) => field.onChange(v?.id || "")}
                        placeholder="Search Group"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Opening Balance
                  </label>
                  <Input
                    type="number"
                    {...register("openingBalance")}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Dr./Cr. <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="balanceType"
                    render={({ field }) => (
                      <Combobox
                        data={[
                          { id: "DR", label: "DR" },
                          { id: "CR", label: "CR" },
                        ]}
                        value={{ id: field.value, label: field.value }}
                        onChange={(v: any) => field.onChange(v?.id || "DR")}
                        placeholder="Select"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <Combobox
                        data={countryOptions}
                        value={
                          countryOptions.find((c) => c.label === field.value) ||
                          null
                        }
                        onChange={(v: any) => {
                          field.onChange(v?.label);
                          setValue("state", "");
                          setValue("city", "");
                        }}
                        placeholder="Select Country"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                      <Combobox
                        data={stateOptions}
                        value={
                          stateOptions.find((s) => s.label === field.value) ||
                          null
                        }
                        onChange={(v: any) => {
                          field.onChange(v?.label);
                          setValue("city", "");
                        }}
                        placeholder="Select State"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    District <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("district")}
                    placeholder="Select District"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <Combobox
                        data={cityOptions}
                        value={
                          cityOptions.find((c) => c.label === field.value) ||
                          null
                        }
                        onChange={(v: any) => field.onChange(v?.label)}
                        placeholder="Select City"
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("addressLine1")}
                  placeholder="Enter Address"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Address Line 2
                </label>
                <Input
                  {...register("addressLine2")}
                  placeholder="Enter Address Line 2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input {...register("phone")} placeholder="Phone" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mobile
                  </label>
                  <Input {...register("mobile")} placeholder="Mobile" />
                </div>
              </div>
            </div>

            {/* 👇 VERTICAL DIVIDER (In the middle) */}
            <div className="dark:bg-dark-600 hidden h-full min-h-[500px] w-px bg-gray-200 lg:block" />

            {/* RIGHT COLUMN (Aligned to top naturally because of grid items-start) */}
            <div className="space-y-5">
              {/* Phone/Mobile section moved up automatically via items-start on grid */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="Enter Email"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Contact Person
                  </label>
                  <Input
                    {...register("contactPerson")}
                    placeholder="Contact Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Birthday On
                  </label>
                  {/* Replaced standard Input with DatePicker */}
                  <Controller
                    control={control}
                    name="birthdayOn"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choose date..."
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Anniversary
                  </label>
                  <Controller
                    control={control}
                    name="anniversary"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choose date..."
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bank Account No.
                  </label>
                  <Input
                    {...register("bankAccountNo")}
                    placeholder="Account Number"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bank Name
                  </label>
                  <Input {...register("bankName")} placeholder="Bank Name" />
                </div>
              </div>
               
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    IFSC Code
                  </label>
                  <Input {...register("ifscCode")} placeholder="IFSC Code" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Branch
                  </label>
                  <Input {...register("branch")} placeholder="Branch Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    GST No.
                  </label>
                  <Input {...register("gstNo")} placeholder="Enter GST No." />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PAN Card
                  </label>
                  <Input
                    {...register("panCard")}
                    placeholder="Enter PAN Card"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Aadhar Card No.
                </label>
                <Input
                  {...register("aadharCardNo")}
                  placeholder="Enter Aadhar Card No"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="dark:border-dark-600 mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={() => navigate("/user-master/account-master")}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}
