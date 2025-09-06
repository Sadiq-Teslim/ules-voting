// src/pages/verify-vote.tsx
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const VerifyVotePage = () => {
    useEffect(() => {
        // The backend handles the redirect, but this page is a good fallback.
        // You could also parse the token here and make a client-side API call if needed.
    }, []);
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
            <Loader2 className="w-16 h-16 text-amber-400 animate-spin mb-6" />
            <h1 className="text-3xl font-bold text-white">Verifying your vote...</h1>
            <p className="text-slate-400 mt-2">Please wait a moment.</p>
        </div>
    );
};

export default VerifyVotePage;