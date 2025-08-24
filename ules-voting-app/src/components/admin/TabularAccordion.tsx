import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CategoryResult } from "../../types/admin";

const TabularAccordion = ({
  title,
  results,
  getCategoryTitle,
}: {
  title: string;
  results: CategoryResult[];
  getCategoryTitle: (id: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  if (results.length === 0) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <h2 className="text-2xl font-bold text-amber-400">
          {title} ({results.length})
        </h2>
        <ChevronDown
          className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6 border-t border-slate-700">
          {results.map((result) => (
            <div key={result.category}>
              <h3 className="font-bold text-xl text-amber-200 mb-2">
                {getCategoryTitle(result.category)}
              </h3>
              <ul className="space-y-1">
                {result.nominees
                  .sort((a, b) => b.votes - a.votes) // Sort by votes descending
                  .map((nominee, index) => (
                    <li
                      key={nominee.name}
                      className={`flex justify-between items-center p-2 rounded transition-colors ${
                        index === 0 ? "bg-amber-500/10" : "bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold w-6 text-center ${
                            index === 0 ? "text-amber-300" : "text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {nominee.name}
                        </span>
                      </div>
                      <span className="font-bold text-amber-300">
                        {nominee.votes.toLocaleString()} Vote(s)
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabularAccordion;
