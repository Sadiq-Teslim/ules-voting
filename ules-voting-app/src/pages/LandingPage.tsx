// src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { useLocation } from "wouter";
import ValidationModal from '../components/ValidationModal';
import type { VoterInfo } from '../App'; // Import the VoterInfo type

// Define the props for this component
interface LandingPageProps {
  setVoter: (voter: VoterInfo) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setVoter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleValidationSuccess = (matricNumber: string, fullName: string) => {
    // 1. Set the voter info in the main App state
    setVoter({ fullName, matricNumber });
    // 2. Navigate to the voting page
    setLocation("/vote");
  };

  // The rest of the component JSX remains the same...
  return (
    <div className="text-center max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">ULES Annual Awards</h1>
        <p className="mt-4 text-xl text-slate-300">Official Voting Portal</p>
      </header>
      <main>
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Voting Instructions & Rules</h2>
          <ul className="text-left space-y-3 text-slate-300">
            <li className="flex items-start gap-3"><span className="text-cyan-400 font-bold">1.</span><span>Only registered Engineering students (2016-2024) are eligible.</span></li>
            <li className="flex items-start gap-3"><span className="text-cyan-400 font-bold">2.</span><span>You must provide your valid matriculation number to vote.</span></li>
            <li className="flex items-start gap-3"><span className="text-cyan-400 font-bold">3.</span><span>Each student is entitled to **one vote** per category. Votes are final.</span></li>
          </ul>
        </div>
        <div className="mt-10">
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 transition-all text-white font-bold text-lg py-4 px-12 rounded-lg">
            Proceed to Vote
          </button>
        </div>
      </main>
      <ValidationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleValidationSuccess} />
    </div>
  );
};

export default LandingPage;