/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import axios from "axios";
import type { VoterInfo } from "../App"; // Corrected the path for typical project structures
import { X } from "lucide-react";

// Define the props the component will accept
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
  // State for form inputs
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  // State for handling loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/validate`;

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(apiUrl, {
        matricNumber: matricNumber,
      });

      if (response.data.valid) {
        onSuccess({
          matricNumber,
          fullName,
          departmentId: response.data.departmentId,
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

  // If the modal isn't open, render nothing
  if (!isOpen) {
    return null;
  }

  // THEME CHANGE: The entire component is restyled
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md w-full relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
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
          <h2 className="text-2xl font-bold text-white">Voter Verification</h2>
          <p className="text-slate-400 mt-1">
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
                className="w-full bg-black/30 border border-white/20 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label
                htmlFor="matricNumber"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Matriculation Number
              </label>
              <input
                type="text"
                id="matricNumber"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                required
                maxLength={9}
                className="w-full bg-black/30 border border-white/20 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="e.g., **04*****"
              />
            </div>
          </div>

          {/* Display Error Message if it exists */}
          {error && (
            <p className="text-red-400 text-center text-sm mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </p>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-black font-bold py-3 rounded-lg"
            >
              {isLoading ? "Validating..." : "Proceed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;
