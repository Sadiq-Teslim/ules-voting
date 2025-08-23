/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

const ResetElectionModal = ({
  isOpen,
  onClose,
  onConfirmReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<{ message: string }>;
}) => {
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setInputValue("");
        setSuccessMessage("");
        setIsProcessing(false);
      }, 300);
    }
  }, [isOpen]);

  const handleFinalConfirm = async () => {
    if (inputValue !== "RESET") return;
    setIsProcessing(true);
    try {
      const result = await onConfirmReset();
      setSuccessMessage(result.message);
      setStep(3);
      setTimeout(onClose, 3000);
    } catch (error: any) {
      alert(
        `An error occurred: ${error.response?.data?.message || error.message}`
      );
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-red-500/30 shadow-2xl text-center">
        {step === 1 && (
          <>
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">
              Are you absolutely sure?
            </h2>
            <p className="text-slate-300 my-4">
              This will permanently delete all votes and voter records. This
              action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg"
              >
                I Understand, Continue
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-white">Final Confirmation</h2>
            <p className="text-slate-300 my-4">
              To confirm, please type{" "}
              <strong className="text-red-400">RESET</strong> in the box below.
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white text-center tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="RESET"
            />
            <button
              onClick={handleFinalConfirm}
              disabled={inputValue !== "RESET" || isProcessing}
              className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Resetting..." : "Reset Election Data"}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Success</h2>
            <p className="text-slate-300 my-4">{successMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetElectionModal;