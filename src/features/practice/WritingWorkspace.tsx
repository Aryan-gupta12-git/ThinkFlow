import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  BookOpen,
  User,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { type Topic, getRandomTopic } from '../../data/topics';

interface Profile {
  name: string;
  college: string;
  degree: string;
  branch: string;
  skills: string;
  careerGoal: string;
}

interface WritingWorkspaceProps {
  onSessionStateChange?: (isActive: boolean) => void;
  onAnalysisComplete: (feedback: any, mode: 'random-topic' | 'introduce-yourself') => void;
  initialPracticeMode?: 'random' | 'intro';
  initialSetupStep?: 'idle' | 'profile' | 'active';
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({
  onSessionStateChange,
  onAnalysisComplete,
  initialPracticeMode = 'random',
  initialSetupStep = 'idle'
}) => {
  // Mode selection & Setup Form States
  const [practiceMode, setPracticeMode] = useState<'random' | 'intro'>(initialPracticeMode);
  const [setupStep, setSetupStep] = useState<'idle' | 'profile' | 'active'>(initialSetupStep);

  const [profile, setProfile] = useState<Profile>({
    name: '',
    college: '',
    degree: '',
    branch: '',
    skills: '',
    careerGoal: ''
  });

  const [topic, setTopic] = useState<Topic>(() => getRandomTopic());
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAnalyzingRef = useRef(false);
  const [randomTopicText, setRandomTopicText] = useState('');
  const [introduceYourselfText, setIntroduceYourselfText] = useState('');

  const activeText = practiceMode === 'intro' ? introduceYourselfText : randomTopicText;

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [inactivityTimer, setInactivityTimer] = useState(7.0);

  // Layout states
  const [isShaking, setIsShaking] = useState(false);
  const [isInactivityTriggered, setIsInactivityTriggered] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // AI Feedback states
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Inactivity tracking
  const [lastTypeTimestamp, setLastTypeTimestamp] = useState<number | null>(null);

  const textRef = useRef(activeText);
  const isStartedRef = useRef(isStarted);
  const inactivityTimerRef = useRef(inactivityTimer);
  const lastTypeTimestampRef = useRef(lastTypeTimestamp);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize refs
  useEffect(() => { textRef.current = activeText; }, [activeText]);
  useEffect(() => { isStartedRef.current = isStarted; }, [isStarted]);
  useEffect(() => { inactivityTimerRef.current = inactivityTimer; }, [inactivityTimer]);
  useEffect(() => { lastTypeTimestampRef.current = lastTypeTimestamp; }, [lastTypeTimestamp]);

  // Notify parent about session state
  useEffect(() => {
    onSessionStateChange?.(isSessionActive);
  }, [isSessionActive, onSessionStateChange]);

  // Start practice session automatically on mount if requested
  useEffect(() => {
    if (initialSetupStep === 'active') {
      startSession(initialPracticeMode, true);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Run once on mount

  // Fetch unique topic from backend with local fallback
  const fetchNewTopic = async (excludeId?: string, reason = 'Entering Random Topic') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setTopic({ id: '', text: '', category: 'Random' });
    setIsLoadingTopic(true);

    console.log(`[RandomTopic]\nCalling /api/topics\nReason: ${reason}\nTimestamp: ${new Date().toISOString()}\nFunction: fetchNewTopic`);
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exclude: excludeId ? [excludeId] : [] }),
        signal: controller.signal
      });
      const data = await response.json();
      if (data.success && data.topic) {
        setTopic({
          id: `backend-${Date.now()}`,
          text: data.topic,
          category: 'Random'
        });
      } else {
        setTopic(getRandomTopic(excludeId ? [excludeId] : []));
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('[WritingWorkspace] Topic fetch aborted');
        return;
      }
      console.error('Failed to fetch new topic from backend, falling back to local topics:', e);
      setTopic(getRandomTopic(excludeId ? [excludeId] : []));
    } finally {
      setIsLoadingTopic(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // 3-Minute countdown loop
  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSessionCompleted(true);
          setIsStarted(false);
          setTimeout(() => {
            handleFinishSession();
            setIsSessionCompleted(false);
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted]);

  // Inactivity countdown loop
  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const lastTyped = lastTypeTimestampRef.current || now;
      const secondsInactive = (now - lastTyped) / 1000;
      const remainingSeconds = Math.max(0, 7.0 - secondsInactive);

      setInactivityTimer(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        setIsStarted(false);
        setIsInactivityTriggered(true);
        setIsShaking(true);

        setTimeout(() => {
          handleResetDueToInactivity();
          setIsInactivityTriggered(false);
          setIsShaking(false);
        }, 1000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStarted]);

  // Start Session
  const startSession = (mode: 'random' | 'intro', shouldFetch = true) => {
    setPracticeMode(mode);
    setIsSessionActive(true);
    setIsStarted(false);
    if (mode === 'random' && shouldFetch) {
      fetchNewTopic(undefined, 'Entering Random Topic');
    }
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupStep('active');
    startSession('intro');
  };

  const handleProfileSkip = () => {
    setProfile({
      name: '',
      college: '',
      degree: '',
      branch: '',
      skills: '',
      careerGoal: ''
    });
    setSetupStep('active');
    startSession('intro');
  };

  const generateNewTopic = () => {
    if (practiceMode === 'intro') {
      setIntroduceYourselfText('');
      setIsStarted(false);
      setTimeLeft(180);
      setInactivityTimer(7.0);
    } else {
      setRandomTopicText('');
      setIsStarted(false);
      setTimeLeft(180);
      setInactivityTimer(7.0);
      fetchNewTopic(topic.id, 'Clicking Skip Topic');
    }
  };

  // Typing inputs handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (practiceMode === 'intro') {
      setIntroduceYourselfText(val);
    } else {
      setRandomTopicText(val);
    }

    const now = Date.now();
    setLastTypeTimestamp(now);

    // If they typed directly, activate the session immediately
    if (!isSessionActive) {
      setIsSessionActive(true);
      if (setupStep === 'idle') {
        setPracticeMode('random');
        setSetupStep('active');
      }
    }

    // Timer starts ONLY on the first typed character
    if (!isStarted && val.length > 0) {
      setIsStarted(true);
    }
  };

  // Perform quiet reset
  const handleResetDueToInactivity = () => {
    if (practiceMode === 'intro') {
      setIntroduceYourselfText('');
    } else {
      setRandomTopicText('');
    }
    setIsStarted(false);
    setIsSessionActive(true);
    setTimeLeft(180);
    setInactivityTimer(7.0);
    setLastTypeTimestamp(null);

    if (practiceMode === 'random') {
      fetchNewTopic(topic.id, '7-second silence reset');
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  // Save session details and request analysis
  const handleFinishSession = async () => {
    if (isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;

    const finalVal = textRef.current;
    setIsLoadingFeedback(true);
    setLoadingMessageIndex(0);

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev >= 3 ? 3 : prev + 1));
    }, 1000);

    const activeMode = practiceMode === 'intro' ? 'introduce-yourself' : 'random-topic';
    const activeTopicText = practiceMode === 'intro'
      ? "Introduce yourself as if you are attending your dream company's interview."
      : topic.text;

    console.log(`[WritingWorkspace] handleFinishSession called. Mode: ${activeMode}, Topic: ${activeTopicText}, contentLen: ${finalVal?.length}`);

    try {
      const reason = timeLeft <= 0 ? 'Timer expired' : 'User explicitly clicked Submit';
      console.log(`[WritingWorkspace]\nCalling /api/analyze\nReason: ${reason}\nTimestamp: ${new Date().toISOString()}\nFunction: handleFinishSession`);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: activeMode,
          topic: activeTopicText,
          content: finalVal
        })
      });
      const data = await response.json();

      clearInterval(messageInterval);
      console.log('[WritingWorkspace] Received API response:', data);

      if (data.success) {
        onAnalysisComplete(data, activeMode);
        setIsStarted(false);
        setIsSessionActive(false);
        setSetupStep('idle');
      } else {
        alert(data.message || 'Unable to analyze response. Please try again.');
      }
    } catch (e) {
      console.error('Failed to request AI analysis:', e);
      clearInterval(messageInterval);
      alert('Unable to connect to the analysis service. Please check your internet connection and try again.');
    } finally {
      setIsLoadingFeedback(false);
      isAnalyzingRef.current = false;
    }
  };

  // Reset back to initial lobby page
  const resetWorkspace = () => {
    if (practiceMode === 'intro') {
      setIntroduceYourselfText('');
    } else {
      setRandomTopicText('');
    }
    setIsStarted(false);
    setIsSessionActive(false);
    setSetupStep('idle');
    setPracticeMode('random');
    setTimeLeft(180);
    setInactivityTimer(7.0);
    setLastTypeTimestamp(null);
  };

  const isSlowing = isStarted && inactivityTimer < 5.5;
  const slowFraction = isSlowing ? (5.5 - inactivityTimer) / 5.5 : 0;
  const editorOpacity = 1.0 - (slowFraction * 0.4);

  const buildPersonalizedPrompt = () => {
    if (!profile.name) {
      return "Introduce yourself as if you are attending your dream company's interview.";
    }
    const introSentence = `Hello, my name is ${profile.name}${profile.degree ? `, a ${profile.degree}` : ''}${profile.branch ? ` ${profile.branch} student` : ''}${profile.college ? ` at ${profile.college}` : ''}.`;
    const skillsSentence = profile.skills ? ` My skills include ${profile.skills}.` : '';
    const goalSentence = profile.careerGoal ? ` My career goal is to be a ${profile.careerGoal}.` : '';
    return `${introSentence}${skillsSentence}${goalSentence}`;
  };

  const formatTimerString = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isIntroMode = practiceMode === 'intro';

  const loadingMessages = [
    "Analyzing writing style...",
    "Reviewing structure and syntax...",
    "Highlighting key arguments...",
    "Formulating suggestions..."
  ];

  return (
    <div className="w-full flex flex-col justify-start relative space-y-8">
      {/* Mode selectors & Setup lobby: shown when session is inactive */}
      {!isSessionActive && !isLoadingFeedback && setupStep === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full select-none"
        >
          <div
            onClick={() => {
              setSetupStep('active');
              startSession('random', true);
            }}
            className="premium-card p-6 cursor-pointer hover:border-accent hover:shadow-md transition-all duration-200 space-y-4 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50/50 flex items-center justify-center text-accent group-hover:bg-blue-50 transition-colors">
              <BookOpen size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="section-heading text-[17px] text-apple-text-primary transition-colors">
                Random Topic
              </h3>
              <p className="body-text text-sm text-apple-text-secondary leading-relaxed font-normal">
                Practice structured thinking by writing continuously on a randomized topic.
              </p>
            </div>
            <div className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Start Practice</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Card 2: Introduce Yourself */}
          <div
            onClick={() => {
              setPracticeMode('intro');
              setSetupStep('profile');
            }}
            className="premium-card p-6 cursor-pointer hover:border-accent hover:shadow-md transition-all duration-200 space-y-4 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50/50 flex items-center justify-center text-accent group-hover:bg-blue-50 transition-colors">
              <User size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="section-heading text-[17px] text-apple-text-primary transition-colors">
                Introduce Yourself
              </h3>
              <p className="body-text text-sm text-apple-text-secondary leading-relaxed font-normal">
                Craft your personal elevator pitch and practice delivery for interview settings.
              </p>
            </div>
            <div className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Setup Profile</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Optional Profile Setup Form Screen */}
      {!isSessionActive && !isLoadingFeedback && setupStep === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6 sm:p-8 max-w-lg mx-auto w-full select-none space-y-6 text-left"
        >
          <div className="space-y-1.5 pb-4 border-b border-border-subtle">
            <h3 className="section-heading text-lg text-apple-text-primary">👋 Build Your Introduction</h3>
            <p className="body-text text-sm text-apple-text-secondary leading-relaxed">
              Fill in your professional details to generate a customized prompt guidelines for your self-introduction.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="ui-label block mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Aryan Gupta"
                  className="premium-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ui-label block mb-1">College</label>
                <input
                  type="text"
                  value={profile.college}
                  onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
                  placeholder="IIT Delhi"
                  className="premium-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="ui-label block mb-1">Degree</label>
                <input
                  type="text"
                  value={profile.degree}
                  onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="B.Tech"
                  className="premium-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ui-label block mb-1">Branch</label>
                <input
                  type="text"
                  value={profile.branch}
                  onChange={(e) => setProfile(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="Computer Science"
                  className="premium-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ui-label block mb-1">Strongest Skills</label>
              <input
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="React, TypeScript, CSS, Node.js"
                className="premium-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ui-label block mb-1">Career Goal</label>
              <input
                type="text"
                value={profile.careerGoal}
                onChange={(e) => setProfile(prev => ({ ...prev, careerGoal: e.target.value }))}
                placeholder="Software Engineer at Apple"
                className="premium-input"
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-border-subtle mt-6">
              <button
                type="button"
                onClick={() => setSetupStep('idle')}
                className="premium-btn-secondary"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleProfileSkip}
                className="premium-btn-secondary ml-auto"
              >
                Skip Form
              </button>
              <button
                type="submit"
                className="premium-btn-primary"
              >
                Start Practice
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loading Feedback Screen */}
      {isLoadingFeedback && (
        <div className="premium-card p-12 max-w-md mx-auto w-full text-center space-y-8 select-none my-12 min-h-[300px] flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Minimalist spinner */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-zinc-100"
              style={{ borderTopColor: 'var(--color-accent)' }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
            />
            <Sparkles size={16} className="text-accent" />
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="section-heading text-[15px] text-apple-text-primary tracking-tight font-sans"
              >
                {loadingMessages[loadingMessageIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="ui-label text-apple-text-secondary uppercase tracking-widest font-semibold">
              Analyzing practice data
            </p>
          </div>
        </div>
      )}

      {/* Workspace & Timer Layout */}
      {isSessionActive && !isLoadingFeedback && setupStep !== 'profile' && (
        <div className="w-full max-w-[900px] mx-auto space-y-6">
          {/* Writing layout: split columns if in Intro mode */}
          <div className={`grid grid-cols-1 ${isIntroMode ? 'lg:grid-cols-12' : ''} gap-8 items-stretch`}>

            {/* Left/Center Editor pad */}
            <div className={isIntroMode ? 'lg:col-span-8' : 'w-full'}>
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`premium-card p-6 md:p-8 flex flex-col justify-start min-h-[420px] transition-all duration-300 relative ${isShaking ? 'shake-card border-red-300 shadow-[0_4px_24px_rgba(239,68,68,0.03)]' : ''
                  }`}
              >
                {/* Header title block */}
                <div className="border-b border-border-subtle pb-4 mb-5 select-none flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      <span className="ui-label block text-apple-text-secondary whitespace-nowrap">
                        {isIntroMode ? "Personal elevator pitch" : "Today's Topic"}
                      </span>

                      {/* Paste warning & slowing warning placed inline with animation */}
                      <AnimatePresence>
                        {showPasteWarning && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                          >
                            <span className="ui-label text-apple-text-secondary block">
                              <span className="text-red-500 font-semibold">Write it yourself</span>
                            </span>
                          </motion.div>
                        )}
                        {!showPasteWarning && isSlowing && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                          >
                            <span className="ui-label block animate-pulse text-red-500">
                              Keep writing... ({Math.ceil(inactivityTimer)}s)
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Timer right-aligned */}
                    <div className="shrink-0 font-sans flex items-center justify-end ml-auto sm:ml-0">
                      <AnimatePresence mode="wait">
                        {isSessionCompleted ? (
                          <motion.span
                            key="completed"
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            className="text-sm font-semibold text-accent font-sans"
                          >
                            ✓ Complete
                          </motion.span>
                        ) : isInactivityTriggered ? (
                          <motion.span
                            key="warning"
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            className="text-sm font-semibold text-red-500 block animate-pulse font-sans"
                          >
                            Resetting due to pause...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="timer"
                            initial={{ opacity: 0, y: -3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 3 }}
                            className="text-lg font-bold tracking-tight text-apple-text-primary font-mono tabular-numbers leading-none"
                          >
                            {formatTimerString(timeLeft)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-4 mt-1">
                    <div className="flex-1 min-w-0">
                      <AnimatePresence mode="wait">
                        <motion.h4
                          key={isLoadingTopic ? 'loading' : (topic?.id || 'empty')}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.2 }}
                          className="section-heading text-left pt-1"
                        >
                          {isLoadingTopic ? (
                            <span className="text-apple-text-secondary opacity-60 animate-pulse italic font-normal">
                              Generating a thoughtful topic...
                            </span>
                          ) : isIntroMode ? (
                            "Introduce yourself as if you are attending your dream company's interview."
                          ) : (
                            topic.text
                          )}
                        </motion.h4>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Optional personalized start helper box */}
                  {isIntroMode && profile.name && (
                    <div className="mt-3 p-3 rounded-lg border border-border-subtle bg-zinc-50/50 text-sm text-apple-text-secondary leading-relaxed flex items-start gap-2">
                      <Info size={14} className="text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-apple-text-primary block mb-0.5">Introduction Guide:</span>
                        "{buildPersonalizedPrompt()}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Editor area (Body Text size) */}
                <textarea
                  ref={textareaRef}
                  value={activeText}
                  onChange={handleTextChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    setShowPasteWarning(true);
                    setTimeout(() => setShowPasteWarning(false), 2500);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setShowPasteWarning(true);
                    setTimeout(() => setShowPasteWarning(false), 2500);
                  }}
                  className="w-full h-full flex-1 bg-transparent text-apple-text-primary body-text resize-none focus:outline-none placeholder-apple-text-secondary/50 min-h-[240px] whitespace-pre-wrap break-words overflow-y-auto"
                  placeholder={
                    isIntroMode
                      ? "Write your story: background, skills, projects, achievements, goals, and why they should hire you..."
                      : "Start typing your thoughts here to begin practice..."
                  }
                  style={{
                    opacity: editorOpacity,
                    lineHeight: '1.75'
                  }}
                  wrap="soft"
                />

                {/* Blinking Blue Caret Cursor */}
                {isStarted && activeText.length > 0 && activeText.endsWith(' ') && (
                  <span className="absolute bottom-20 right-8 blue-cursor" />
                )}

                {/* Inactivity countdown bar fuse */}
                <div className="mt-4 pt-4 border-t border-border-subtle select-none">
                  <div className="w-full h-[2px] bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      style={{ originX: 0 }}
                      animate={{ scaleX: inactivityTimer / 7.0 }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Footer buttons (Writing statistics removed completely) */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 text-sm text-apple-text-secondary select-none border-t border-border-subtle/50 pt-4">
                  <div /> {/* Pushes control buttons to the right */}

                  {isSessionActive && (
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-none border-border-subtle/30 ml-auto">
                      {practiceMode === 'random' && (
                        <button
                          onClick={generateNewTopic}
                          className="text-sm font-semibold text-apple-text-secondary hover:text-apple-text-primary transition-colors uppercase border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer flex items-center gap-1.5 font-sans"
                          title="Skip Topic"
                        >
                          <RotateCcw size={13} />
                          <span>Skip Topic</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Finish session early and view report?')) {
                            handleFinishSession();
                          }
                        }}
                        disabled={activeText.trim().length === 0}
                        className={`text-sm font-semibold text-accent hover:text-accent-hover transition-colors uppercase border border-border-subtle px-3 py-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer font-sans ${activeText.trim().length === 0 ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                      >
                        Finish Session
                      </button>
                    </div>
                  )}
                </div>

              </motion.div>
            </div>

            {/* Right Column: Tips (Only shown on desktop in Intro mode) */}
            {isIntroMode && (
              <div className="lg:col-span-4 select-none">
                <div className="premium-card p-6 space-y-5 bg-white h-full border-border-subtle flex flex-col justify-start">
                  <h4 className="ui-label border-b border-border-subtle pb-3">
                    💡 Tips for a Great Introduction
                  </h4>
                  <ul className="space-y-4 text-sm text-apple-text-secondary font-normal leading-relaxed">
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>Keep your message under 2-3 minutes.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>Start strong with your name and college.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>Highlight technical and creative skills.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>Mention key academic/personal projects.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>End with clear career ambitions.</span>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="text-accent font-semibold">•</span>
                      <span>Be concise, clear, and confident.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Back link */}
          {isSessionActive && (
            <div className="flex justify-start select-none pt-2">
              <button
                onClick={resetWorkspace}
                className="text-sm font-medium tracking-wide font-sans text-apple-text-secondary hover:text-apple-text-primary transition-colors cursor-pointer"
              >
                ← Exit Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WritingWorkspace;
