// --- NEW: Image Zoom Modal Component ---
import type { Nominee } from '../pages/new';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const ImageZoomModal = ({ nominee, onClose }: { nominee: Nominee | null; onClose: () => void; }) => {
  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (nominee) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nominee, onClose]);

  if (!nominee) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close modal on overlay click
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 text-white bg-slate-700 hover:bg-red-500 rounded-full p-1.5 transition-colors"
          aria-label="Close image view"
        >
          <X size={20} />
        </button>
        <img
          src={nominee.image!} // The modal only opens if image is not null
          alt={`Image of ${nominee.name}`}
          className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
        />
        <h3 className="text-center font-bold text-white text-xl mt-4">{nominee.name}</h3>
      </div>
    </div>
  );
};

export default ImageZoomModal;