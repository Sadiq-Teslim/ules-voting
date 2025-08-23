import React from "react";
import { Settings, ShieldAlert } from "lucide-react";

interface SettingsTabProps {
  electionStatus: "open" | "closed";
  onToggleStatusClick: () => void;
  onResetElectionClick: () => void;
  onDeleteNominationsClick: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  electionStatus,
  onToggleStatusClick,
  onResetElectionClick,
  onDeleteNominationsClick,
}) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-amber-400">Election Settings</h2>
      <div className="mt-6 space-y-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="text-amber-400" /> Election Status
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Control whether students can access the voting page.
          </p>
          <p className="mt-4">
            Current Status:{" "}
            <span
              className={`font-bold px-2 py-1 rounded-full text-sm ${
                electionStatus === "open"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {electionStatus.toUpperCase()}
            </span>
          </p>
          <button
            onClick={onToggleStatusClick}
            className={`mt-4 font-semibold py-2 px-4 rounded-lg transition-colors ${
              electionStatus === "closed"
                ? "bg-green-600 hover:bg-green-500"
                : "bg-yellow-600 hover:bg-yellow-500"
            }`}
          >
            {electionStatus === "closed" ? "Open Election" : "Close Election"}
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-red-500/30">
          <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
            <ShieldAlert /> Danger Zone
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            These actions are permanent and cannot be undone.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onResetElectionClick}
              className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Reset Election Data
            </button>
            <button
              onClick={onDeleteNominationsClick}
              className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Delete All Pending Nominations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsTab;
