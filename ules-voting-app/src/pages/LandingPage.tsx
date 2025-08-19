/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "wouter";
import ValidationModal from "../components/ValidationModal";
import { Users, Award, ArrowRight, Crown, Star, XCircle } from "lucide-react";
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
    // THEME CHANGE: Background now uses the ornate frame image
    <div
      className="min-h-screen w-full bg-black relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/ornate_frame_bg.jpg')" }}
    >
      {/* A semi-transparent overlay to ensure text is readable over the background */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
        {/* THEME CHANGE: Header is now the official banner */}
        <header className="mb-12">
          <img
            src="/ules_dinner_banner.png"
            alt="Ules Dinner & Awards 2025"
            className="mx-auto w-full max-w-lg"
          />
          <p className="text-xl sm:text-2xl text-slate-300 font-light mt-4">
            Official Voting Portal
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          {/* THEME CHANGE: Restyled info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:border-white/40 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4 mx-auto border border-white/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Eligible Voters
              </h3>
              <p className="text-slate-400 text-sm">
                Engineering Students 2016-2024
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:border-white/40 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4 mx-auto border border-white/20">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Award Categories
              </h3>
              <p className="text-slate-400 text-sm">Recognizing Excellence</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:border-white/40 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4 mx-auto border border-white/20">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                One Vote, One Voice
              </h3>
              <p className="text-slate-400 text-sm">
                Per Award, Final Decision
              </p>
            </div>
          </div>

          {/* THEME CHANGE: Restyled Call to Action button */}
          <div className="pt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={electionStatus !== "open"}
              className="group w-full sm:w-auto bg-white hover:bg-gray-200 transition-all duration-300 text-black font-bold text-lg py-4 px-12 rounded-xl disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center space-x-3">
                {electionStatus === "closed" && <XCircle className="w-5 h-5" />}
                <span>
                  {electionStatus === "loading" && "Checking Status..."}
                  {electionStatus === "open" && "Proceed to Vote"}
                  {electionStatus === "closed" && "Voting is Currently Closed"}
                </span>
                {electionStatus === "open" && (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
            <p className="mt-4 text-slate-500 text-xs">
              {electionStatus === "open"
                ? "🔒 Your vote is secure and your choice is final."
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
