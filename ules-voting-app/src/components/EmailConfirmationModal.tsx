// src/components/EmailConfirmationModal.tsx
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  isLoading: boolean;
  error: string | null;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-amber-400 via-gray-600 to-amber-500 max-w-md w-full">
        <div className="bg-slate-900 rounded-xl p-8 w-full relative shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors" disabled={isLoading}>
            <X size={24} />
          </button>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
              Confirm Your Vote
            </h2>
            <p className="text-slate-400 mt-2">
              Enter your email to receive a verification link. Your vote only counts after you click the link.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-center text-sm mt-4 p-3 bg-red-500/10 rounded-md">
                {error}
              </p>
            )}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-600 disabled:cursor-not-allowed transition-all text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Sending..." : "Send Verification Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;