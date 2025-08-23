import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
  isLoggingIn: boolean;
  error: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  isLoggingIn,
  error,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div
      className="h-screen w-full bg-black relative flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/ornate_frame_bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div className="w-full max-w-md mx-auto relative z-10">
        <form
          onSubmit={handleSubmit} // Corrected: Use local handleSubmit
          className="bg-slate-900/70 p-8 rounded-2xl shadow-2xl border border-slate-700/50"
        >
          <div className="text-center mb-8">
            <img
              src="/yin_yang_logo.png"
              alt="Event Logo"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm">ULES Dinner & Awards 2025</p>
          </div>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-600 disabled:to-slate-700 text-black font-bold py-3 rounded-xl shadow-lg disabled:text-slate-400"
          >
            {isLoggingIn ? "Verifying..." : "Access Dashboard"}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
