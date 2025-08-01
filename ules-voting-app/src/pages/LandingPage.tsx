import React, { useState } from 'react';
import { useLocation } from "wouter";
import ValidationModal from '../components/ValidationModal';
import { Trophy, Users, Award, ArrowRight, Sparkles, Crown, Star } from 'lucide-react';
import type { VoterInfo } from '../App'; // Ensure this path is correct

// Define the props for this component
interface LandingPageProps {
  setVoter: (voter: VoterInfo) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setVoter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleValidationSuccess = (matricNumber: string, fullName: string) => {
    setVoter({ fullName, matricNumber });
    setLocation("/vote");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent animate-gradient">
              ULES Annual Awards
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-300 font-light">
            Official Voting Portal
          </p>

          <div className="mt-4 inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-full">
            <Award className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-300 text-sm font-medium">University of Lagos Engineering Society</span>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="space-y-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:border-cyan-500/50 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl mb-4 mx-auto"><Users className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-semibold text-white mb-1">Eligible Voters</h3>
              <p className="text-slate-400 text-sm">Engineering Students 2016-2024</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:border-purple-500/50 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 mx-auto"><Crown className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-semibold text-white mb-1">Award Categories</h3>
              <p className="text-slate-400 text-sm">Recognizing Excellence</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:border-yellow-500/50 transition-colors duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-4 mx-auto"><Star className="w-6 h-6 text-white" /></div>
              <h3 className="text-lg font-semibold text-white mb-1">One Vote, One Voice</h3>
              <p className="text-slate-400 text-sm">Per Category, Final Decision</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-8">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="group relative w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-purple-500 to-yellow-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 text-white font-bold text-lg py-4 px-12 rounded-xl"
            >
              <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>Proceed to Vote</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="mt-4 text-slate-500 text-xs">
              🔒 Your vote is secure and anonymous.
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