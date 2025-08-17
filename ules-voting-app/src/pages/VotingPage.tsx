/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, Redirect } from "wouter";
import type { VoterInfo } from "../App";
import ConfirmationModal from "../components/ConfirmationModal";
import { Check } from "lucide-react";

// --- TypeScript Types ---
interface Nominee {
  id: string; // The unique ID from your JSON file
  name: string;
  image: string | null;
  description?: string;
}
interface Category {
  title: string;
  id: string; // The category ID (e.g., 'ug-most-beautiful')
  nominees: Nominee[];
}
type Selections = Record<string, string>; // Key: categoryId, Value: nomineeName

interface VotingPageProps {
  voter: VoterInfo;
}

const VotingPage: React.FC<VotingPageProps> = ({ voter }) => {
  const { matricNumber, fullName } = voter;
  const [, setLocation] = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selections, setSelections] = useState<Selections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "ULES Awards | Cast Your Vote";
  }, []);

  // --- CORRECTED DATA FETCHING (from local nominees.json only) ---
  useEffect(() => {
    const fetchAndPrepareCategories = async () => {
      setIsLoading(true);
      try {
        // Step 1: Fetch the single source of truth: your nominees.json file
        const response = await axios.get("/nominees.json");
        const jsonData = response.data;

        const allCategoriesFlat: Category[] = [];

        // Step 2: Add the main, top-level categories directly
        if (jsonData.categories && Array.isArray(jsonData.categories)) {
          allCategoriesFlat.push(...jsonData.categories);
        }

        // Step 3: Flatten the departmental subcategories
        if (jsonData.departments && Array.isArray(jsonData.departments)) {
          jsonData.departments.forEach((dept: any) => {
            const deptName = dept.title.replace("Departmental Awards - ", "");
            if (dept.subcategories && Array.isArray(dept.subcategories)) {
              const formattedSubcategories = dept.subcategories.map(
                (subCat: any) => ({
                  ...subCat,
                  title: `${deptName} - ${subCat.title}`, // Create user-friendly title
                })
              );
              allCategoriesFlat.push(...formattedSubcategories);
            }
          });
        }

        // Step 4: Set the final state, filtering out any categories with no nominees
        setCategories(
          allCategoriesFlat.filter(
            (cat) => cat.nominees && cat.nominees.length > 0
          )
        );
      } catch (err) {
        setError(
          "Could not load voting categories. Please check the nominees file and try refreshing."
        );
        console.error("Data fetching error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndPrepareCategories();
  }, []);

  // --- Event Handlers (No changes needed here) ---
  const handleSelectNominee = (categoryId: string, nomineeName: string) => {
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeName }));
  };

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/submit`;
      const choices = Object.entries(selections).map(
        ([categoryId, nomineeName]) => ({ categoryId, nomineeName })
      );
      await axios.post(apiUrl, { fullName, matricNumber, choices });

      setLocation("/success", { state: { selections, categories, fullName } });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred while submitting."
      );
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!matricNumber || !fullName) return <Redirect to="/" />;

  const allCategoriesVoted =
    categories.length > 0 &&
    Object.keys(selections).length === categories.length;

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-vote-bg text-xl animate-pulse text-slate-500">
        Loading Voting Portal...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-vote-bg p-4">
        <div className="p-6 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center">
          <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      </div>
    );

  if (categories.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-vote-bg text-xl text-slate-500 p-4 text-center">
        Voting is not yet open or no nominees are available.
      </div>
    );

  // --- RENDER LOGIC (Mobile-Optimized) ---
  return (
    <div className="w-full min-h-screen bg-vote-bg font-sans text-vote-text-dark">
      <ConfirmationModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onConfirm={handleSubmitVote}
        title="Confirm Your Vote"
        message="Please double-check your choices. This action is final and cannot be changed."
        confirmText="Yes, Submit Vote"
        isProcessing={isSubmitting}
      />

      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold text-vote-primary">
            YOU MAY NOW CAST YOUR VOTES!
          </h1>
          <p className="text-slate-500 mt-2">
            Welcome,{" "}
            <span className="font-semibold text-vote-text-dark">
              {fullName}
            </span>
            .
          </p>
        </header>

        <div className="space-y-12 sm:space-y-16">
          {categories.map((category) => (
            <section key={category.id}>
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-vote-text-dark">
                  {category.title}
                </h2>
                <p className="text-vote-text-light mt-1 text-sm sm:text-base">
                  You can only vote for one candidate
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {category.nominees.map((nominee) => {
                  const isSelected = selections[category.id] === nominee.name;
                  return (
                    <div
                      key={nominee.id} // Correct key for React loops
                      className={`
                        bg-gradient-to-br from-white to-slate-100/50 rounded-2xl shadow-lg p-4 sm:p-6 text-center
                        transition-all duration-300 transform hover:-translate-y-2 relative
                        ${isSelected ? "ring-2 ring-vote-gold" : ""}
                      `}
                    >
                      <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
                        <img
                          src={
                            nominee.image
                              ? `/nominees/${nominee.image}`
                              : `/placeholder.png`
                          } // Correct image path
                          alt={nominee.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-vote-text-dark truncate">
                        {nominee.name}
                      </h3>
                      <p className="text-vote-text-light text-sm h-5">
                        {nominee.description || ""}
                      </p>

                      <button
                        onClick={() =>
                          handleSelectNominee(category.id, nominee.name)
                        }
                        disabled={isSelected}
                        className={`
                          w-full mt-6 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
                          ${
                            isSelected
                              ? "bg-vote-primary text-white cursor-default"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }
                        `}
                      >
                        {isSelected ? (
                          <>
                            <Check size={16} /> Voted
                          </>
                        ) : (
                          "Vote"
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="text-center mt-16 sm:mt-20">
          <p className="text-vote-text-light text-sm mb-4">
            Double check your choices before submitting your votes.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!allCategoriesVoted || isSubmitting}
            className="bg-vote-primary hover:bg-vote-primary-hover disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-12 sm:px-16 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
          >
            SUBMIT VOTE
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VotingPage;
