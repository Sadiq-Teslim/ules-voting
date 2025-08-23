import React from "react";
import { Users } from "lucide-react";
import type { Nomination } from "../../../types/admin";

interface NominationsTabProps {
  pendingNominations: Nomination[];
  getCategoryTitle: (id: string) => string;
}

const NominationsTab: React.FC<NominationsTabProps> = ({
  pendingNominations,
  getCategoryTitle,
}) => {
  return (
    <section>
      <h2 className="text-3xl font-bold text-amber-400 mb-4">
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
                      className="flex items-center gap-4 bg-slate-700 p-2 rounded"
                    >
                      <img
                        src={nom.imageUrl || "/placeholder.png"}
                        alt={nom.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="font-semibold">
                        {nom.fullName}{" "}
                        {nom.popularName && `(${nom.popularName})`}
                      </span>
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
