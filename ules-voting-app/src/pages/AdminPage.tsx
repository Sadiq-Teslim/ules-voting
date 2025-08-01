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
  Users,
  Award,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// --- Types ---
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
}

// --- Chart Colors to match your image ---
const chartColors = ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)"];
const chartBorderColors = ["rgb(59, 130, 246)", "rgb(16, 185, 129)"];

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getCategoryTitle = useCallback(
    (category: string) => {
      return (
        categories.find((c) => c.id === category)?.title || "Unknown Category"
      );
    },
    [categories]
  );

  const fetchAllData = useCallback(
    async (currentPassword: string) => {
      // Don't set loading to true here, handle it in login
      try {
        const [resultsRes, categoriesRes] = await Promise.all([
          axios.post(`${API_BASE_URL}/api/results`, {
            password: currentPassword,
          }),
          axios.get("/nominees.json"),
        ]);
        setResults(resultsRes.data);
        setCategories(categoriesRes.data.categories);
        return true;
      } catch (err) {
        setError("Access Denied. Invalid Password.");
        setIsAuthenticated(false);
        return false;
      }
    },
    [API_BASE_URL]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    const success = await fetchAllData(password);
    if (success) {
      setIsAuthenticated(true);
      setIsInitialLoading(false);
    }
    setIsLoggingIn(false);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/results`, { password });
      setResults(res.data);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [API_BASE_URL, password]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(handleRefresh, 15000); // Poll every 15 seconds
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
      (sum, category) => {
        const categoryData = results.find(r => r.category === category.id);
        return sum + (categoryData?.nominees.length || 0);
      },
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

  // --- LOGIN SCREEN ---
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

  // --- LOADING SCREEN (FIXES RACE CONDITION) ---
  if (isInitialLoading || categories.length === 0) {
    return (
      <div className="text-center text-xl text-slate-400">
        Loading Dashboard...
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-slate-900 text-white">
      {/* Hidden div for PDF generation */}
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

      <div className="space-y-8">
        {results.map((result) => {
          const totalVotesInCategory = result.nominees.reduce(
            (sum, nominee) => sum + nominee.votes,
            0
          );
          const winner =
            totalVotesInCategory > 0
              ? result.nominees.reduce((prev, current) =>
                  prev.votes > current.votes ? prev : current
                )
              : null;

          return (
            <section
              key={result.category}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <div className="border-b border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">
                  {getCategoryTitle(result.category)}
                </h2>
                {winner && (
                  <div className="mt-2 inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-medium">
                      Leading: {winner.name} ({winner.votes} votes)
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Vote Tally
                  </h3>
                  <ul className="space-y-2">
                    {result.nominees
                      .sort((a, b) => b.votes - a.votes)
                      .map((nominee) => {
                        const percentage =
                          totalVotesInCategory > 0
                            ? (nominee.votes / totalVotesInCategory) * 100
                            : 0;
                        return (
                          <li
                            key={nominee.name}
                            className="relative bg-slate-700/50 p-3 rounded-lg overflow-hidden"
                          >
                            <div
                              className="absolute top-0 left-0 h-full bg-cyan-500/20"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="relative flex justify-between items-center">
                              <div>
                                <span className="font-medium text-white">
                                  {nominee.name}
                                </span>
                                <p className="text-xs text-slate-400">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                              <span className="font-bold text-lg text-cyan-300">
                                {nominee.votes.toLocaleString()}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Chart
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: result.nominees.map((n) => n.name),
                        datasets: [
                          {
                            data: result.nominees.map((n) => n.votes),
                            backgroundColor: chartColors,
                            borderColor: chartBorderColors,
                            borderWidth: 1,
                            borderRadius: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: "x",
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { color: "#cbd5e1", stepSize: 1 },
                          },
                          x: { ticks: { color: "#cbd5e1" } },
                        },
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;
