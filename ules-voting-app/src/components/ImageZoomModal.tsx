// --- NEW: Image Zoom Modal Component ---
import type { Nominee, Category } from '../pages/VotingPage';

const ImageZoomModal = ({
  nominee,
  category,
  onClose,
  onVote,
}: {
  nominee: Nominee;
  category: Category;
  onClose: () => void;
  onVote: (categoryId: string, nomineeName: string) => void;
}) => {
  const imageSrc = nominee.image
    ? nominee.image.startsWith("http")
      ? nominee.image
      : `/nominees/${nominee.image}`
    : `/placeholder.png`;

  // This function handles voting and then closes the modal
  const handleVoteAndClose = () => {
    onVote(category.id, nominee.name);
    onClose();
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    >
      {/* Modal Content - stopPropagation prevents closing when clicking inside the content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg w-full flex flex-col items-center gap-4 animate-scale-in"
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white"
        >
          &times;
        </button>
        
        {/* Full-size Image */}
        <div className="w-full max-h-[60vh] flex items-center justify-center">
          <img
            src={imageSrc}
            alt={nominee.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        <h3 className="text-xl font-bold text-white text-center">{nominee.name}</h3>
        
        {/* Vote Button */}
        <button
          onClick={handleVoteAndClose}
          className="w-full max-w-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-black font-bold py-3 rounded-lg"
        >
          Vote for {nominee.name}
        </button>
      </div>
    </div>
  );
};

export default ImageZoomModal;