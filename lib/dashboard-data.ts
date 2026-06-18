/**
 * Student dashboard data layer.
 *
 * Types + mock data shaped exactly how the UI consumes it. When
 * the real API is wired in, swap `getMockStudentStats()` for a
 * Supabase fetch; the components don't need to change.
 */

export type Subject = {
  id: string;
  name: string;
  icon: string;          // emoji
  color: string;         // hex, e.g. "#7C3AED"
  colorBg: string;       // e.g. "bg-purple-500/10"
  available: boolean;
  progress: number;      // 0-100
  accuracy: number;      // 0-100, 0 if no attempts
  questionsAnswered: number;
  correctAnswers: number;
  challengesCompleted: number;
};

export type ChallengeResult = {
  id: string;
  subjectId: string;
  subjectName: string;
  score: number;         // e.g. 8
  total: number;         // e.g. 11
  accuracy: number;      // e.g. 72.7
  completedAt: string;   // ISO date string
};

export type ProgressDataPoint = {
  date: string;          // e.g. "May 14"
  accuracy: number;      // 0-100
};

export type StudentStats = {
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  streakDays: number;
  lastActiveDate: string;
  subjects: Subject[];
  recentChallenges: ChallengeResult[];
  progressHistory: ProgressDataPoint[];
};

export const SUBJECTS_CONFIG: Subject[] = [
  {
    id: 'histology',
    name: 'Histology',
    icon: '🔬',
    color: '#7C3AED',
    colorBg: 'bg-purple-500/10',
    available: true,
    progress: 78,
    accuracy: 78,
    questionsAnswered: 11,
    correctAnswers: 9,
    challengesCompleted: 3,
  },
  {
    id: 'anatomy',
    name: 'Anatomy',
    icon: '🦴',
    color: '#0EA5E9',
    colorBg: 'bg-sky-500/10',
    available: false,
    progress: 0,
    accuracy: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    challengesCompleted: 0,
  },
  {
    id: 'physiology',
    name: 'Physiology',
    icon: '❤️',
    color: '#EF4444',
    colorBg: 'bg-red-500/10',
    available: false,
    progress: 0,
    accuracy: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    challengesCompleted: 0,
  },
  {
    id: 'biochemistry',
    name: 'Biochemistry',
    icon: '⚗️',
    color: '#10B981',
    colorBg: 'bg-emerald-500/10',
    available: false,
    progress: 0,
    accuracy: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    challengesCompleted: 0,
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    icon: '💊',
    color: '#F97316',
    colorBg: 'bg-orange-500/10',
    available: false,
    progress: 0,
    accuracy: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    challengesCompleted: 0,
  },
  {
    id: 'pathology',
    name: 'Pathology',
    icon: '🧫',
    color: '#EC4899',
    colorBg: 'bg-pink-500/10',
    available: false,
    progress: 0,
    accuracy: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    challengesCompleted: 0,
  },
];

/**
 * Empty stats — rendered when a real student has no quiz sessions
 * yet, or when the API fails and we still need a valid shape so
 * the dashboard can paint without `?.` everywhere.
 */
export function getEmptyStudentStats(): StudentStats {
  return {
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    overallAccuracy: 0,
    streakDays: 0,
    lastActiveDate: new Date().toISOString(),
    subjects: SUBJECTS_CONFIG.map((s) => ({
      ...s,
      progress: 0,
      accuracy: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      challengesCompleted: 0,
    })),
    recentChallenges: [],
    progressHistory: [],
  };
}

export function getMockStudentStats(): StudentStats {
  // 8 historical progress data points spanning the last 5 weeks,
  // final point lands on 77.5 to match the design screenshot.
  const progressHistory: ProgressDataPoint[] = [
    { date: 'May 14', accuracy: 45 },
    { date: 'May 17', accuracy: 52 },
    { date: 'May 21', accuracy: 48 },
    { date: 'May 24', accuracy: 61 },
    { date: 'May 28', accuracy: 58 },
    { date: 'Jun 1',  accuracy: 70 },
    { date: 'Jun 4',  accuracy: 74 },
    { date: 'Jun 11', accuracy: 77.5 },
  ];

  const recentChallenges: ChallengeResult[] = [
    {
      id: '1',
      subjectId: 'histology',
      subjectName: 'Histology',
      score: 9,
      total: 11,
      accuracy: 81.8,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      subjectId: 'histology',
      subjectName: 'Histology',
      score: 8,
      total: 11,
      accuracy: 72.7,
      completedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '3',
      subjectId: 'histology',
      subjectName: 'Histology',
      score: 7,
      total: 11,
      accuracy: 63.6,
      completedAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  return {
    totalQuestionsAnswered: 320,
    totalCorrectAnswers: 248,
    overallAccuracy: 77.5,
    streakDays: 12,
    lastActiveDate: new Date().toISOString(),
    subjects: SUBJECTS_CONFIG,
    recentChallenges,
    progressHistory,
  };
}
