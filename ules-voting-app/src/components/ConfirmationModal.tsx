// src/components/ConfirmationModal.tsx

import React from "react";
import { Loader2 } from "lucide-react";

// The props are now more descriptive for better reusability
interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void; // Changed from onCancel for consistency
  isLoading: boolean;
  title: string;
  message: string;
  confirmText: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  isLoading,
  title,
  message,
  confirmText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-8 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-8 py-2.5 rounded-lg bg-white hover:bg-gray-200 text-black font-bold transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLoading ? "Submitting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
