// src/App.tsx
import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import LandingPage from "./pages/LandingPage";
import VotingPage from "./pages/VotingPage";
import SuccessPage from "./pages/SuccessPage";
import AdminPage from "./pages/AdminPage";
import NominationPage from "./pages/NominationPage";

// Define a type for our voter data
export interface VoterInfo {
  fullName: string;
  matricNumber: string;
  departmentId: string;
}

function App() {
  const [voter, setVoter] = useState<VoterInfo | null>(() => {
    try {
      const raw = sessionStorage.getItem("voter");
      return raw ? (JSON.parse(raw) as VoterInfo) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (voter) {
      sessionStorage.setItem("voter", JSON.stringify(voter));
    } else {
      sessionStorage.removeItem("voter");
    }
  }, [voter]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <Switch>
        <Route path="/">
          <LandingPage setVoter={setVoter} />
        </Route>

        <Route path="/vote">
          {/* This is the key change: Pass the 'voter' object as a prop */}
          {voter ? <VotingPage voter={voter} /> : <Redirect to="/" />}
        </Route>

        <Route path="/nominate" component={NominationPage} />
        <Route path="/success" component={SuccessPage} />
        <Route path="/admin" component={AdminPage} />

        <Route>404: Page Not Found!</Route>
      </Switch>
    </div>
  );
}

export default App;
