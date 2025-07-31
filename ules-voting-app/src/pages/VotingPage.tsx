// src/pages/VotingPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'wouter';
import type { VoterInfo } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Types ---
interface Nominee { id: string; name: string; image: string | null; }
interface Category { title: string; id: string; nominees: Nominee[]; }
type Selections = Record<string, string>;

// --- Component Props ---
interface VotingPageProps {
  voter: VoterInfo;
}

const VotingPage: React.FC<VotingPageProps> = ({ voter }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selections, setSelections] = useState<Selections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    axios.get('/nominees.json')
      .then(response => {
        if (response.data && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        } else {
          throw new Error("Invalid nominees.json structure.");
        }
      })
      .catch(err => {
        console.error("Failed to fetch nominees:", err);
        setError("Could not load voting categories.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectNominee = (categoryId: string, nomineeName: string) => {
    setSelections(prev => ({ ...prev, [categoryId]: nomineeName }));
  };

  const handleSubmitVote = async () => {
    setIsSubmitting(true);
    setError(null);
    const choices = Object.entries(selections).map(([categoryId, nomineeName]) => ({ categoryId, nomineeName }));

    try {
      await axios.post('https://ules-voting-backend.onrender.com/api/submit', {
        fullName: voter.fullName,
        matricNumber: voter.matricNumber,
        choices: choices,
      });
      setLocation('/success');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "An unexpected error occurred. Your vote was not submitted.");
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };
  
  const isVoteComplete = categories.length > 0 && Object.keys(selections).length === categories.length;

  if (isLoading) return <div className="text-center text-xl">Loading...</div>;
  if (error && !isModalOpen) return <div className="text-center text-xl text-red-400">{error}</div>;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">ULES Awards Voting</h1>
          <p className="text-slate-400 mt-2">Welcome, {voter.fullName}. Select one nominee per category.</p>
        </header>

        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-slate-700 pb-2 mb-6">{category.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {category.nominees.map((nominee) => (
                  <div key={nominee.id} onClick={() => handleSelectNominee(category.id, nominee.name)} className={`p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${selections[category.id] === nominee.name ? 'bg-cyan-500 ring-2 ring-white' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'}`}>
                    {/* CORRECTED IMAGE PATH: It now correctly points to the public folder */}
                    <img src={nominee.image ? `/images/${nominee.image}` : `/images/placeholder.png`} alt={nominee.name} className="w-full h-32 object-cover rounded-md mb-4 bg-slate-700" />
                    <h3 className="font-semibold text-center text-white">{nominee.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center">
          {error && isModalOpen && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={() => setIsModalOpen(true)} disabled={!isVoteComplete} className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-lg text-lg">
            Complete Vote
          </button>
          {!isVoteComplete && <p className="text-sm text-slate-400 mt-2">Please make a selection in all categories to continue.</p>}
        </footer>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleSubmitVote}
        onCancel={() => setIsModalOpen(false)}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default VotingPage;