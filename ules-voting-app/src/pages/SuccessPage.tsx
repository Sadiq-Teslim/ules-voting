// src/pages/SuccessPage.tsx
import React from 'react';
import { Link } from "wouter";

const SuccessPage = () => {
  return (
    <div className="text-center bg-slate-800/50 p-8 rounded-lg border border-slate-700">
      <h1 className="text-4xl font-bold text-green-400 mb-4">Vote Submitted!</h1>
      <p className="text-slate-300 text-lg">Thank you for participating in the ULES Annual Awards.</p>
      <Link href="/">
        <a className="inline-block mt-8 text-cyan-400 hover:text-cyan-300 transition-colors">
          ← Back to Homepage
        </a>
      </Link>
    </div>
  );
};

export default SuccessPage;