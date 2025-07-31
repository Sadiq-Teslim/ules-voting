const LandingPage = () => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          ULES Annual Awards
        </h1>
        <p className="mt-4 text-xl text-slate-300">Official Voting Portal</p>
      </header>

      <main>
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">
            Voting Instructions & Rules
          </h2>
          <ul className="text-left space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">1.</span>
              <span>
                Only registered students of the Faculty of Engineering (admitted
                between 2016-2024) are eligible to vote.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">2.</span>
              <span>
                You must provide your valid 9-digit matriculation number to
                access the voting portal.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold">3.</span>
              <span>
                Each student is entitled to **one vote** per category. All votes
                are final upon submission.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <button
            // We will add the onClick functionality in the next step
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 text-white font-bold text-lg py-4 px-12 rounded-lg shadow-lg shadow-cyan-500/20"
          >
            Proceed to Vote
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
