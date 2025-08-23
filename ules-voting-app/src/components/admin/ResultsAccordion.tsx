import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { ChevronDown } from "lucide-react";
import type { CategoryResult } from "../../types/admin"; // Corrected import path

const ResultsAccordion = ({
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
        <div className="p-4 sm:p-6 space-y-8 border-t border-slate-700">
          {results.map((result) => (
            <div key={result.category}>
              <h3 className="font-bold text-xl text-amber-200 mb-2">
                {getCategoryTitle(result.category)}
              </h3>
              <Bar
                data={{
                  labels: result.nominees.map((n) => n.name), // Removed unnecessary 'any' type
                  datasets: [
                    {
                      label: "Votes",
                      data: result.nominees.map((n) => n.votes), // Removed unnecessary 'any' type
                      backgroundColor: "rgba(252, 211, 77, 0.5)",
                      borderColor: "rgb(251, 191, 36)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={
                  {
                    /* ... options ... */
                  }
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsAccordion;
