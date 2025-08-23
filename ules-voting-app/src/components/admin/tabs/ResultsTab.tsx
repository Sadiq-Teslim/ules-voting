import React from "react";
import { Search, Trophy } from "lucide-react";
import ResultsAccordion from "../ResultsAccordion";
import type { CategoryResult } from "../../../types/admin";

interface ResultsTabProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  results: CategoryResult[];
  groupedAndFilteredResults: { [key: string]: CategoryResult[] };
  getCategoryTitle: (id: string) => string;
}

const ResultsTab: React.FC<ResultsTabProps> = ({
  searchTerm,
  onSearchChange,
  results,
  groupedAndFilteredResults,
  getCategoryTitle,
}) => {
  return (
    <section>
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for an award category..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 bg-slate-800/50 rounded-lg border border-slate-700">
          <Trophy className="mx-auto w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white">No Results Yet</h3>
          <p className="text-slate-400 mt-2">
            Live voting results will appear here once votes are cast.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <ResultsAccordion
          title="Undergraduate Awards"
          results={groupedAndFilteredResults.undergraduate}
          getCategoryTitle={getCategoryTitle}
        />
        <ResultsAccordion
          title="General Awards"
          results={groupedAndFilteredResults.general}
          getCategoryTitle={getCategoryTitle}
        />
        <ResultsAccordion
          title="Finalist Awards"
          results={groupedAndFilteredResults.finalist}
          getCategoryTitle={getCategoryTitle}
        />
        <ResultsAccordion
          title="Departmental Awards"
          results={groupedAndFilteredResults.departmental}
          getCategoryTitle={getCategoryTitle}
        />
        {results.length > 0 &&
          Object.values(groupedAndFilteredResults).every(
            (arr) => arr.length === 0
          ) && (
            <div className="text-center py-10 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400">
                No results found for "{searchTerm}".
              </p>
            </div>
          )}
      </div>
    </section>
  );
};

export default ResultsTab;
