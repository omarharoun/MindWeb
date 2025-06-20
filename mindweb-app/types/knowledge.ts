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