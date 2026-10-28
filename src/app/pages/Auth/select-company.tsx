import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { useAuthContext } from "@/app/contexts/auth/context";
import { APP_LOGO } from "@/constants/app";
import { CreateCompanyForm } from "./CreateCompany";
import { Get, toasterrormsg } from "@/ApiHelper";

interface FinancialYearRow {
  financialYearId: number;
  companyDetailsId: number;
  companyId: number;
  startDate: string;
  endDate: string;
  companyName: string;
}

function formatCompanyDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-GB", opts)} - ${end.toLocaleDateString("en-GB", opts)}`;
}

export default function SelectCompany() {
  const { user, completeAuth } = useAuthContext();
const isEmployee = ["employee", "branch"].includes((user as any)?.role);
  const navigate = useNavigate();
  const [financialYears, setFinancialYears] = useState<FinancialYearRow[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchFinancialYears = async () => {
    setLoading(true);
    try {
      if (isEmployee) {
        setFinancialYears((user as any)?.financialYears || []);
        return;
      }

      const response = await Get("superadmin/financial-years", {}, false);
      if (response.data?.success) {
        setFinancialYears(response.data.data || []);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch companies.");
        setFinancialYears([]);
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching companies.");
      setFinancialYears([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FIX — completeAuth() call kiya + path sahi kiya
  const handleCompanySelect = (row: FinancialYearRow) => {
    setSelectedRowId(row.financialYearId);
    localStorage.setItem("financialYearId", String(row.financialYearId));
    localStorage.setItem("companyDetailsId", String(row.companyDetailsId));

    completeAuth(String(row.companyId)); // 👈 isAuthenticated ko true karega
    navigate("/dashboards/home"); // 👈 "dashboard" nahi, "dashboards" (route config ke mutabik)
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchFinancialYears();
  };

  const hasCompanies = financialYears.length > 0;

  return (
    <Page title="Select Company">
      <main className="min-h-screen bg-white">
        <div className="w-full">
          <div className="grid min-h-screen grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
            {/* Left Side */}
            <div className="relative flex min-h-screen flex-col justify-between bg-white">
              {/* Top Section: Logo, Title, and Table */}
              <div className="w-full">
                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center bg-white py-6 pt-40">
                  <img
                    src={APP_LOGO}
                    alt="Ticket Book"
                    className="h-30 w-100"
                  />
                </div>

                {showCreateForm ? (
                  <div className="p-6">
                    <CreateCompanyForm
                      onCancel={() => setShowCreateForm(false)}
                      onSuccess={handleCreateSuccess}
                    />
                  </div>
                ) : (
                  <div className="w-full px-6 py-4 sm:px-10">
                    {/* Header Banner */}
                    <div
                      className="rounded-t-sm px-4 py-3 text-left text-lg font-bold tracking-wide text-white"
                      style={{ backgroundColor: "#1a2fa8" }}
                    >
                      Select Company
                    </div>

                    {/* Table Container */}
                    <div className="w-full overflow-hidden rounded-b-sm border border-t-0 border-gray-300 shadow-sm">
                      {/* Table Header */}
                      <div className="grid grid-cols-2 border-b border-gray-300 bg-gray-100 px-4 py-2.5 text-xs font-bold tracking-wider text-gray-700 uppercase">
                        <span>COMPANY NAME</span>
                        <span className="text-right">DATE</span>
                      </div>

                      {/* Fixed Height Scrollable Rows */}
                      <div className="h-[320px] divide-y divide-gray-200 overflow-y-auto bg-white">
                        {loading ? (
                          <div className="bg-white px-4 py-12 text-center text-sm text-gray-400">
                            Loading...
                          </div>
                        ) : financialYears.length === 0 ? (
                          <div className="bg-white px-4 py-12 text-center text-sm text-gray-400">
                            {isEmployee
                              ? "No financial year found. Please contact the administrator."
                              : "No companies found. Create a new company to continue."}
                          </div>
                        ) : (
                          financialYears.map((row, index) => (
                            <button
                              key={row.financialYearId}
                              type="button"
                              onClick={() => handleCompanySelect(row)}
                              className={`grid w-full grid-cols-2 px-4 py-3.5 text-left text-xs font-medium transition-colors ${
                                selectedRowId === row.financialYearId
                                  ? "bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-300 ring-inset"
                                  : index % 2 === 0
                                    ? "bg-white text-gray-800 hover:bg-gray-50"
                                    : "bg-gray-50 text-gray-800 hover:bg-gray-100/70"
                              }`}
                            >
                              <span className="truncate pr-4 font-semibold text-gray-700">
                                {row.companyName}
                              </span>
                              <span className="text-right font-medium whitespace-nowrap text-gray-500">
                                {formatCompanyDateRange(
                                  row.startDate,
                                  row.endDate,
                                )}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pinned Action Button at Bottom - only when no companies exist */}
          {!showCreateForm && !loading && !hasCompanies && !isEmployee && (
                <div className="sticky bottom-2 z-10 w-full rounded-lg border-t bg-white px-10 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full py-4"
                    color="primary"
                  >
                    Create Company
                  </Button>
                </div>
              )}
            </div>

            {/* Right Side - Branding Banner Image */}
            <div className="relative hidden items-center justify-center bg-[#b81d24] lg:flex">
              <img
                src="images/ammar/login.png"
                alt="Select Company"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </Page>
  );
}
