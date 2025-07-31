import React, { useState } from 'react';
import axios from 'axios';

// Define the props the component will accept
interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (matricNumber: string, fullName: string) => void;
}

const ValidationModal: React.FC<ValidationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // State for form inputs
  const [matricNumber, setMatricNumber] = useState('');
  const [fullName, setFullName] = useState('');
  // State for handling loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // --- API Call to Your Backend ---
      // NOTE: For production, you would use your live Render URL
      const response = await axios.post('https://ules-voting-backend.onrender.com/api/validate', {
        matricNumber: matricNumber,
      });

      if (response.data.valid) {
        // If validation is successful, call the onSuccess function passed from the parent
        onSuccess(matricNumber, fullName);
      }
    } catch (err: Error | unknown) {
      // If the API returns an error (e.g., 400, 403), set the error message
      if (err instanceof Error && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((err as any).response?.data?.message || 'An error occurred');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If the modal isn't open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-4">Voter Verification</h2>
        <p className="text-slate-400 mb-6">Please enter your details to proceed.</p>
        
        <form onSubmit={handleValidation}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="matricNumber" className="block text-sm font-medium text-slate-300 mb-1">
                Matriculation Number
              </label>
              <input
                type="text"
                id="matricNumber"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                required
                maxLength={9}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., 240404035"
              />
            </div>
          </div>

          {/* Display Error Message if it exists */}
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold py-3 rounded-lg"
            >
              {isLoading ? 'Validating...' : 'Proceed to Vote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;