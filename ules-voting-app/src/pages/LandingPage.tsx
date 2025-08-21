/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import ValidationModal from "../components/ValidationModal";
import {
  Users,
  Award,
  ArrowRight,
  Crown,
  Star,
  XCircle,
  Lock,
} from "lucide-react";
import type { VoterInfo } from "../App";

// Define the props for this component
interface LandingPageProps {
  setVoter: (voter: VoterInfo) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setVoter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [electionStatus, setElectionStatus] = useState<
    "open" | "closed" | "loading"
  >("loading");

  useEffect(() => {
    document.title = "ULES Dinner & Awards 2025 | Home";
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/election-status`)
      .then((res) => {
        setElectionStatus(res.data.status);
      })
      .catch((err) => {
        console.error("Failed to fetch election status:", err);
        setElectionStatus("closed");
      });
  }, []);

  const handleValidationSuccess = (voterInfo: VoterInfo) => {
    setVoter(voterInfo);
    setLocation("/vote");
  };

  return (
    // THEME CHANGE: Background styling remains the same.
    <div
      className="h-screen w-full bg-black relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/ornate_frame_bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>

      {/* THEME CHANGE: Container maintains mobile-first layout but uses more generous padding and alignment on desktop. */}
      <div className="relative z-10 text-center w-full max-w-md mx-auto px-4 h-full flex flex-col justify-around py-6 md:max-w-5xl md:justify-center md:py-16">
        
        {/* THEME CHANGE: Header has a larger bottom margin on desktop. */}
        <header className="mb-6 md:mb-12">
          <img
            src="/ules_dinner_banner.png"
            alt="Ules Dinner & Awards 2025"
            className="mx-auto w-full max-w-[280px] sm:max-w-xs md:max-w-lg"
          />
          <p className="text-base sm:text-lg text-slate-300 font-light mt-2 md:mt-4">
            Official Voting Portal
          </p>
        </header>

        {/* THEME CHANGE: Main content has a larger vertical gap on desktop (space-y-12). */}
        <main className="space-y-6 md:space-y-12">
          {/* THEME CHANGE: Grid gap is wider on desktop (md:gap-8). */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
            
            {/* THEME CHANGE: Cards are less transparent, more padded, and have larger text on desktop. */}
            <div className="bg-black/75 border border-white/10 p-4 md:p-6 rounded-2xl transition-colors duration-300">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-3 md:mb-4 mx-auto border border-white/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                Eligible Voters
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                Engineering Students 2016-2024
              </p>
            </div>

            <div className="bg-black/75 border border-white/10 p-4 md:p-6 rounded-2xl transition-colors duration-300">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-3 md:mb-4 mx-auto border border-white/20">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                Award Categories
              </h3>
              <p className="text-xs md:text-sm text-slate-400">Recognizing Excellence</p>
            </div>
            
            <div className="bg-black/75 border border-white/10 p-4 md:p-6 rounded-2xl transition-colors duration-300">
              <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-lg mb-3 md:mb-4 mx-auto border border-white/20">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-1">
                One Vote, One Voice
              </h3>
              <p className="text-xs md:text-sm text-slate-400">
                Per Award, Final Decision
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={electionStatus !== "open"}
              className="group w-full sm:w-auto bg-white hover:bg-gray-200 transition-all duration-300 text-black font-bold text-base py-3 px-10 rounded-lg shadow-lg disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center space-x-2.5">
                {electionStatus === "closed" && <XCircle className="w-5 h-5" />}
                <span>
                  {electionStatus === "loading" && "Checking Status..."}
                  {electionStatus === "open" && "Proceed to Vote"}
                  {electionStatus === "closed" && "Voting is Closed"}
                </span>
                {electionStatus === "open" && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
             <p className="mt-3 text-xs text-slate-500">
              {electionStatus === "open"
                ? "Your vote is secure and your choice is final."
                : "Please check back later or contact the committee."}
            </p>
          </div>
        </main>
      </div>

      <ValidationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleValidationSuccess}
      />
    </div>
  );
};

export default LandingPage;