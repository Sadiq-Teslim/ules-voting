// src/pages/vote-success.tsx
import { Link } from 'wouter';
import { CheckCircle } from 'lucide-react';

const VoteSuccessPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-black p-4 text-center">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
      <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-white mb-3">Vote Confirmed!</h1>
      <p className="text-slate-300 mb-8">Thank you. Your vote has been successfully recorded.</p>
      <Link href="/">
        <a className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-lg transition-colors">
          Return to Home
        </a>
      </Link>
    </div>
  </div>
);

export default VoteSuccessPage;