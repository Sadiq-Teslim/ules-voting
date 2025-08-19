/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Redirect } from "wouter";
import type { VoterInfo } from "../App";
import { Check, Loader, ArrowLeft, ShieldCheck } from "lucide-react";

// --- TypeScript Types ---
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

// --- Success Modal Component ---
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center">
        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Vote Submitted!</h2>
        <p className="text-slate-600 mt-2 mb-8">{message}</p>
        <div className="space-y-3">
          {nextCategory && (
            <button
              onClick={() => onGoToNext(nextCategory.key)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
            >
              Go to {nextCategory.title}
            </button>
          )}
          <button
            onClick={onGoToHome}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg w-full transition-colors"
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

        // CRITICAL FIX: The filter was too aggressive. We still want to show the category
        // button on the hub, even if the nominees array is empty. The `filterEmpty`
        // function will now only be applied *inside* the voting view.
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
        const totalInCat = groupedCategories[mc.key]?.length || 0;
        if (totalInCat === 0) return false;
        const votedInCat = groupedCategories[mc.key].filter((cat) =>
          updatedVotedIds.includes(cat.id)
        ).length;
        return votedInCat < totalInCat;
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
        {
          fullName,
          matricNumber,
          choices,
          mainCategory: currentMainCategory,
        }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-sky-50 text-slate-500">
        <Loader className="w-10 h-10 animate-spin mb-4" />
        <p className="text-xl">Loading Portal...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-sky-50 p-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center shadow-md">
          <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    // UI FIX: The background gradient is now the direct parent.
    <div className="w-full min-h-screen font-sans bg-gradient-to-br from-sky-100 to-indigo-200">
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
            <header className="text-center mb-10 bg-black/10 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/30">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-shadow-md">
                Select a Category to Vote
              </h1>
              <p className="text-indigo-100 mt-2">
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

                // CRITICAL FIX: Always show the button, but disable if there are no categories inside.
                const canVote = totalInCat > 0 && !isComplete;

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectCategory(key)}
                    disabled={!canVote}
                    className="bg-white/70 backdrop-blur-lg rounded-xl shadow-md p-5 text-left transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md flex items-center gap-5 group"
                  >
                    <div
                      className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                        isComplete ? "bg-green-100" : "bg-amber-100"
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
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                        {title}
                      </h2>
                      <p className="text-slate-600 text-sm mt-1">
                        {description}
                      </p>
                      <div className="text-sm font-semibold text-slate-600 mt-2">
                        {isComplete ? (
                          <span className="text-green-600 flex items-center gap-1.5">
                            <ShieldCheck size={16} /> COMPLETED
                          </span>
                        ) : totalInCat > 0 ? (
                          <span>
                            Voted {votedInCat} of {totalInCat}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            No awards available yet
                          </span>
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
              <header className="mb-8">
                <button
                  onClick={handleBackToHub}
                  className="flex items-center gap-2 text-white font-semibold mb-4 bg-black/20 hover:bg-black/40 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <ArrowLeft size={18} /> Back to Categories
                </button>
                <div className="text-center bg-black/10 backdrop-blur-lg rounded-xl shadow-md p-6 border border-white/30">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-shadow-md">
                    {
                      mainCategories.find(
                        (mc) => mc.key === currentMainCategory
                      )?.title
                    }
                  </h1>
                  <p className="text-indigo-100 mt-2">
                    You can vote for nominees in any award you haven't voted for
                    yet.
                  </p>
                </div>
              </header>
              <div className="space-y-12">
                {/* CRITICAL FIX: Apply the nominee filter HERE, not during the initial data load. */}
                {(groupedCategories[currentMainCategory] || [])
                  .filter((c) => c.nominees && c.nominees.length > 0)
                  .map((category) => {
                    const isCategoryVoted = votedSubCategoryIds.includes(
                      category.id
                    );
                    return (
                      <section
                        key={category.id}
                        className={`transition-opacity ${
                          isCategoryVoted ? "opacity-60" : ""
                        }`}
                      >
                        <div className="text-center mb-6 relative">
                          <h2 className="text-2xl font-bold text-slate-800 text-shadow-md">
                            {category.title}
                          </h2>
                          {isCategoryVoted && (
                            <p className="text-sm font-semibold text-green-700 mt-1">
                              You have already voted in this award
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                          {category.nominees.map((nominee) => {
                            const isSelected =
                              selections[category.id] === nominee.name;
                            return (
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
                                className={`bg-white rounded-xl shadow-md p-3 text-center transition-all duration-300 ${
                                  isCategoryVoted
                                    ? "cursor-not-allowed"
                                    : "cursor-pointer transform hover:-translate-y-1.5 hover:shadow-xl"
                                } ${
                                  isSelected
                                    ? "ring-4 ring-amber-400 shadow-lg"
                                    : "ring-1 ring-black/5"
                                }`}
                              >
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-sm mb-3">
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
                                <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                                  {nominee.name}
                                </h3>
                                <p className="text-slate-500 text-xs h-4 mb-3">
                                  {nominee.description || ""}
                                </p>
                                <div
                                  className={`w-full mt-auto py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 border ${
                                    isSelected
                                      ? "bg-amber-500 text-white border-amber-500"
                                      : isCategoryVoted
                                      ? "bg-slate-100 text-slate-400 border-slate-200"
                                      : "bg-transparent text-slate-600 border-slate-300"
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
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-green-600/30 w-full sm:w-auto"
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
