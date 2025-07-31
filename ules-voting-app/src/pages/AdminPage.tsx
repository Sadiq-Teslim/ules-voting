import React, { useState, useEffect } from "react";
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

const AdminPage = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch category titles from nominees.json to match with results
  useEffect(() => {
    axios
      .get("/nominees.json")
      .then((res) => setCategories(res.data.categories));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://ules-voting-backend.onrender.com/api/results",
        { password }
      );
      setResults(response.data);
      setIsAuthenticated(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Access Denied. Invalid Password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Polling for live updates every 10 seconds after authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        const response = await axios.post(
          "https://ules-voting-backend.onrender.com/api/results",
          { password }
        );
        setResults(response.data);
      } catch (error) {
        console.error("Failed to poll for results:", error);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [isAuthenticated, password]);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-8 rounded-lg shadow-lg"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 font-bold py-2 rounded-lg"
          >
            {isLoading ? "Verifying..." : "Login"}
          </button>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </form>
      </div>
    );
  }

  const getCategoryTitle = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.title || categoryId;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Live Voting Results
      </h1>
      <div className="space-y-8">
        {results.map((result) => (
          <div key={result.categoryId} className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              {getCategoryTitle(result.categoryId)}
            </h2>
            <Bar
              data={{
                labels: result.nominees.map((n) => n.name),
                datasets: [
                  {
                    label: "Votes",
                    data: result.nominees.map((n) => n.votes),
                    backgroundColor: "rgba(34, 211, 238, 0.6)",
                    borderColor: "rgba(34, 211, 238, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                indexAxis: "y", // Makes it a horizontal bar chart
                scales: {
                  x: { ticks: { color: "white" } },
                  y: { ticks: { color: "white" } },
                },
                plugins: { legend: { labels: { color: "white" } } },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
