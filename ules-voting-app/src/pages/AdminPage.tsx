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
  categoryId: string;
  nominees: NomineeResult[];
}
interface CategoryInfo {
  id: string;
  title: string;
}

// --- Chart Colors ---
const chartColors = [
  "rgba(59, 130, 246, 0.7)", // blue-500
  "rgba(16, 185, 129, 0.7)", // emerald-500
  "rgba(239, 68, 68, 0.7)", // red-500
  "rgba(245, 158, 11, 0.7)", // amber-500
  "rgba(139, 92, 246, 0.7)", // violet-500
  "rgba(236, 72, 153, 0.7)", // pink-500
];

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // --- Data Fetching ---
  const fetchResults = useCallback(async () => {
    if (!password) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        password,
      });
      setResults(response.data);
    } catch (err) {
      console.error("Failed to fetch results:", err);
      setError("Access Denied or failed to fetch results.");
      setIsAuthenticated(false);
    }
  }, [password, API_BASE_URL]);

  useEffect(() => {
    axios
      .get("/nominees.json")
      .then((res) => setCategories(res.data.categories));
  }, []);

  // --- Authentication & Polling ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/results`, {
        password,
      });
      setResults(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError("Access Denied. Invalid Password.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchResults]);

  // --- Vote Reset Functionality ---
  const handleResetCategory = async (categoryId: string) => {
    const categoryTitle = getCategoryTitle(categoryId);
    if (
      !window.confirm(
        `Are you absolutely sure you want to reset all votes for "${categoryTitle}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/reset-category`, {
        password,
        categoryId,
      });
      alert(`Votes for "${categoryTitle}" have been successfully reset.`);
      fetchResults();
    } catch (err) {
      alert("Failed to reset votes. Check console for details.");
    }
  };

  const getCategoryTitle = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.title || categoryId;

  // --- NEW: Memoized calculations for the summary ---
  const summaryStats = useMemo(() => {
    const totalVotes = results.reduce(
      (acc, category) =>
        acc +
        category.nominees.reduce((sum, nominee) => sum + nominee.votes, 0),
      0
    );

    // Note: This assumes one result entry per category voter. For unique voters, another API endpoint would be needed.
    // For now, we can count total votes as a proxy for engagement.
    const totalVoters =
      results.length > 0
        ? results[0].nominees.reduce((sum, n) => sum + n.votes, 0)
        : 0;

    return { totalVotes, totalVoters };
  }, [results]);

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700"
        >
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            Admin Dashboard
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 font-bold py-2 rounded-lg transition-colors disabled:bg-slate-600"
          >
            {isLoading ? "Verifying..." : "Login"}
          </button>
          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}
        </form>
      </div>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Live Voting Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Real-time results for the ULES Annual Awards.
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg text-sm self-start sm:self-center"
        >
          Logout
        </button>
      </header>

      {/* --- NEW: Overall Summary Section --- */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-400">Total Voters</h2>
          <p className="text-5xl font-bold text-cyan-400 mt-2">
            {summaryStats.totalVoters}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-400">
            Total Votes Cast
          </h2>
          <p className="text-5xl font-bold text-cyan-400 mt-2">
            {summaryStats.totalVotes}
          </p>
        </div>
      </section>

      {/* --- Numerical Tally Section --- */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">Vote Tally</h2>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {results.map((result) => (
              <div key={result.categoryId}>
                <h3 className="font-bold text-xl text-cyan-500 mb-3 border-b border-slate-700 pb-2">
                  {getCategoryTitle(result.categoryId)}
                </h3>
                <ul className="space-y-2 text-sm">
                  {result.nominees
                    .sort((a, b) => b.votes - a.votes)
                    .map((nominee) => (
                      <li
                        key={nominee.name}
                        className="flex justify-between items-center text-slate-300"
                      >
                        <span>{nominee.name}</span>
                        <span className="font-bold text-white bg-slate-700 px-2.5 py-1 rounded-full text-xs">
                          {nominee.votes}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Graphical Results Section --- */}
      <section>
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">
          Graphical Results
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {results.map((result) => (
            <div
              key={result.categoryId}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-500">
                  {getCategoryTitle(result.categoryId)}
                </h3>
                <button
                  onClick={() => handleResetCategory(result.categoryId)}
                  className="bg-red-700 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors"
                >
                  Reset Votes
                </button>
              </div>
              <Bar
                data={{
                  labels: result.nominees.map((n) => n.name),
                  datasets: [
                    {
                      label: "Votes",
                      data: result.nominees.map((n) => n.votes),
                      backgroundColor: result.nominees.map(
                        (_, i) => chartColors[i % chartColors.length]
                      ),
                      borderColor: result.nominees.map((_, i) =>
                        chartColors[i % chartColors.length].replace("0.7", "1")
                      ),
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  indexAxis: "x",
                  responsive: true,
                  scales: {
                    y: {
                      ticks: { color: "#cbd5e1", stepSize: 1 },
                      grid: { color: "rgba(100, 116, 139, 0.2)" },
                    },
                    x: {
                      ticks: { color: "#cbd5e1" },
                      grid: { display: false },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
