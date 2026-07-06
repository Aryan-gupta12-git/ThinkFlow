import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WritingWorkspace } from './WritingWorkspace';
import { SpeechWorkspace } from './SpeechWorkspace';
import {
  CheckCircle2,
  Copy,
  AlertCircle
} from 'lucide-react';

const COMMUNICATION_QUOTES = [
  { text: "The best speakers are the best thinkers.", author: "Unknown" },
  { text: "Great communication starts with clear thinking.", author: "Unknown" },
  { text: "Practice creates confidence.", author: "Unknown" },
  { text: "Your words shape your opportunities.", author: "Unknown" },
  { text: "Every expert communicator was once a beginner.", author: "Unknown" }
];

export const SingleWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'writing' | 'speech'>('writing');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Global AI Feedback States
  const [activeFeedback, setActiveFeedback] = useState<any | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<'random-topic' | 'introduce-yourself' | 'speech-practice' | null>(null);

  // Navigation states to boot children directly into practice mode on retry
  const [writingInitialMode, setWritingInitialMode] = useState<'random' | 'intro'>('random');
  const [writingInitialSetupStep, setWritingInitialSetupStep] = useState<'idle' | 'profile' | 'active'>('idle');
  const [speechInitialSetupStep, setSpeechInitialSetupStep] = useState<'idle' | 'active'>('idle');

  // Quotes Rotation timer (every 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % COMMUNICATION_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const onWritingAnalysisComplete = (feedback: any, mode: 'random-topic' | 'introduce-yourself') => {
    setActiveFeedback(feedback);
    setFeedbackMode(mode);
  };

  const onSpeechAnalysisComplete = (feedback: any) => {
    setActiveFeedback(feedback);
    setFeedbackMode('speech-practice');
  };

  const handleAgain = () => {
    setActiveFeedback(null);
    if (feedbackMode === 'speech-practice') {
      setActiveTab('speech');
      setSpeechInitialSetupStep('active');
    } else if (feedbackMode === 'introduce-yourself') {
      setActiveTab('writing');
      setWritingInitialMode('intro');
      setWritingInitialSetupStep('active');
    } else {
      setActiveTab('writing');
      setWritingInitialMode('random');
      setWritingInitialSetupStep('active');
    }
  };

  const handleExit = () => {
    setActiveFeedback(null);
    setFeedbackMode(null);
    setWritingInitialSetupStep('idle');
    setSpeechInitialSetupStep('idle');
  };

  // Render Redesigned AI Evaluation Card Report
  const renderFeedbackResults = (feedbackData: any) => {
    if (feedbackData.isTooShort) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-8 text-center space-y-6 max-w-lg mx-auto font-sans"
        >
          <div className="flex justify-center text-amber-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="section-heading text-apple-text-primary">Response Too Short</h3>
            <p className="body-text text-apple-text-secondary leading-relaxed">
              {feedbackData.shortMessage || "Please write/speak a more detailed response to receive a comprehensive analysis."}
            </p>
          </div>
          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button
              onClick={handleAgain}
              className="premium-btn-primary flex-1 py-2.5"
            >
              Try Again
            </button>
            <button
              onClick={handleExit}
              className="premium-btn-secondary flex-1 py-2.5"
            >
              Exit
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto space-y-6 text-left"
      >
        {/* Header Summary */}
        <div className="premium-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          <div className="space-y-1 text-center sm:text-left">
            <span className="flex items-center justify-center sm:justify-start gap-1.5 ui-label text-accent font-sans">
              <CheckCircle2 size={14} />
              <span>AI Evaluation Complete</span>
            </span>
            <h3 className="section-heading text-apple-text-primary">
              Analysis Report
            </h3>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleAgain}
              className="premium-btn-primary py-2 px-4 text-sm flex-1 sm:flex-initial"
            >
              Practice Again
            </button>
            <button
              onClick={handleExit}
              className="premium-btn-secondary py-2 px-4 text-sm flex-1 sm:flex-initial"
            >
              Exit
            </button>
          </div>
        </div>

        {/* 1. Overall Summary */}
        {feedbackData.summary && (
          <div className="premium-card p-6 md:p-8 space-y-3 font-sans">
            <h4 className="ui-label border-b border-border-subtle pb-3 text-apple-text-secondary">
              Overall Summary
            </h4>
            <p className="body-text text-apple-text-primary leading-relaxed font-normal">
              {feedbackData.summary}
            </p>
          </div>
        )}

        {/* 2. Strengths */}
        {feedbackData.strengths && feedbackData.strengths.length > 0 && (
          <div className="premium-card p-6 md:p-8 space-y-3 font-sans">
            <h4 className="ui-label border-b border-border-subtle pb-3 text-apple-text-secondary">
              Strengths
            </h4>
            <ul className="space-y-2.5 pt-1">
              {feedbackData.strengths.map((str: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 items-start text-apple-text-primary">
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span className="body-text">{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Areas for Improvement */}
        {feedbackData.improvements && feedbackData.improvements.length > 0 && (
          <div className="premium-card p-6 md:p-8 space-y-3 font-sans">
            <h4 className="ui-label border-b border-border-subtle pb-3 text-apple-text-secondary">
              Areas for Improvement
            </h4>
            <ul className="space-y-2.5 pt-1">
              {feedbackData.improvements.map((imp: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 items-start text-apple-text-primary">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span className="body-text">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Grammar Corrections */}
        {feedbackData.grammarCorrections && feedbackData.grammarCorrections.length > 0 && (
          <div className="premium-card p-6 md:p-8 space-y-4 font-sans">
            <h4 className="ui-label border-b border-border-subtle pb-3 text-apple-text-secondary">
              Grammar Corrections
            </h4>
            <div className="space-y-3 pt-1">
              {feedbackData.grammarCorrections.map((corr: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-red-100 bg-red-50/20 text-left space-y-1.5"
                >
                  <div className="text-red-700 font-medium text-sm">
                    Incorrect: <span className="line-through font-normal text-apple-text-primary">{corr.original}</span>
                  </div>
                  <div className="text-emerald-700 font-medium text-sm">
                    Corrected: <span className="font-normal text-apple-text-primary">{corr.corrected}</span>
                  </div>
                  {corr.explanation && (
                    <div className="text-apple-text-secondary text-xs pt-1 border-t border-red-100/50 mt-1">
                      {corr.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Better Version */}
        {feedbackData.improvedVersion && (
          <div className="premium-card p-6 md:p-8 space-y-4 relative font-sans">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h4 className="ui-label text-apple-text-secondary">
                Polished Version
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(feedbackData.improvedVersion);
                  alert('Polished version copied to clipboard!');
                }}
                className="p-1.5 rounded-lg border border-border-subtle bg-white text-apple-text-secondary hover:text-apple-text-primary transition-colors cursor-pointer flex items-center gap-1 ui-label text-[11px] font-semibold uppercase tracking-wider"
              >
                <Copy size={11} />
                <span>Copy</span>
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-left">
              <p className="transcript-text leading-relaxed text-apple-text-primary italic whitespace-pre-wrap">
                "{feedbackData.improvedVersion}"
              </p>
            </div>
          </div>
        )}

        {/* 6. Final Suggestions */}
        {feedbackData.suggestions && feedbackData.suggestions.length > 0 && (
          <div className="premium-card p-6 md:p-8 space-y-3 font-sans">
            <h4 className="ui-label border-b border-border-subtle pb-3 text-apple-text-secondary">
              Final Suggestions
            </h4>
            <ul className="space-y-4 pt-1">
              {feedbackData.suggestions.map((s: string, idx: number) => (
                <li key={idx} className="flex gap-4 items-start">
                  <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-100/50 flex items-center justify-center text-accent shrink-0 ui-label text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 body-text">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col justify-start relative space-y-12">
      {/* Main Title & Subtitle - ALWAYS VISIBLE when not on report */}
      {!activeFeedback && (
        <div className="text-center space-y-4 max-w-2xl mx-auto select-none pt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'writing' ? (
              <motion.div
                key="writing-header"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-apple-text-primary tracking-tight leading-[1.2]">
                  Become a Better Communicator. <br className="hidden sm:inline" />
                  Three Minutes at a Time.
                </h1>
                <p className="text-apple-text-secondary text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-sans font-normal">
                  Practice structured thinking by writing continuously on random discussion topics or craft your personal elevator pitch introduction.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="speech-header"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-apple-text-primary tracking-tight leading-[1.2]">
                  Speak with Confidence. <br className="hidden sm:inline" />
                  Three Minutes at a Time.
                </h1>
                <p className="text-apple-text-secondary text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-sans font-normal">
                  Practice verbal fluency and reduce filler words by speaking continuously on random discussion topics.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Segmented controls navigation tabs - only shown when session is inactive */}
      {!isSessionActive && !activeFeedback && (
        <div className="flex justify-center select-none">
          <div className="inline-flex p-0.75 bg-zinc-100/80 rounded-xl border border-border-subtle relative">
            <button
              onClick={() => {
                setActiveTab('writing');
                setWritingInitialSetupStep('idle');
              }}
              className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-colors relative z-10 cursor-pointer ${
                activeTab === 'writing'
                  ? 'text-apple-text-primary'
                  : 'text-apple-text-secondary hover:text-apple-text-primary'
              }`}
            >
              {activeTab === 'writing' && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/5 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Writing Practice
            </button>
            <button
              onClick={() => {
                setActiveTab('speech');
                setSpeechInitialSetupStep('idle');
              }}
              className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-colors relative z-10 cursor-pointer ${
                activeTab === 'speech'
                  ? 'text-apple-text-primary'
                  : 'text-apple-text-secondary hover:text-apple-text-primary'
              }`}
            >
              {activeTab === 'speech' && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-black/5 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Speech Practice
            </button>
          </div>
        </div>
      )}

      {/* Workspace Display Area */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeFeedback ? (
            <motion.div
              key="report-workspace"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {renderFeedbackResults(activeFeedback)}
            </motion.div>
          ) : activeTab === 'writing' ? (
            <motion.div
              key="writing-workspace"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <WritingWorkspace 
                onSessionStateChange={setIsSessionActive}
                onAnalysisComplete={onWritingAnalysisComplete}
                initialPracticeMode={writingInitialMode}
                initialSetupStep={writingInitialSetupStep}
              />
            </motion.div>
          ) : (
            <motion.div
              key="speech-workspace"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <SpeechWorkspace 
                onSessionStateChange={setIsSessionActive}
                onAnalysisComplete={onSpeechAnalysisComplete}
                initialSetupStep={speechInitialSetupStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Motivation Quotes slider */}
      {!isSessionActive && !activeFeedback && (
        <div className="pt-8 select-none max-w-xl mx-auto w-full">
          <div className="border-t border-border-subtle pt-6 relative flex flex-col items-center justify-center min-h-[70px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4 }}
                className="text-center px-6 space-y-1.5"
              >
                <p className="text-xs sm:text-[13px] font-sans font-normal text-apple-text-secondary leading-relaxed italic">
                  “{COMMUNICATION_QUOTES[quoteIndex].text}”
                </p>
                <span className="text-[9px] text-accent font-semibold uppercase tracking-wider block">
                  — {COMMUNICATION_QUOTES[quoteIndex].author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleWorkspace;
