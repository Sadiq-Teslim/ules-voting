/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import axios from "axios";
import type { VoterInfo } from "../App";
import { X, Loader2 } from "lucide-react";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (voterInfo: VoterInfo) => void;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/validate`;

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(apiUrl, { email, department });
      if (response.data.valid) {
        onSuccess({
          email,
          fullName,
          department,
        });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // THEME CHANGE: Added backdrop-blur-md for a deeper frosted glass effect
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      {/* THEME CHANGE: Added a div for the animated gradient border */}
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-amber-400 via-gray-600 to-amber-500 max-w-md w-full">
        <div className="bg-slate-900 rounded-xl p-8 w-full relative shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>

          <div className="text-center mb-6">
            <img
              src="/yin_yang_logo.png"
              alt="Event Logo"
              className="w-12 h-12 mx-auto mb-4"
            />
            {/* THEME CHANGE: Gold gradient text for the title */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
              Voter Verification
            </h2>
            <p className="text-slate-400 mt-2">
              Please enter your details to proceed.
            </p>
          </div>

          <form onSubmit={handleValidation}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-slate-300 mb-1"
                >
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                >
                  <option value="" disabled>Select your department</option>
                  <option value="dept-chemical">Chemical Engineering</option>
                  <option value="dept-civil">Civil Engineering</option>
                  <option value="dept-electrical-electronics">Electrical/Electronics Engineering</option>
                  <option value="dept-mechanical">Mechanical Engineering</option>
                  <option value="dept-surveying-geoinformatics">Surveying & Geoinformatics</option>
                  <option value="dept-metallurgical-materials">Metallurgical & Materials Engineering</option>
                  <option value="dept-systems">Systems Engineering</option>
                  <option value="dept-computer">Computer Engineering</option>
                  <option value="dept-petroleum-gas">Petroleum & Gas Engineering</option>
                  <option value="dept-biomedical">Biomedical Engineering</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-center text-sm mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </p>
            )}

            <div className="mt-6">
              {/* THEME CHANGE: Gold button with hover effects */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : null}
                {isLoading ? "Validating..." : "Proceed"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
