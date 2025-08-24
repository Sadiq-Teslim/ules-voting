/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, LogOut, RefreshCw } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Import your new components
import AdminLogin from "../components/admin/AdminLogin";
import ConfirmationModal from "../components/admin/modals/ConfirmationModal";
import ResetElectionModal from "../components/admin/modals/ResetElectionModal";
import ResultsTab from "../components/admin/tabs/ResultsTab";
import NominationsTab from "../components/admin/tabs/NominationsTab";
import SettingsTab from "../components/admin/tabs/SettingsTab";

// Import types from the central types file
import type {
  CategoryResult,
  CategoryInfo,
  DepartmentInfo,
  Nomination,
  ModalState,
} from "../types/admin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPage = () => {
  // --- STATE MANAGEMENT ---
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

  // --- FIX: Using your provided backend URL ---
  const API_BASE_URL = "https://ules-voting-backend.onrender.com";

  // --- LOGIC & DATA HANDLING ---

  const handleResetElection = async () => {
    const response = await axios.post(`${API_BASE_URL}/api/reset-election`, {
      password,
    });
    handleRefresh();
    return response.data;
  };

  const getCategoryTitle = useCallback(
    (categoryId: string) => {
      const topLevelCategory = categories.find((c) => c.id === categoryId);
      if (topLevelCategory) return topLevelCategory.title;

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

  const handleLogin = async (submittedPassword: string) => {
    setPassword(submittedPassword); // Store password for future API calls
    setIsLoggingIn(true);
    setError("");
    const success = await fetchAllAdminData(submittedPassword);
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
    const interval = setInterval(handleRefresh, 180000); // Auto-refresh every 3 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, handleRefresh]);

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

  const groupedAndFilteredResults = useMemo(() => {
    const filtered = results.filter((result) =>
      getCategoryTitle(result.category)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    const grouped = {
      undergraduate: [],
      general: [],
      finalist: [],
      departmental: [],
    } as Record<string, CategoryResult[]>;
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
      categories.reduce((sum, cat) => sum + cat.nominees.length, 0) +
      departments.reduce(
        (sum, dept) =>
          sum +
          dept.subcategories.reduce(
            (subSum, sub) => subSum + sub.nominees.length,
            0
          ),
        0
      );
    return { totalVotes, totalCategories, totalNominees };
  }, [results, categories, departments]);

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

  useEffect(() => {
    document.title = "ULES Awards | Admin Dashboard";
  }, []);

  // --- RENDER LOGIC ---

  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        error={error}
      />
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

        {/* --- FIX: Hidden div for PDF generation now gets populated with data --- */}
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
            <img src="/yin_yang_logo.png" alt="Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
                Live Voting Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                ULES Dinner & Awards 2025
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
          <ResultsTab
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            results={results}
            groupedAndFilteredResults={groupedAndFilteredResults}
            getCategoryTitle={getCategoryTitle}
          />
        )}
        {activeTab === "nominations" && (
          <NominationsTab
            pendingNominations={pendingNominations}
            getCategoryTitle={getCategoryTitle}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            electionStatus={electionStatus}
            onToggleStatusClick={() =>
              setModalState({
                isOpen: true,
                title: `Confirm: ${
                  electionStatus === "closed" ? "Open" : "Close"
                } Election`,
                message: `Are you sure you want to ${
                  electionStatus === "closed" ? "OPEN" : "CLOSE"
                } the election?`,
                onConfirm: handleToggleElectionStatus,
                confirmText: `Yes, ${
                  electionStatus === "closed" ? "Open" : "Close"
                } Election`,
              })
            }
            onResetElectionClick={() => setIsResetModalOpen(true)}
            onDeleteNominationsClick={() =>
              setModalState({
                isOpen: true,
                title: "Confirm: Delete All Nominations",
                message:
                  "This will permanently delete ALL pending nominations. Are you sure?",
                onConfirm: handleDeleteAllNominations,
                confirmText: "Yes, Delete All",
              })
            }
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
