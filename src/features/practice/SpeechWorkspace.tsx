import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Sparkles,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { type Topic } from '../../data/topics';

// Speech-specific topics
const SPEECH_TOPICS: Topic[] = [
  { id: 'speech-1', category: 'Artificial Intelligence', text: 'Is AI replacing creativity?' },
  { id: 'speech-2', category: 'Social Issues', text: 'Should social media have age restrictions?' },
  { id: 'speech-3', category: 'Business', text: 'Is remote work better than office work?' },
  { id: 'speech-4', category: 'Technology', text: 'Does technology make us less social?' },
  { id: 'speech-5', category: 'Leadership', text: 'Is empathy the single most critical quality for a modern leader?' },
  { id: 'speech-6', category: 'Education', text: 'Should classrooms focus more on vocational skills than theoretical knowledge?' }
];

// Helper to get a random speech topic
function getRandomSpeechTopic(excludeId?: string): Topic {
  const filtered = excludeId ? SPEECH_TOPICS.filter(t => t.id !== excludeId) : SPEECH_TOPICS;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

type RecordingState = 'idle' | 'recording' | 'silence-countdown' | 'resetting' | 'completed';

interface SpeechWorkspaceProps {
  onSessionStateChange?: (isActive: boolean) => void;
  onAnalysisComplete: (feedback: any) => void;
  initialSetupStep?: 'idle' | 'active';
}

export const SpeechWorkspace: React.FC<SpeechWorkspaceProps> = ({
  onSessionStateChange,
  onAnalysisComplete,
  initialSetupStep = 'idle'
}) => {
  const [setupStep, setSetupStep] = useState<'idle' | 'active'>(initialSetupStep);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  const [topic, setTopic] = useState<Topic>(() => getRandomSpeechTopic());
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  // Loading animation states
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Demo fallback mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoIntervalId, setDemoIntervalId] = useState<any>(null);
  const [isDemoPaused, setIsDemoPaused] = useState(false);
  const [silentDuration, setSilentDuration] = useState(0);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  // Refs for tracking silence and timestamps
  const lastSpeechTimeRef = useRef<number>(0);
  const transcriptRef = useRef(transcript);
  const isStartedRef = useRef(isStarted);
  const isRecordingRef = useRef(isRecording);
  const isDemoModeRef = useRef(isDemoMode);
  const isDemoPausedRef = useRef(isDemoPaused);
  const isUserIntendedStopRef = useRef(false);
  
  // Persistent transcript history across Web Speech session restarts
  const accumulatedTranscriptRef = useRef<string>('');

  // Active media stream track tracker for explicit resource release
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Web Speech API recognition instance
  const recognitionRef = useRef<any>(null);

  const isResettingRef = useRef(false);
  const isAnalyzingRef = useRef(false);

  // State Machine union
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');

  // Sync refs
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { isStartedRef.current = isStarted; }, [isStarted]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isDemoModeRef.current = isDemoMode; }, [isDemoMode]);
  useEffect(() => { isDemoPausedRef.current = isDemoPaused; }, [isDemoPaused]);

  // Derive recordingState from core flags to prevent conflicting configurations
  useEffect(() => {
    if (!isRecording) {
      if (isLoadingFeedback) {
        setRecordingState('completed');
      } else if (showResetNotice) {
        setRecordingState('resetting');
      } else {
        setRecordingState('idle');
      }
    } else {
      if (silentDuration > 1000) {
        setRecordingState('silence-countdown');
      } else {
        setRecordingState('recording');
      }
    }
  }, [isRecording, silentDuration, isLoadingFeedback, showResetNotice]);

  // Notify parent component about active session
  useEffect(() => {
    onSessionStateChange?.(isSessionActive);
  }, [isSessionActive, onSessionStateChange]);

  // Start practice session automatically on mount if requested
  useEffect(() => {
    if (initialSetupStep === 'active') {
      startSession(true);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Run once on mount

  // Fetch unique topic from backend with local fallback
  const fetchNewTopic = async (excludeId?: string, reason = 'Entering Speech Practice') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setTopic({ id: '', text: '', category: 'Random' });
    setIsLoadingTopic(true);

    console.log(`[SpeechPractice]\nCalling /api/topics\nReason: ${reason}\nTimestamp: ${new Date().toISOString()}\nFunction: fetchNewTopic`);
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
        setTopic(getRandomSpeechTopic(excludeId));
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('[SpeechWorkspace] Topic fetch aborted');
        return;
      }
      console.error('Failed to fetch new topic from backend, falling back to local:', e);
      setTopic(getRandomSpeechTopic(excludeId));
    } finally {
      setIsLoadingTopic(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // 3-Minute Session Timer
  useEffect(() => {
    if (!isStarted || isDemoPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isDemoPaused]);

  // Silence duration tracker to drive UI countdown and auto-reset
  useEffect(() => {
    if (!isRecording || !isStarted || isDemoPaused) {
      setSilentDuration(0);
      return;
    }

    const interval = setInterval(() => {
      const duration = Date.now() - lastSpeechTimeRef.current;
      setSilentDuration(duration);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, isStarted, isDemoPaused]);

  // Reset session when silence duration hits 8.0 seconds (1s pause + 7s countdown)
  useEffect(() => {
    if (isRecording && isStarted && !isDemoPaused && silentDuration >= 8000) {
      handleSilenceReset();
    }
  }, [silentDuration, isRecording, isStarted, isDemoPaused]);

  const isSilent = silentDuration > 1000;
  const silenceCountdown = isSilent 
    ? Math.max(0, Math.ceil((8000 - silentDuration) / 1000))
    : null;

  // Clean up speech recognition on unmount & check support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsDemoMode(true);
    }

    return () => {
      cleanupAllMicAndSpeech();
    };
  }, [demoIntervalId]);

  // Initialize Speech Recognition (Singleton creation pattern)
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Speech] Web Speech API is not supported in this browser. Enabling Demo Mode.');
      setIsDemoMode(true);
      return;
    }

    // Reuse the existing instance to prevent duplication, event listener stacking, and memory leaks
    if (recognitionRef.current) {
      return;
    }

    try {
      console.log('[Speech] Creating a new singleton SpeechRecognition instance');
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('[Speech] SpeechRecognition started successfully');
      };

      recognition.onresult = (event: any) => {
        let finalTranscriptStr = '';
        let interimTranscriptStr = '';

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptStr += result[0].transcript + ' ';
          } else {
            interimTranscriptStr += result[0].transcript;
          }
        }

        lastSpeechTimeRef.current = Date.now();
        
        // Merge history from previous restarted sessions with current session final text
        const currentFinal = finalTranscriptStr.trim();
        const combined = accumulatedTranscriptRef.current 
          ? `${accumulatedTranscriptRef.current} ${currentFinal}` 
          : currentFinal;

        setTranscript(combined.trim());
        setInterimTranscript(interimTranscriptStr.trim());

        if (!isStartedRef.current && (combined || interimTranscriptStr)) {
          isStartedRef.current = true;
          setIsStarted(true);
          lastSpeechTimeRef.current = Date.now();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[Speech] SpeechRecognition error:', event.error);
        const errorType = event.error;

        // Fall back to demo mode for any terminal error (excluding temporary silence timeouts or manual aborts)
        if (errorType !== 'no-speech' && errorType !== 'aborted') {
          console.warn(`[Speech] Terminal recognition error "${errorType}". Falling back to Demo Mode.`);
          setIsDemoMode(true);
          cleanupAllMicAndSpeech();
          startDemoSession();
        }
      };

      recognition.onend = () => {
        console.log('[Speech] SpeechRecognition ended. Current transcript:', transcriptRef.current);
        
        // Save transcript history to ref before attempting restart
        accumulatedTranscriptRef.current = transcriptRef.current;

        // Restart same instance if we are supposed to be active
        if (!isUserIntendedStopRef.current && isRecordingRef.current && !isDemoModeRef.current) {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            console.error('[Speech] Failed to restart existing recognition instance on end:', e);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('[Speech] Error initializing speech recognition:', e);
      setIsDemoMode(true);
    }
  };

  const startSpeechRecognition = async () => {
    // 1. Reset state indicators
    isUserIntendedStopRef.current = false;
    accumulatedTranscriptRef.current = '';

    // 2. Clear any lingering sessions/resources before starting
    cleanupAllMicAndSpeech();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsDemoMode(true);
      startDemoSession();
      return;
    }

    try {
      // 3. Request permissions explicitly (essential for Chrome sandbox/iframe permissions)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream; // Keep reference to release tracks on reset

      setIsDemoMode(false);
      initSpeechRecognition();

      if (recognitionRef.current) {
        // Sync flags immediately to avoid async race states
        isRecordingRef.current = true;
        isStartedRef.current = false;
        
        setIsRecording(true);
        setTranscript('');
        setInterimTranscript('');
        setTimeLeft(180);
        lastSpeechTimeRef.current = 0;
        setIsStarted(false);
        
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('[Speech] Failed to start SpeechRecognition:', e);
          setIsDemoMode(true);
          startDemoSession();
        }
      } else {
        console.warn('[Speech] SpeechRecognition is null. Falling back.');
        setIsDemoMode(true);
        startDemoSession();
      }
    } catch (e) {
      console.warn('[Speech] Microphone access denied or error occurred:', e);
      setIsDemoMode(true);
      startDemoSession();
    }
  };

  // Comprehensive cleanup function for resource release
  const cleanupAllMicAndSpeech = () => {
    isUserIntendedStopRef.current = true;
    isRecordingRef.current = false;
    isStartedRef.current = false;
    
    setIsRecording(false);
    setIsStarted(false);
    setSilentDuration(0);
    accumulatedTranscriptRef.current = '';

    // 1. Release active media stream tracks (removes browser's recording dot)
    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.error('[Speech] Error stopping media tracks:', e);
      }
      activeStreamRef.current = null;
    }

    // 2. Abort SpeechRecognition & clear event handlers
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.error('[Speech] Error aborting SpeechRecognition:', e);
      }
      recognitionRef.current = null;
    }

    // 3. Clear intervals
    if (demoIntervalId) {
      clearInterval(demoIntervalId);
      setDemoIntervalId(null);
    }
  };

  const startDemoSession = (customTopic?: Topic) => {
    const activeTopic = customTopic || topic;
    
    isRecordingRef.current = true;
    isStartedRef.current = true;
    
    setIsRecording(true);
    setIsStarted(true);
    setIsDemoMode(true);
    setTranscript('');
    setInterimTranscript('');
    setTimeLeft(180);
    setIsDemoPaused(false);
    lastSpeechTimeRef.current = Date.now();

    const topicTexts: Record<string, string[]> = {
      'speech-1': [
        "In my opinion, artificial intelligence is starting to impact creative industries.",
        "Umm, like, many artists are worried that algorithms can produce paintings or write articles faster than humans.",
        "Basically, we need to ask if machine output has genuine soul or if it's just repeating patterns.",
        "Umm, I believe human creativity is about emotional connection and lived experiences, which AI cannot replicate.",
        "So, we should view AI as a tool rather than a replacement."
      ],
      'speech-2': [
        "I strongly believe that social media platforms should have age restrictions.",
        "Umm, like, teenagers under 16 are highly vulnerable to social anxiety and algorithmic addictions.",
        "Basically, their brain is still developing and constant peer comparison causes massive mental health issues.",
        "Umm, so placing strict restrictions protects kids and forces them to have physical interactions.",
        "Like, tech companies should prioritize children over advertising revenue."
      ],
      'speech-3': [
        "From my perspective, remote work is definitely better than office work for most professionals.",
        "Umm, it eliminates useless commutes, giving people hours back in their daily lives.",
        "Basically, you can work in a comfortable environment and focus without constant cubicle distractions.",
        "Umm, like, it increases productivity and allows for a healthy work life balance.",
        "However, physical collaboration is also important, so hybrid might be the ultimate solution."
      ],
      'speech-4': [
        "Yes, I believe that technology does make us less social in real life.",
        "Umm, basically, we are constantly staring at screens instead of talking to the people right next to us.",
        "Like, look at any coffee shop or restaurant; everybody is scrolling on their phones.",
        "Umm, we substitute high-quality conversations with shallow likes and emojis on social media.",
        "So, we are hyper-connected digitally, but emotionally isolated in reality."
      ]
    };

    const lines = topicTexts[activeTopic.id] || [
      "Well, regarding this topic, I think it is an incredibly complex issue with no easy answers.",
      "Umm, like, on one hand, there are obvious economic and social benefits that we cannot ignore.",
      "Basically, we must evaluate both sides of the coin and weigh the long term consequences.",
      "Umm, another point to consider is the psychological effect this has on our daily routines.",
      "So, we should tread carefully and design policies that protect individuals."
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (isDemoPausedRef.current) return;

      if (currentStep < lines.length) {
        const sentence = lines[currentStep];
        setTranscript((prev) => prev ? `${prev} ${sentence}` : sentence);
        lastSpeechTimeRef.current = Date.now();
        currentStep++;

        if (currentStep === 3) {
          setIsDemoPaused(true);
          setTimeout(() => {
            if (isRecordingRef.current && isStartedRef.current) {
              handleSilenceReset();
              clearInterval(interval);
            }
          }, 7050);
        }
      } else {
        lastSpeechTimeRef.current = Date.now();
      }
    }, 4500);

    setDemoIntervalId(interval);
  };

  const handleEndSession = () => {
    cleanupAllMicAndSpeech();
    setIsSessionActive(false);
    setSetupStep('idle');
    setTranscript('');
    setInterimTranscript('');
    setTimeLeft(180);
    lastSpeechTimeRef.current = 0;
  };

  const handleSilenceReset = () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;

    setIsShaking(true);
    setShowResetNotice(true);

    // Call the comprehensive cleanup to release microphone resources, stop tracks, and abort SpeechRecognition
    cleanupAllMicAndSpeech();

    // Reset transcription texts and countdown timer back to 03:00
    setTranscript('');
    setInterimTranscript('');
    setTimeLeft(180);

    // Fetch a brand-new random topic
    fetchNewTopic(topic.id, '7-second silence reset');

    setTimeout(() => {
      setShowResetNotice(false);
      isResettingRef.current = false;
    }, 4000);

    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  };

  const startSession = (shouldFetch = true) => {
    setIsSessionActive(true);
    setTranscript('');
    setInterimTranscript('');
    setTimeLeft(180);
    setSetupStep('active');
    accumulatedTranscriptRef.current = '';
    if (shouldFetch) {
      fetchNewTopic(undefined, 'Entering Speech Practice');
    }
  };

  const handleFinishSession = async () => {
    if (isAnalyzingRef.current) return;
    isAnalyzingRef.current = true;

    cleanupAllMicAndSpeech();

    const textToAnalyze = transcriptRef.current;
    setIsLoadingFeedback(true);
    setLoadingMessageIndex(0);

    console.log(`[SpeechWorkspace] handleFinishSession called. Mode: speech-practice, Topic: ${topic.text}, contentLen: ${textToAnalyze?.length}`);

    // Keep loading messages animating
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev >= 3 ? 3 : prev + 1));
    }, 1000);

    try {
      const reason = timeLeft <= 0 ? 'Timer expired' : 'User explicitly clicked Submit';
      console.log(`[SpeechPractice]\nCalling /api/analyze\nReason: ${reason}\nTimestamp: ${new Date().toISOString()}\nFunction: handleFinishSession`);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'speech-practice',
          topic: topic.text,
          content: textToAnalyze
        })
      });
      const data = await response.json();
      
      clearInterval(messageInterval);
      console.log('[SpeechWorkspace] Received API response:', data);

      if (data.success) {
        onAnalysisComplete(data);
        setIsSessionActive(false);
        setSetupStep('idle');
      } else {
        alert(data.message || 'Unable to analyze speech response. Please try again.');
      }
    } catch (e) {
      console.error('Failed to request AI analyze endpoint:', e);
      clearInterval(messageInterval);
      alert('Unable to connect to the analysis service. Please check your internet connection and try again.');
    } finally {
      setIsLoadingFeedback(false);
      isAnalyzingRef.current = false;
    }
  };

  // Highlighting filler words (kept visually inside live transcript for nice user typing feedback)
  const renderHighlightedTranscript = (text: string) => {
    if (!text) return null;
    const fillers = ['um', 'umm', 'like', 'basically', 'uh', 'uhh', 'actually', 'literally', 'you know'];
    const regex = new RegExp(`\\b(${fillers.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span className="transcript-text whitespace-pre-wrap break-words">
        {parts.map((part, index) => {
          const isFiller = fillers.includes(part.toLowerCase());
          if (isFiller) {
            return (
              <motion.span
                key={index}
                initial={{ backgroundColor: 'rgba(245, 158, 11, 0)' }}
                animate={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                className="px-1 py-0.5 rounded border border-amber-200/40 text-amber-800 font-medium inline-block select-none"
                title="Filler Word Detected"
              >
                {part}
              </motion.span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  const formatTimerString = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const loadingMessages = [
    "Analyzing speech patterns...",
    "Reviewing verbal confidence...",
    "Highlighting filler expressions...",
    "Synthesizing recommendations..."
  ];

  return (
    <div className="w-full flex flex-col justify-start relative space-y-6">
      
      {/* 7-Second Reset Alert Notice */}
      <AnimatePresence>
        {showResetNotice && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none max-w-sm w-full px-4"
          >
            <div className="bg-amber-50/95 border border-amber-200/50 text-amber-800 text-sm py-3 px-4 rounded-xl shadow-lg flex items-center gap-2.5 backdrop-blur-md">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span className="small-metadata font-medium">Session restarted. Keep speaking continuously.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lobby: Show when not active and no feedback is shown */}
      {!isSessionActive && !isLoadingFeedback && setupStep === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full select-none"
        >
          <div
            onClick={() => startSession(true)}
            className="premium-card p-6 cursor-pointer hover:border-accent hover:shadow-md transition-all duration-200 space-y-4 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50/50 flex items-center justify-center text-accent group-hover:bg-blue-50 transition-colors">
              <Mic size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="section-heading text-[17px] text-apple-text-primary">
                Speech Practice
              </h3>
              <p className="body-text text-sm text-apple-text-secondary leading-relaxed font-normal">
                Train your verbal fluency and reduce filler words by speaking continuously for three minutes.
              </p>
            </div>
            <div className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Start Speaking</span>
              <ArrowRight size={12} />
            </div>
          </div>
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
              Analyzing vocal data
            </p>
          </div>
        </div>
      )}

      {/* Active Session: Topic Card, Status Bar & Speech Card */}
      {isSessionActive && !isLoadingFeedback && setupStep === 'active' && (
        <div className="w-full max-w-[700px] mx-auto space-y-5">
          
          {/* Topic Card */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`premium-card p-6 transition-all duration-300 relative ${
              isShaking ? 'shake-card border-red-300 shadow-[0_4px_24px_rgba(239,68,68,0.03)]' : ''
            }`}
          >
            <div className="flex justify-between items-center select-none mb-3">
              <span className="ui-label block text-apple-text-secondary">
                Today's Speech Topic
              </span>
              <span className="text-lg font-bold tracking-tight text-apple-text-primary font-mono tabular-numbers leading-none">
                {formatTimerString(timeLeft)}
              </span>
            </div>
            <div className="border-t border-border-subtle my-2" />
            <div className="flex justify-between items-start gap-4">
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
                        Finding a discussion topic...
                      </span>
                    ) : (
                      topic.text
                    )}
                  </motion.h4>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Compact Horizontal Status Bar (Words Per Minute removed completely) */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50/50 rounded-xl border border-border-subtle/50 ui-label select-none">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-accent' : 'bg-zinc-300'} ${isRecording && recordingState !== 'silence-countdown' ? 'animate-pulse' : ''}`} />
              <span className="small-metadata font-semibold uppercase">
                {recordingState === 'idle' ? (
                  "Ready to Practice"
                ) : recordingState === 'silence-countdown' ? (
                  <span className="text-apple-text-secondary font-medium">
                    Silence detected — Restarting in <span className="text-red-500 font-bold">{silenceCountdown}</span>
                  </span>
                ) : recordingState === 'recording' ? (
                  <span className="text-accent font-semibold animate-pulse">
                    Listening
                  </span>
                ) : (
                  "Waiting"
                )}
              </span>
            </div>
          </div>

          {/* Speech Practice Card */}
          <motion.div
            key="speech-workspace-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6 md:p-8 flex flex-col justify-start min-h-[380px] transition-all duration-300 relative focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.015)]"
          >
            {/* Top Section: Microphone & Waveform (Centered and Compact) */}
            <div className="flex flex-col items-center justify-center py-4 mb-4 relative select-none">
              
              {/* Mic button and concentric ripples */}
              <div className="relative flex items-center justify-center mb-4">
                {isRecording && !isDemoPaused && (
                  <motion.div
                    className="absolute w-16 h-16 rounded-full border border-accent/25 -z-10"
                    animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  />
                )}

                <motion.button
                  onClick={isRecording ? () => setShowPauseConfirm(true) : startSpeechRecognition}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer border select-none transition-all duration-350 ${
                    isRecording 
                      ? 'bg-zinc-50 border-accent/30 shadow-md animate-pulse' 
                      : 'bg-white border-border-subtle shadow-sm hover:shadow-md'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isRecording ? (
                      <motion.div
                        key="stop-indicator"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="w-3.5 h-3.5 bg-red-500 rounded-sm"
                      />
                    ) : (
                      <motion.div
                        key="mic-indicator"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Mic size={18} className="text-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Minimal Waveform Visualizer */}
              <div className="h-4 flex items-center justify-center w-full max-w-[180px] select-none">
                <AnimatePresence mode="wait">
                  {isRecording && !isDemoPaused ? (
                    <motion.div
                      key="active-wave"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-[2.5px]"
                    >
                      {[...Array(13)].map((_, i) => {
                        const delay = i * 0.04;
                        const heightPattern = recordingState === 'silence-countdown' ? [3, 3, 3] : [3, 14, 3];
                        return (
                          <motion.div
                            key={i}
                            className="w-[1.5px] bg-accent/60 rounded-full"
                            animate={{ height: heightPattern }}
                            transition={{
                                repeat: Infinity,
                                duration: recordingState === 'silence-countdown' ? 1 : 0.35 + (i % 3) * 0.08,
                                ease: "easeInOut",
                                delay: recordingState === 'silence-countdown' ? 0 : delay
                            }}
                            style={{ height: 3 }}
                          />
                        );
                      })}
                    </motion.div>
                  ) : (
                    <div className="w-[60px] h-[1.5px] bg-zinc-200 rounded-full" />
                  )}
                </AnimatePresence>
              </div>

              {/* Demo Mode Actions */}
              {isRecording && isDemoMode && (
                <div className="mt-4 flex items-center justify-center">
                  <button
                    onClick={() => {
                      const newPaused = !isDemoPaused;
                      setIsDemoPaused(newPaused);
                      if (!newPaused) {
                        lastSpeechTimeRef.current = Date.now();
                      }
                    }}
                    className="py-1.5 px-3 rounded-lg border border-border-subtle bg-white text-apple-text-secondary hover:text-apple-text-primary text-xs font-semibold uppercase tracking-wider cursor-pointer leading-none transition-colors"
                  >
                    {isDemoPaused ? '▶ Resume Demo' : '⏸ Pause Demo'}
                  </button>
                </div>
              )}
            </div>

            {/* Separator line */}
            <div className="border-t border-border-subtle my-1" />

            {/* Body: Borderless Transcript text area */}
            <div className="flex-1 py-4 text-left overflow-y-auto select-text min-h-[160px] focus:outline-none font-sans">
              {!transcript && !interimTranscript ? (
                <p className="body-text italic select-none opacity-50">
                  Begin speaking to transcribe. Continuous verbal thoughts will construct the paragraphs here...
                </p>
              ) : (
                <div className="prose prose-sm max-w-none text-left leading-relaxed">
                  {renderHighlightedTranscript(transcript)}
                  {interimTranscript && (
                    <span className="text-apple-text-secondary opacity-60 italic font-normal leading-relaxed ml-1.5 text-lg">
                      {interimTranscript}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer controls: Back and Submit */}
            <div className="border-t border-border-subtle pt-4 flex items-center justify-between select-none">
              <button
                onClick={handleEndSession}
                className="text-sm font-medium tracking-wide font-sans text-apple-text-secondary hover:text-apple-text-primary transition-colors cursor-pointer"
              >
                ← Exit Session
              </button>

              <button
                onClick={() => {
                  if (confirm('Finish recording early and analyze speech?')) {
                    handleFinishSession();
                  }
                }}
                disabled={!transcript && !interimTranscript}
                className={`py-1.5 px-4 rounded-lg text-sm font-semibold tracking-wide font-sans transition-colors border ${
                  (!transcript && !interimTranscript)
                    ? 'opacity-40 cursor-not-allowed text-apple-text-secondary border-border-subtle bg-zinc-50'
                    : 'bg-white text-accent hover:bg-zinc-50 border-accent/20 cursor-pointer shadow-sm'
                }`}
              >
                Analyze Speech
              </button>
            </div>
          </motion.div>
          
        </div>
      )}

      {/* Pause Confirmation Dialog Overlay */}
      <AnimatePresence>
        {showPauseConfirm && (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-border-subtle p-6 max-w-sm w-full space-y-4 shadow-xl text-center font-sans"
            >
              <div className="flex justify-center text-amber-500">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="section-heading text-apple-text-primary">
                  End speech recording?
                </h3>
                <p className="body-text text-sm leading-relaxed font-normal">
                  Continuous delivery is central to this exercise. Pausing might defeat the pacing practice challenge.
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowPauseConfirm(false);
                    if (isRecording && !isDemoMode && recognitionRef.current) {
                      try {
                        recognitionRef.current.start();
                      } catch (e) {
                        // Already active
                      }
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-xs tracking-wide cursor-pointer hover:bg-accent-hover transition-colors"
                >
                  Continue Practice
                </button>
                <button
                  onClick={() => {
                    setShowPauseConfirm(false);
                    handleEndSession();
                  }}
                  className="w-full py-2.5 rounded-lg border border-border-subtle bg-white text-apple-text-secondary hover:text-apple-text-primary text-xs font-semibold tracking-wide cursor-pointer hover:bg-zinc-50"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SpeechWorkspace;
