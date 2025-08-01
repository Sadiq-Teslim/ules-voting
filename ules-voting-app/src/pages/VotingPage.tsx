/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/VotingPage.tsx
import { useState, useEffect, type ClassType } from "react";
import axios from "axios";
import { useLocation, Redirect } from "wouter";
import type { VoterInfo } from "../App"; // Import the VoterInfo type

// --- Define props for this component ---
interface VotingPageProps {
  voter: VoterInfo;
}

// --- TypeScript Types ---
interface Nominee {
  id: string;
  name: string;
  image: string | null;
}
interface Category {
  title: string;
  id: string;
  nominees: Nominee[];
}
type Selections = Record<string, string>;

const VotingPage: React.FC<VotingPageProps> = ({ voter }) => {
  const { matricNumber, fullName } = voter; // Get user details directly from props
  const [, setLocation] = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selections, setSelections] = useState<Selections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching (no changes needed here) ---
  useEffect(() => {
    const fetchNominees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/nominees.json");
        setCategories(response.data.categories);
      } catch (error) {
        setError("Could not load voting categories. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNominees();
  }, []);

  // --- Event Handlers (handleSubmitVote is slightly updated) ---
  const handleSelectNominee = (categoryId: string, nomineeName: string) => {
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeName }));
  };

  const handleSubmitVote = async () => {
    if (Object.keys(selections).length !== categories.length) {
      alert("Please select a nominee for every category.");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to submit your vote? This action is final."
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/submit`;
      const choices = Object.entries(selections).map(
        ([categoryId, nomineeName]) => ({
          categoryId,
          nomineeName,
        })
      );

      // We use the fullName and matricNumber from props now
      await axios.post(apiUrl, { fullName, matricNumber, choices });

      // In a later step, we can pass the vote summary to the success page
      setLocation("/success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred while submitting."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Security Redirect ---
  // This logic is now handled in App.tsx, but an extra check doesn't hurt.
  if (!matricNumber || !fullName) {
    return <Redirect to="/" />;
  }

  // --- Render Logic (no changes needed here) ---
  if (isLoading)
    return <div className="text-center text-xl">Loading Voting Portal...</div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          ULES Awards Voting Portal
        </h1>
        <p className="text-slate-400 mt-2">
          Welcome, <span className="font-bold text-cyan-400">{fullName}</span>!
        </p>
      </header>
      {/* The rest of the JSX for displaying categories and the button is the same */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id}>
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">
              {category.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {category.nominees.map((nominee) => (
                <div
                  key={nominee.id}
                  onClick={() => handleSelectNominee(category.id, nominee.name)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-2
                    ${
                      selections[category.id] === nominee.name
                        ? "bg-cyan-500 shadow-lg shadow-cyan-500/30 ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                        : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
                    }
                  `}
                >
                  <img
                    src={
                      nominee.image
                        ? `/nominees/${nominee.image}`
                        : `/placeholder.png`
                    }
                    alt={nominee.name}
                    className="w-full h-32 sm:h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold text-center text-white text-sm sm:text-base">
                    {nominee.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-12 text-center">
        <button
          onClick={handleSubmitVote}
          disabled={
            isSubmitting || Object.keys(selections).length !== categories.length
          }
          className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-10 sm:px-12 rounded-lg text-base sm:text-lg transition-all"
        >
          {isSubmitting ? "Submitting..." : "Complete Vote"}
        </button>
      </footer>
    </div>
  );
};

export default VotingPage;
