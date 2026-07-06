import { useMemo } from 'react';

interface Session {
  id: string;
  topic: { id: string; text: string; category: string };
  text: string;
  wordCount: number;
  charCount: number;
  wpm: number;
  longestStreakSeconds: number;
  averageWordLength: number;
  readingTimeMinutes: number;
  date: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  xpValue: number;
}

export function useGamification(history: Session[]) {
  const completedSessions = useMemo(() => history.filter((s) => s.completed), [history]);
  const totalCompleted = completedSessions.length;

  const totalWords = useMemo(() => {
    return completedSessions.reduce((acc, s) => acc + s.wordCount, 0);
  }, [completedSessions]);

  const totalMinutes = useMemo(() => {
    // Estimate 3 minutes per completed, and 30 seconds for aborts with text
    const completedSec = totalCompleted * 180;
    const abortedSec = history.filter((s) => !s.completed && s.charCount > 0).length * 30;
    return (completedSec + abortedSec) / 60;
  }, [history, totalCompleted]);

  // Calculate XP
  const xp = useMemo(() => {
    const sessionXP = totalCompleted * 100;
    const wordXP = totalWords * 1.5;
    const minutesXP = Math.round(totalMinutes * 15);
    return Math.round(sessionXP + wordXP + minutesXP);
  }, [totalCompleted, totalWords, totalMinutes]);

  // Calculate Level (Threshold = 500 XP per level)
  const XP_PER_LEVEL = 500;
  
  const level = useMemo(() => {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }, [xp]);

  const xpProgress = useMemo(() => {
    return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  }, [xp]);

  const xpToNextLevel = useMemo(() => {
    return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
  }, [xp]);

  // Achievements evaluation
  const achievements = useMemo((): Achievement[] => {
    return [
      {
        id: 'first-session',
        title: 'First Flow',
        description: 'Complete your first spontaneous writing session.',
        unlocked: totalCompleted >= 1,
        xpValue: 50,
      },
      {
        id: 'five-sessions',
        title: 'High Five',
        description: 'Complete 5 practice sessions successfully.',
        unlocked: totalCompleted >= 5,
        xpValue: 150,
      },
      {
        id: 'half-hour',
        title: '30 Minute Club',
        description: 'Practice for a total of 30 minutes or more.',
        unlocked: totalMinutes >= 30,
        xpValue: 200,
      },
      {
        id: 'flow-master',
        title: 'Flow Master',
        description: 'Reach a speed of 50+ WPM in a completed session.',
        unlocked: completedSessions.some((s) => s.wpm >= 50),
        xpValue: 100,
      },
      {
        id: 'never-stopped',
        title: 'Constant Momentum',
        description: 'Write continuously for 2 minutes (120s) without pausing.',
        unlocked: completedSessions.some((s) => s.longestStreakSeconds >= 120),
        xpValue: 100,
      },
      {
        id: 'perfect-run',
        title: 'Perfect Flow',
        description: 'Complete a full 3-minute session with zero pauses > 2 seconds.',
        unlocked: completedSessions.some((s) => s.longestStreakSeconds >= 170),
        xpValue: 250,
      },
    ];
  }, [completedSessions, totalCompleted, totalMinutes]);

  return {
    xp,
    level,
    xpProgress,
    xpToNextLevel,
    achievements,
  };
}
export default useGamification;
