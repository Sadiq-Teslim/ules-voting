/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "wouter";
import type { VoterInfo } from "../App";
import { Check, Loader, ArrowLeft, ShieldCheck, Trophy } from "lucide-react";

// --- TypeScript Types (no change) ---
interface Nominee {
  id: string;
  name: string;
  image: string | null;
  description?: string;
}
interface Category {
  title: string;
  id: string;
  nominees: Nominee[];
}
type Selections = Record<string, string>;
interface GroupedCategories {
  undergraduate: Category[];
  general: Category[];
  finalist: Category[];
  departmental: Category[];
}
type MainCategoryKey = keyof GroupedCategories;

// --- Success Modal Component (Restyled) ---
const SuccessModal = ({
  isOpen,
  onGoToHome,
  onGoToNext,
  nextCategory,
  message,
}: {
  isOpen: boolean;
  onGoToHome: () => void;
  onGoToNext: (key: MainCategoryKey) => void;
  nextCategory: { key: MainCategoryKey; title: string } | null;
  message: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center border border-slate-700">
        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white">Vote Submitted!</h2>
        <p className="text-slate-300 mt-2 mb-8">{message}</p>
        <div className="space-y-3">
          {nextCategory && (
            <button
              onClick={() => onGoToNext(nextCategory.key)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
            >
              Go to {nextCategory.title}
            </button>
          )}
          <button
            onClick={onGoToHome}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const VotingPage: React.FC<{ voter: VoterInfo }> = ({ voter }) => {
  const { matricNumber, fullName, departmentId } = voter;

  const [view, setView] = useState<"hub" | "voting">("hub");
  const [currentMainCategory, setCurrentMainCategory] =
    useState<MainCategoryKey | null>(null);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategories>(
    { undergraduate: [], general: [], finalist: [], departmental: [] }
  );
  const [votedSubCategoryIds, setVotedSubCategoryIds] = useState<string[]>([]);
  const [selections, setSelections] = useState<Selections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [nextCategoryToVote, setNextCategoryToVote] = useState<{
    key: MainCategoryKey;
    title: string;
  } | null>(null);

  const mainCategories: {
    key: MainCategoryKey;
    title: string;
    description: string;
  }[] = [
    {
      key: "undergraduate",
      title: "Undergraduate Awards",
      description: "Recognizing outstanding undergraduate students.",
    },
    {
      key: "general",
      title: "General Awards",
      description: "Awards open to students across all years.",
    },
    {
      key: "finalist",
      title: "Finalist Awards",
      description: "Celebrating the achievements of the graduating class.",
    },
    {
      key: "departmental",
      title: "Departmental Awards",
      description: "Honoring excellence within your department.",
    },
  ];

  // --- Data fetching logic is unchanged and correct ---
  useEffect(() => {
    document.title = "ULES Awards | Cast Your Vote";
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [structureRes, statusRes] = await Promise.all([
          axios.get("/nominees.json"),
          axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/voter-status`, {
            matricNumber,
          }),
        ]);
        const jsonData = structureRes.data;
        const ug: Category[] = [],
          gen: Category[] = [],
          fin: Category[] = [];
        let deptCats: Category[] = [];
        const userDepartment = jsonData.departments.find(
          (dept: any) => dept.id === departmentId
        );
        if (userDepartment) {
          const deptName = userDepartment.title.replace(
            "Departmental Awards - ",
            ""
          );
          deptCats = userDepartment.subcategories.map((subCat: any) => ({
            ...subCat,
            title: `${deptName} - ${subCat.title}`,
          }));
        }
        jsonData.categories.forEach((cat: Category) => {
          if (cat.id.startsWith("ug-")) ug.push(cat);
          else if (cat.id.startsWith("gen-")) gen.push(cat);
          else if (cat.id.startsWith("fin-")) fin.push(cat);
        });
        setGroupedCategories({
          undergraduate: ug,
          general: gen,
          finalist: fin,
          departmental: deptCats,
        });
        setVotedSubCategoryIds(statusRes.data.votedSubCategoryIds);
      } catch (err) {
        setError("Could not load voting data. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [matricNumber, departmentId]);

  // --- All other logic functions are unchanged and correct ---
  const handleSelectCategory = (key: MainCategoryKey) => {
    setCurrentMainCategory(key);
    setView("voting");
  };
  const handleBackToHub = () => {
    setView("hub");
    setCurrentMainCategory(null);
    setSelections({});
  };
  const handleSelectNominee = (categoryId: string, nomineeName: string) => {
    setSelections((prev) => ({ ...prev, [categoryId]: nomineeName }));
  };
  const findNextCategoryToVote = (updatedVotedIds: string[]) => {
    return (
      mainCategories.find((mc) => {
        const t = groupedCategories[mc.key]?.length || 0;
        if (t === 0) return false;
        const v = groupedCategories[mc.key].filter((c) =>
          updatedVotedIds.includes(c.id)
        ).length;
        return v < t;
      }) || null
    );
  };
  const handleSubmitVote = async () => {
    if (!currentMainCategory || Object.keys(selections).length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const choices = Object.entries(selections).map(
        ([categoryId, nomineeName]) => ({ categoryId, nomineeName })
      );
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit`,
        { fullName, matricNumber, choices, mainCategory: currentMainCategory }
      );
      const updatedVotedList = res.data.votedSubCategoryIds;
      setVotedSubCategoryIds(updatedVotedList);
      const nextCat = findNextCategoryToVote(updatedVotedList);
      setNextCategoryToVote(nextCat);
      setModalMessage("Your selections for this category have been recorded.");
      setIsModalOpen(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred while submitting."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGoToNextCategory = (key: MainCategoryKey) => {
    setIsModalOpen(false);
    setView("voting");
    setCurrentMainCategory(key);
    setSelections({});
  };
  const closeModalAndGoHome = () => {
    setIsModalOpen(false);
    handleBackToHub();
  };

  if (!matricNumber || !fullName) return <Redirect to="/" />;
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-400">
        <Loader className="w-10 h-10 animate-spin mb-4" />
        <p className="text-xl">Loading Portal...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center shadow-md">
          <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    // UI CHANGE: Background now matches AdminPage
    <div className="w-full min-h-screen font-sans bg-slate-900 text-white">
      <SuccessModal
        isOpen={isModalOpen}
        onGoToHome={closeModalAndGoHome}
        onGoToNext={handleGoToNextCategory}
        nextCategory={nextCategoryToVote}
        message={modalMessage}
      />
      <div className="max-w-5xl mx-auto p-4 sm:p-8 w-full">
        {view === "hub" ? (
          <>
            {/* UI CHANGE: Header restyled */}
            <header className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Select a Category to Vote
              </h1>
              <p className="text-slate-400 mt-2">
                Welcome,{" "}
                <span className="font-semibold text-white">{fullName}</span>.
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {mainCategories.map(({ key, title, description }) => {
                const totalInCat = groupedCategories[key]?.length || 0;
                const votedInCat =
                  groupedCategories[key]?.filter((cat) =>
                    votedSubCategoryIds.includes(cat.id)
                  ).length || 0;
                const isComplete = totalInCat > 0 && votedInCat === totalInCat;
                return (
                  // UI CHANGE: Category cards restyled
                  <button
                    key={key}
                    onClick={() => handleSelectCategory(key)}
                    disabled={isComplete}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-left transition-all duration-300 transform hover:border-cyan-500 hover:-translate-y-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:border-slate-700 flex items-center gap-5 group"
                  >
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                        isComplete
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-slate-700 border border-slate-600"
                      }`}
                    >
                      <img
                        src="/nobgules-logo.png"
                        alt="ULES Icon"
                        className={`w-12 h-12 transition-transform duration-300 ${
                          isComplete ? "" : "group-hover:scale-110"
                        }`}
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-lg sm:text-xl font-bold text-white">
                        {title}
                      </h2>
                      <p className="text-slate-400 text-sm mt-1">
                        {description}
                      </p>
                      <div className="text-sm font-semibold text-slate-400 mt-2">
                        {isComplete ? (
                          <span className="text-green-400 flex items-center gap-1.5">
                            <ShieldCheck size={16} /> COMPLETED
                          </span>
                        ) : totalInCat > 0 ? (
                          <span>
                            Voted {votedInCat} of {totalInCat}
                          </span>
                        ) : (
                          <span>No awards available yet</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          currentMainCategory && (
            <>
              {/* UI CHANGE: Voting view header restyled */}
              <header className="mb-8">
                <button
                  onClick={handleBackToHub}
                  className="flex items-center gap-2 text-slate-300 font-semibold mb-4 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-700"
                >
                  <ArrowLeft size={18} /> Back to Categories
                </button>
                <div className="text-center bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {
                      mainCategories.find(
                        (mc) => mc.key === currentMainCategory
                      )?.title
                    }
                  </h1>
                  <p className="text-slate-400 mt-2">
                    You can vote for nominees in any award you haven't voted for
                    yet.
                  </p>
                </div>
              </header>
              <div className="space-y-12">
                {(groupedCategories[currentMainCategory] || [])
                  .filter(
                    (c) =>
                      c.nominees &&
                      Array.isArray(c.nominees) &&
                      c.nominees.length > 0
                  )
                  .map((category) => {
                    const isCategoryVoted = votedSubCategoryIds.includes(
                      category.id
                    );
                    return (
                      <section
                        key={category.id}
                        className={`transition-opacity ${
                          isCategoryVoted ? "opacity-50" : ""
                        }`}
                      >
                        <div className="text-center mb-6 relative">
                          <h2 className="text-2xl font-bold text-cyan-400">
                            {category.title}
                          </h2>
                          {isCategoryVoted && (
                            <p className="text-sm font-semibold text-green-400 mt-1">
                              You have already voted in this award
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                          {category.nominees.map((nominee) => {
                            const isSelected =
                              selections[category.id] === nominee.name;
                            return (
                              // UI CHANGE: Nominee cards restyled
                              <div
                                key={nominee.id}
                                onClick={
                                  isCategoryVoted
                                    ? undefined
                                    : () =>
                                        handleSelectNominee(
                                          category.id,
                                          nominee.name
                                        )
                                }
                                className={`bg-slate-800 border rounded-xl p-3 text-center transition-all duration-300 ${
                                  isCategoryVoted
                                    ? "cursor-not-allowed border-slate-700"
                                    : "cursor-pointer border-slate-700 hover:border-cyan-500 hover:-translate-y-1.5"
                                } ${
                                  isSelected
                                    ? "ring-4 ring-cyan-500 border-cyan-500"
                                    : ""
                                }`}
                              >
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-slate-700 shadow-sm mb-3">
                                  <img
                                    src={
                                      nominee.image
                                        ? `/nominees/${nominee.image}`
                                        : `/placeholder.png`
                                    }
                                    alt={nominee.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                                  {nominee.name}
                                </h3>
                                <p className="text-slate-400 text-xs h-4 mb-3">
                                  {nominee.description || ""}
                                </p>
                                <div
                                  className={`w-full mt-auto py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 border ${
                                    isSelected
                                      ? "bg-cyan-500 text-white border-cyan-500"
                                      : isCategoryVoted
                                      ? "bg-slate-700 text-slate-400 border-slate-600"
                                      : "bg-slate-700 text-slate-300 border-slate-600"
                                  }`}
                                >
                                  {isCategoryVoted ? (
                                    <>
                                      <Check size={14} /> Voted
                                    </>
                                  ) : isSelected ? (
                                    <>
                                      <Check size={14} /> Selected
                                    </>
                                  ) : (
                                    "Select"
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
              </div>
              <footer className="text-center mt-12">
                <button
                  onClick={handleSubmitVote}
                  disabled={
                    isSubmitting || Object.keys(selections).length === 0
                  }
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-green-600/30 w-full sm:w-auto"
                >
                  {isSubmitting ? "Submitting..." : `Submit Votes`}
                </button>
              </footer>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default VotingPage;
