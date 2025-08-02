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
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- TypeScript Types ---
interface NomineeResult {
  name: string;
  votes: number;
}
interface CategoryResult {
  categoryId: string;
  nominees: NomineeResult[];
}
interface CategoryInfo {
  id: string;
  title: string;
  nominees: { id: string; name: string; imageUrl?: string }[];
}
interface Nomination {
  _id: string;
  fullName: string;
  popularName?: string;
  category: string;
  imageUrl?: string;
}
interface ResetModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
}

// --- Reusable Confirmation Modal ---
const ConfirmationModal: React.FC<
  ResetModalState & { onClose: () => void; isProcessing: boolean }
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-5 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg disabled:cursor-wait"
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
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
  const [modalState, setModalState] = useState<ResetModalState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "",
  });
  const [isProcessingModal, setIsProcessingModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getCategoryTitle = useCallback(
    (categoryId: string) =>
      categories.find((c) => c.id === categoryId)?.title || categoryId,
    [categories]
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
      setPendingNominations(nominationsRes.data);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [API_BASE_URL, password]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(handleRefresh, 15000);
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
    const totalCategories = categories.length;
    const totalNominees = categories.reduce(
      (sum, category) => sum + category.nominees.length,
      0
    );
    return { totalVotes, totalCategories, totalNominees };
  }, [results, categories]);

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById("pdf-report");
    if (!reportElement) return alert("Could not generate PDF.");
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
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
      <div className="w-full max-w-md mx-auto">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm">ULES Annual Awards System</p>
          </div>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-cyan-400"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-slate-600 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {isLoggingIn ? (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Access Dashboard"
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </form>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="text-center text-xl text-slate-400">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-slate-900 text-white">
      <ConfirmationModal
        {...modalState}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        isProcessing={isProcessingModal}
      />

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
            src="/nobguleslogo.png"
            alt="ULES Logo"
            style={{ width: "80px", height: "auto", marginRight: "20px" }}
          />
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
            University Of Lagos Engineering Society
            <br />
            Annual Awards Results
          </h1>
        </div>
        {results.map((result) => (
          <div
            key={result.categoryId}
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
              {getCategoryTitle(result.categoryId)}
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
          <div className="flex items-center justify-center w-12 h-12 bg-slate-800 rounded-lg border border-slate-700">
            <Trophy className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Live Voting Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center space-x-2">
              <span>ULES Annual Awards</span>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </p>
          </div>
        </div>
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
          <p className="text-2xl font-bold text-cyan-400">
            {stats.totalVotes.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Categories</p>
          <p className="text-2xl font-bold text-purple-400">
            {stats.totalCategories}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Nominees</p>
          <p className="text-2xl font-bold text-emerald-400">
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
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400"
            }`}
          >
            Live Results
          </button>
          <button
            onClick={() => setActiveTab("nominations")}
            className={`py-4 px-1 font-semibold relative ${
              activeTab === "nominations"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400"
            }`}
          >
            Manage Nominations{" "}
            {pendingNominations.length > 0 && (
              <span className="absolute top-3 -right-4 bg-red-500 text-white text-xs w-5 h-5 rounded-full">
                {pendingNominations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-1 font-semibold ${
              activeTab === "settings"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-400"
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {activeTab === "results" && (
        <div className="space-y-8">
          {results.map((result) => (
            <div key={result.categoryId}>
              <h3 className="font-bold text-xl text-cyan-400 mb-2">
                {getCategoryTitle(result.categoryId)}
              </h3>
              <Bar
                data={{
                  labels: result.nominees.map(n => n.name),
                  datasets: [{
                    label: getCategoryTitle(result.categoryId),
                    data: result.nominees.map(n => n.votes),
                    backgroundColor: 'rgba(14, 165, 233, 0.5)',
                    borderColor: 'rgb(14, 165, 233)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === "nominations" && (
        <section>
          <h2 className="text-3xl font-bold text-cyan-400 mb-4">
            Review Nominations
          </h2>
          {pendingNominations.length === 0 ? (
            <p className="text-slate-400 bg-slate-800 p-6 rounded-lg">
              No pending nominations.
            </p>
          ) : (
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="space-y-4">
                {Object.entries(
                  pendingNominations.reduce((acc, nom) => {
                    (acc[nom.category] = acc[nom.category] || []).push(nom);
                    return acc;
                  }, {} as Record<string, Nomination[]>)
                ).map(([categoryId, noms]) => (
                  <div key={categoryId}>
                    <h3 className="font-bold text-xl text-cyan-400 mb-2">
                      {getCategoryTitle(categoryId)} ({noms.length})
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
          <h2 className="text-3xl font-bold text-cyan-400">
            Election Settings
          </h2>
          <div className="mt-6 space-y-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="text-cyan-400" /> Election Status
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Control whether students can access the voting page.
              </p>
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
                className={`mt-4 font-semibold py-2 px-4 rounded-lg ${
                  electionStatus === "closed" ? "bg-green-600" : "bg-yellow-600"
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
                This action is permanent and cannot be undone.
              </p>
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
                className="mt-4 bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Delete All Pending Nominations
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminPage;
