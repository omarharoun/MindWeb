export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
  createdAt: Date;
  connections: string[]; // IDs of connected nodes
  position: { x: number; y: number };
  color: string;
  level: number; // Node importance/depth level
  media?: MediaAttachment[];
  aiGenerated?: boolean;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  uri: string;
  name: string;
  size?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  totalNodes: number;
  totalConnections: number;
  experiencePoints: number;
  level: number;
  streakDays: number;
  categories: Record<string, number>;
  achievements: Achievement[];
  quizStats: QuizStats;
}

export interface QuizStats {
  totalQuizzes: number;
  correctAnswers: number;
  totalQuestions: number;
  averageScore: number;
  bestStreak: number;
  timeSpent: number; // in minutes
  difficultyProgress: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'flashcard';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nodeId: string;
  category: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // in seconds
  category?: string;
  createdAt: Date;
}

export interface AppSettings {
  openaiApiKey?: string;
  aiEnabled: boolean;
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  quizSettings: {
    defaultTimeLimit: number;
    showExplanations: boolean;
    shuffleQuestions: boolean;
    difficultyProgression: boolean;
  };
}

export const CATEGORIES = [
  { id: 'science', name: 'Science', color: '#3b82f6' },
  { id: 'technology', name: 'Technology', color: '#8b5cf6' },
  { id: 'history', name: 'History', color: '#f59e0b' },
  { id: 'philosophy', name: 'Philosophy', color: '#10b981' },
  { id: 'literature', name: 'Literature', color: '#ef4444' },
  { id: 'arts', name: 'Arts', color: '#f97316' },
  { id: 'mathematics', name: 'Mathematics', color: '#06b6d4' },
  { id: 'health', name: 'Health', color: '#84cc16' },
  { id: 'business', name: 'Business', color: '#6366f1' },
  { id: 'personal', name: 'Personal', color: '#ec4899' },
] as const;

export const QUIZ_DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: '#10b981', description: 'Basic recall and understanding' },
  { id: 'medium', name: 'Medium', color: '#f59e0b', description: 'Application and analysis' },
  { id: 'hard', name: 'Hard', color: '#ef4444', description: 'Synthesis and evaluation' },
] as const;