// src/components/ConfirmationModal.tsx
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-sm w-full border border-slate-700 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Are you sure?</h2>
        <p className="text-slate-400 mb-6">Your votes are final and cannot be changed after submission.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onCancel} disabled={isLoading} className="px-8 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-8 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors">
            {isLoading ? "Submitting..." : "Yes, Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;