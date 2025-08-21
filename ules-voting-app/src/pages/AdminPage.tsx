/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Download,
  LogOut,
  Trophy,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  ShieldAlert,
  Search,
  ChevronDown,
  CheckCircle,
  Users,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- TypeScript Types (Unchanged) ---
interface NomineeResult {
  name: string;
  votes: number;
}
interface CategoryResult {
  category: string;
  nominees: NomineeResult[];
}
interface CategoryInfo {
  id: string;
  title: string;
  nominees: { id: string; name: string; imageUrl?: string }[];
}
interface SubCategoryInfo {
  id: string;
  title: string;
  nominees: [];
}
interface DepartmentInfo {
  id: string;
  title: string;
  subcategories: SubCategoryInfo[];
}
interface Nomination {
  _id: string;
  fullName: string;
  popularName?: string;
  category: string;
  imageUrl?: string;
}
interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
}

// --- Reusable Confirmation Modal (Themed) ---
const ConfirmationModal: React.FC<
  ModalState & { onClose: () => void; isProcessing: boolean }
> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isProcessing,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg disabled:bg-red-800 disabled:cursor-wait transition-colors"
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Multi-Step Reset Election Modal (Themed & Functional) ---
const ResetElectionModal = ({
  isOpen,
  onClose,
  onConfirmReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<{ message: string }>;
}) => {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setInputValue("");
        setSuccessMessage("");
        setIsProcessing(false);
      }, 300);
    }
  }, [isOpen]);

  const handleFinalConfirm = async () => {
    if (inputValue !== "RESET") return;
    setIsProcessing(true);
    try {
      const result = await onConfirmReset();
      setSuccessMessage(result.message);
      setStep(3);
      setTimeout(onClose, 3000);
    } catch (error: any) {
      alert(
        `An error occurred: ${error.response?.data?.message || error.message}`
      );
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl text-center">
        {step === 1 && (
          <>
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">
              Are you absolutely sure?
            </h2>
            <p className="text-slate-300 my-4">
              This will permanently delete all votes and voter records. This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg"
              >
                I Understand, Continue
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-white">Final Confirmation</h2>
            <p className="text-slate-300 my-4">
              To confirm, please type{" "}
              <strong className="text-red-400">RESET</strong> in the box below.
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white text-center tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="RESET"
            />
            <button
              onClick={handleFinalConfirm}
              disabled={inputValue !== "RESET" || isProcessing}
              className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Resetting..." : "Reset Election Data"}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Success</h2>
            <p className="text-slate-300 my-4">{successMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};

// --- Accordion Component (Themed) ---
const ResultsAccordion = ({
  title,
  results,
  getCategoryTitle,
}: {
  title: string;
  results: CategoryResult[];
  getCategoryTitle: (id: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  if (results.length === 0) return null;
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <h2 className="text-2xl font-bold text-amber-400">
          {title} ({results.length})
        </h2>
        <ChevronDown
          className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-8 border-t border-slate-700">
          {results.map((result) => (
            <div key={result.category}>
              <h3 className="font-bold text-xl text-amber-200 mb-2">
                {getCategoryTitle(result.category)}
              </h3>
              <Bar
                data={{
                  labels: result.nominees.map((n) => n.name),
                  datasets: [
                    {
                      label: "Votes",
                      data: result.nominees.map((n) => n.votes),
                      backgroundColor: "rgba(252, 211, 77, 0.5)",
                      borderColor: "rgb(251, 191, 36)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, color: "#94a3b8" },
                      grid: { color: "#334155" },
                    },
                    x: { ticks: { color: "#94a3b8" } },
                  },
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [pendingNominations, setPendingNominations] = useState<Nomination[]>(
    []
  );
  const [electionStatus, setElectionStatus] = useState<"open" | "closed">(
    "closed"
  );
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "",
  });
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleResetElection = async () => {
    const response = await axios.post(`${API_BASE_URL}/api/reset-election`, {
      password: password,
    });
    handleRefresh();
    return response.data;
  };

  const getCategoryTitle = useCallback(
    (categoryId: string) => {
      const topLevelCategory = categories.find((c) => c.id === categoryId);
      if (topLevelCategory) {
        return topLevelCategory.title;
      }
      for (const department of departments) {
        const subCategory = department.subcategories.find(
          (sc) => sc.id === categoryId
        );
        if (subCategory) {
          return `${department.title.replace("Departmental Awards - ", "")}: ${
            subCategory.title
          }`;
        }
      }
      return categoryId;
    },
    [categories, departments]
  );
  const fetchAllAdminData = useCallback(
    async (currentPassword: string) => {
      setIsInitialLoading(true);
      try {
        const [resultsRes, nominationsRes, categoriesRes, statusRes] =
          await Promise.all([
            axios.post(`${API_BASE_URL}/api/results`, {
              password: currentPassword,
            }),
            axios.post(`${API_BASE_URL}/api/pending-nominations`, {
              password: currentPassword,
            }),
            axios.get("/nominees.json"),
            axios.get(`${API_BASE_URL}/api/election-status`),
          ]);
        setResults(resultsRes.data);
        setPendingNominations(nominationsRes.data);
        setCategories(categoriesRes.data.categories);
        setDepartments(categoriesRes.data.departments);
        setElectionStatus(statusRes.data.status);
        return true;
      } catch (err) {
        setError("Access Denied. Invalid Password.");
        setIsAuthenticated(false);
        return false;
      } finally {
        setIsInitialLoading(false);
      }
    },
    [API_BASE_URL]
  );
  const groupedAndFilteredResults = useMemo(() => {
    const filtered = results.filter((result) =>
      getCategoryTitle(result.category)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    const grouped = {
      undergraduate: [] as CategoryResult[],
      general: [] as CategoryResult[],
      finalist: [] as CategoryResult[],
      departmental: [] as CategoryResult[],
    };
    for (const result of filtered) {
      if (result.category.startsWith("ug-")) grouped.undergraduate.push(result);
      else if (result.category.startsWith("gen-")) grouped.general.push(result);
      else if (result.category.startsWith("fin-"))
        grouped.finalist.push(result);
      else if (result.category.startsWith("dept-"))
        grouped.departmental.push(result);
    }
    return grouped;
  }, [results, searchTerm, getCategoryTitle]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    const success = await fetchAllAdminData(password);
    if (success) setIsAuthenticated(true);
    setIsLoggingIn(false);
  };
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [resultsRes, nominationsRes] = await Promise.all([
        axios.post(`${API_BASE_URL}/api/results`, { password }),
        axios.post(`${API_BASE_URL}/api/pending-nominations`, { password }),
      ]);
      setResults(resultsRes.data);
      setPendingNominations(nominationsRes.data || []);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [API_BASE_URL, password]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(handleRefresh, 180000);
    return () => clearInterval(interval);
  }, [isAuthenticated, handleRefresh]);
  const stats = useMemo(() => {
    const totalVotes = results.reduce(
      (sum, category) =>
        sum +
        category.nominees.reduce(
          (catSum, nominee) => catSum + nominee.votes,
          0
        ),
      0
    );
    const totalCategories =
      categories.length +
      departments.reduce((sum, dept) => sum + dept.subcategories.length, 0);
    const totalNominees =
      categories.reduce((sum, category) => sum + category.nominees.length, 0) +
      departments.reduce(
        (deptSum, dept) =>
          deptSum +
          dept.subcategories.reduce(
            (subSum, sub) => subSum + sub.nominees.length,
            0
          ),
        0
      );
    return { totalVotes, totalCategories, totalNominees };
  }, [results, categories, departments]);
  useEffect(() => {
    document.title = "ULES Awards | Admin Dashboard";
  }, []);
  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById("pdf-report");
    if (!reportElement) return alert("Could not generate PDF.");
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(
        imgData,
        "JPEG",
        10,
        10,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      pdf.save(
        `ules-awards-results-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleToggleElectionStatus = async () => {
    setIsProcessingModal(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/toggle-election`, {
        password,
      });
      setElectionStatus(res.data.newStatus);
    } catch (err) {
      alert("Failed to change status.");
    } finally {
      setIsProcessingModal(false);
      setModalState({ ...modalState, isOpen: false });
    }
  };
  const handleDeleteAllNominations = async () => {
    setIsProcessingModal(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/delete-nominations`, {
        password,
      });
      alert(res.data.message);
      setPendingNominations([]);
    } catch (err) {
      alert("Failed to delete nominations.");
    } finally {
      setIsProcessingModal(false);
      setModalState({ ...modalState, isOpen: false });
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="h-screen w-full bg-black relative flex items-center justify-center p-4"
        style={{ backgroundImage: "url('/ornate_frame_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div className="w-full max-w-md mx-auto relative z-10">
          <form
            onSubmit={handleLogin}
            className="bg-slate-900/70 p-8 rounded-2xl shadow-2xl border border-slate-700/50"
          >
            <div className="text-center mb-8">
              <img
                src="/yin_yang_logo.png"
                alt="Event Logo"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm">
                ULES Dinner & Awards 2025
              </p>
            </div>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-600 disabled:to-slate-700 text-black font-bold py-3 rounded-xl shadow-lg disabled:text-slate-400"
            >
              {isLoggingIn ? "Verifying..." : "Access Dashboard"}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-xl text-slate-400">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <ConfirmationModal
          {...modalState}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          isProcessing={isProcessingModal}
        />
        <ResetElectionModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirmReset={handleResetElection}
        />

        {/* PDF Report Div - Unchanged */}
        <div
          id="pdf-report"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "800px",
            padding: "40px",
            backgroundColor: "white",
            color: "black",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "2px solid #333",
              paddingBottom: "20px",
              marginBottom: "30px",
            }}
          >
            <img
              src="/yin_yang_logo.png"
              alt="ULES Logo"
              style={{ width: "80px", height: "auto", marginRight: "20px" }}
            />
            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
              ULES Dinner & Awards 2025
              <br />
              Annual Awards Results
            </h1>
          </div>
          {results.map((result) => (
            <div
              key={result.category}
              style={{ marginBottom: "30px", pageBreakInside: "avoid" }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "5px",
                  marginBottom: "10px",
                }}
              >
                {getCategoryTitle(result.category)}
              </h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {result.nominees
                  .sort((a, b) => b.votes - a.votes)
                  .map((nominee) => (
                    <li
                      key={nominee.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        fontSize: "16px",
                      }}
                    >
                      <span>{nominee.name}</span>
                      <span style={{ fontWeight: "bold" }}>
                        {nominee.votes} Votes
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <img
              src="/yin_yang_logo.png"
              alt="Logo"
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                Live Voting Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                ULES Dinner & Awards 2025
              </p>
            </div>
          </div>
          {/* --- FIX: RE-ADDED HEADER BUTTONS --- */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "..." : "PDF"}</span>
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword("");
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Total Votes</p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.totalVotes.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Categories</p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.totalCategories}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Nominees</p>
            <p className="text-2xl font-bold text-amber-400">
              {stats.totalNominees}
            </p>
          </div>
        </div>

        <div className="mb-8 border-b border-slate-700">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("results")}
              className={`py-4 px-1 font-semibold ${
                activeTab === "results"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-slate-400"
              }`}
            >
              Live Results
            </button>
            {/* --- FIX: RE-ADDED MANAGE NOMINATIONS TAB --- */}
            <button
              onClick={() => setActiveTab("nominations")}
              className={`py-4 px-1 font-semibold relative ${
                activeTab === "nominations"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-slate-400"
              }`}
            >
              Manage Nominations{" "}
              {pendingNominations.length > 0 && (
                <span className="absolute top-3 -right-4 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {pendingNominations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 font-semibold ${
                activeTab === "settings"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-slate-400"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {activeTab === "results" && (
          <section>
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for an award category..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {results.length === 0 && (
              <div className="text-center py-20 bg-slate-800/50 rounded-lg border border-slate-700">
                <Trophy className="mx-auto w-16 h-16 text-slate-500 mb-4" />
                <h3 className="text-xl font-bold text-white">No Results Yet</h3>
                <p className="text-slate-400 mt-2">
                  Live voting results will appear here once votes are cast.
                </p>
              </div>
            )}

            {/* --- FIX: RE-ADDED RESULTS ACCORDIONS --- */}
            <div className="space-y-6">
              <ResultsAccordion
                title="Undergraduate Awards"
                results={groupedAndFilteredResults.undergraduate}
                getCategoryTitle={getCategoryTitle}
              />
              <ResultsAccordion
                title="General Awards"
                results={groupedAndFilteredResults.general}
                getCategoryTitle={getCategoryTitle}
              />
              <ResultsAccordion
                title="Finalist Awards"
                results={groupedAndFilteredResults.finalist}
                getCategoryTitle={getCategoryTitle}
              />
              <ResultsAccordion
                title="Departmental Awards"
                results={groupedAndFilteredResults.departmental}
                getCategoryTitle={getCategoryTitle}
              />
              {results.length > 0 &&
                Object.values(groupedAndFilteredResults).every(
                  (arr) => arr.length === 0
                ) && (
                  <div className="text-center py-10 bg-slate-800/50 rounded-lg">
                    <p className="text-slate-400">
                      No results found for "{searchTerm}".
                    </p>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* --- FIX: RE-ADDED NOMINATIONS SECTION --- */}
        {activeTab === "nominations" && (
          <section>
            <h2 className="text-3xl font-bold text-amber-400 mb-4">
              Review Nominations
            </h2>
            {pendingNominations.length === 0 ? (
              <div className="text-center py-20 bg-slate-800/50 rounded-lg border border-slate-700">
                <Users className="mx-auto w-16 h-16 text-slate-500 mb-4" />
                <h3 className="text-xl font-bold text-white">
                  All Caught Up!
                </h3>
                <p className="text-slate-400 mt-2">
                  There are no pending nominations to review at this time.
                </p>
              </div>
            ) : (
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="space-y-4">
                  {Object.entries(
                    pendingNominations.reduce((acc, nom) => {
                      (acc[nom.category] = acc[nom.category] || []).push(nom);
                      return acc;
                    }, {} as Record<string, Nomination[]>)
                  ).map(([category, noms]) => (
                    <div key={category}>
                      <h3 className="font-bold text-xl text-amber-200 mb-2">
                        {getCategoryTitle(category)} ({noms.length})
                      </h3>
                      <ul className="space-y-2">
                        {noms.map((nom) => (
                          <li
                            key={nom._id}
                            className="flex items-center gap-4 bg-slate-700 p-2 rounded"
                          >
                            <img
                              src={nom.imageUrl || "/placeholder.png"}
                              alt={nom.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className="font-semibold">
                              {nom.fullName}{" "}
                              {nom.popularName && `(${nom.popularName})`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "settings" && (
          <section>
            <h2 className="text-3xl font-bold text-amber-400">
              Election Settings
            </h2>
            <div className="mt-6 space-y-6">
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="text-amber-400" /> Election Status
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Control whether students can access the voting page.
                </p>
                {/* --- FIX: RE-ADDED STATUS & TOGGLE BUTTON --- */}
                <p className="mt-4">
                  Current Status:{" "}
                  <span
                    className={`font-bold px-2 py-1 rounded-full text-sm ${
                      electionStatus === "open"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {electionStatus.toUpperCase()}
                  </span>
                </p>
                <button
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      title: `Confirm: ${
                        electionStatus === "closed" ? "Open" : "Close"
                      } Election`,
                      message: `Are you sure you want to ${
                        electionStatus === "closed" ? "OPEN" : "CLOSE"
                      } the election for all users?`,
                      onConfirm: handleToggleElectionStatus,
                      confirmText: `Yes, ${
                        electionStatus === "closed" ? "Open" : "Close"
                      } Election`,
                    })
                  }
                  className={`mt-4 font-semibold py-2 px-4 rounded-lg transition-colors ${
                    electionStatus === "closed"
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-yellow-600 hover:bg-yellow-500"
                  }`}
                >
                  {electionStatus === "closed"
                    ? "Open Election"
                    : "Close Election"}
                </button>
              </div>

              <div className="bg-slate-800 p-6 rounded-lg border border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <ShieldAlert /> Danger Zone
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  These actions are permanent and cannot be undone.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Reset Election Data
                  </button>
                  <button
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        title: "Confirm: Delete All Nominations",
                        message:
                          "This will permanently delete ALL pending nominations. This is useful for clearing out old data before a new election. Are you sure?",
                        onConfirm: handleDeleteAllNominations,
                        confirmText: "Yes, Delete All",
                      })
                    }
                    className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Delete All Pending Nominations
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminPage;