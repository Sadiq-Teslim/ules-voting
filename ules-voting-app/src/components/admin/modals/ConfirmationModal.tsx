import React from 'react';
import type { ModalState } from '../../../types/admin';

// type ConfirmationModalProps = ModalState & {
//   onClose: () => void;
//   isProcessing: boolean;
// }

const ConfirmationModal: React.FC<
  ModalState & { onClose: () => void; isProcessing: boolean }
> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isProcessing,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-5 rounded-lg disabled:bg-red-800 disabled:cursor-wait transition-colors"
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;