import React, { useState } from "react";
import { Users, Link as LinkIcon, Check } from "lucide-react";
import type { Nomination } from "../../../types/admin";

interface NominationsTabProps {
  pendingNominations: Nomination[];
  getCategoryTitle: (id: string) => string;
}

const NominationsTab: React.FC<NominationsTabProps> = ({
  pendingNominations,
  getCategoryTitle,
}) => {
  // State to track which URL has been copied to provide user feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedId(id);
        // Reset the "Copied!" message after 2 seconds
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy URL.");
      });
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-4">
        Review Nominations
      </h2>
      {pendingNominations.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-lg border border-slate-700">
          <Users className="mx-auto w-16 h-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
          <p className="text-slate-400 mt-2">
            There are no pending nominations to review at this time.
          </p>
        </div>
      ) : (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="space-y-4">
            {Object.entries(
              pendingNominations.reduce((acc, nom) => {
                (acc[nom.category] = acc[nom.category] || []).push(nom);
                return acc;
              }, {} as Record<string, Nomination[]>)
            ).map(([category, noms]) => (
              <div key={category}>
                <h3 className="font-bold text-xl text-amber-200 mb-2">
                  {getCategoryTitle(category)} ({noms.length})
                </h3>
                <ul className="space-y-2">
                  {noms.map((nom) => (
                    <li
                      key={nom._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-700 p-3 rounded"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={nom.imageUrl || "/placeholder.png"}
                          alt={nom.fullName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="font-semibold">
                          {nom.fullName}{" "}
                          {nom.popularName && `(${nom.popularName})`}
                        </span>
                      </div>

                      {/* --- NEW: Copy URL Button --- */}
                      {nom.imageUrl && (
                        <button
                          onClick={() => handleCopyUrl(nom.imageUrl!, nom._id)}
                          className={`flex items-center justify-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 w-full sm:w-auto ${
                            copiedId === nom._id
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-600 hover:bg-slate-500 text-slate-300"
                          }`}
                        >
                          {copiedId === nom._id ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <LinkIcon size={14} />
                              Copy Image URL
                            </>
                          )}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default NominationsTab;
