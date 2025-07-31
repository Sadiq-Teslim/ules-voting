// src/App.tsx
import React, { useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import LandingPage from "./pages/LandingPage";
import VotingPage from "./pages/VotingPage";
import SuccessPage from "./pages/SuccessPage"; 
import AdminPage from "./pages/AdminPage";

// Define a type for our voter data
export interface VoterInfo {
  fullName: string;
  matricNumber: string;
}

function App() {
  const [voter, setVoter] = useState<VoterInfo | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <Switch>
        {/* The LandingPage now receives the 'setVoter' function to update the state */}
        <Route path="/">
          <LandingPage setVoter={setVoter} />
        </Route>

        {/* The VotingPage is now protected. It only renders if a voter is set. */}
        <Route path="/vote">
          {voter ? <VotingPage voter={voter} /> : <Redirect to="/" />}
        </Route>

        {/* The SuccessPage will show after a successful vote */}
        <Route path="/success" component={SuccessPage} />

        <Route path="/admin" component={AdminPage} />

        <Route>404: Page Not Found!</Route>
      </Switch>
    </div>
  );
}

export default App;
