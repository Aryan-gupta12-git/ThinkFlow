import React from 'react';
import { SingleWorkspace } from './features/practice/SingleWorkspace';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg-paper text-apple-text-primary antialiased selection:bg-blue-600/10 selection:text-apple-text-primary">
      {/* Thin, premium top header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 border-b border-border-subtle flex items-center justify-between px-8 select-none bg-bg-paper/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg text-apple-text-primary tracking-tight select-none">ThinkFlow</span>
        </div>
        <div className="text-[10px] text-apple-text-secondary uppercase font-semibold tracking-widest">
          3-Minute Practice
        </div>
      </header>

      {/* Main consolidated container with generous space and breathability */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-[900px] w-full mx-auto px-6 pt-28 pb-16">
        <SingleWorkspace />
      </main>

      {/* Understated, minimalist footer */}
      <footer className="border-t border-border-subtle py-6 text-[10px] text-apple-text-secondary select-none bg-bg-paper/20">
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© {new Date().getFullYear()} ThinkFlow. Designed with focus, simplicity, and flow.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>Light Theme Focus Mode Active</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
