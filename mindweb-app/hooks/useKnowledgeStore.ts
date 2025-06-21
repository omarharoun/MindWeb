import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KnowledgeNode, UserStats, Achievement, CATEGORIES, AppSettings, Quiz, QuizQuestion, QuizStats } from '@/types/knowledge';

const STORAGE_KEYS = {
  NODES: 'mindweb_nodes',
  STATS: 'mindweb_stats',
  SETTINGS: 'mindweb_settings',
  QUIZZES: 'mindweb_quizzes',
};

const DEFAULT_STATS: UserStats = {
  totalNodes: 0,
  totalConnections: 0,
  experiencePoints: 0,
  level: 1,
  streakDays: 0,
  categories: {},
  achievements: [],
  quizStats: {
    totalQuizzes: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    averageScore: 0,
    bestStreak: 0,
    timeSpent: 0,
    difficultyProgress: { easy: 0, medium: 0, hard: 0 },
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  aiEnabled: false,
  notifications: true,
  darkMode: true,
  autoSave: true,
  quizSettings: {
    defaultTimeLimit: 300, // 5 minutes
    showExplanations: true,
    shuffleQuestions: true,
    difficultyProgression: true,
  },
};

// Cache for parsed data to avoid repeated JSON parsing
let nodesCache: KnowledgeNode[] | null = null;
let statsCache: UserStats | null = null;
let settingsCache: AppSettings | null = null;
let quizzesCache: Quiz[] | null = null;

export function useKnowledgeStore() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized stats calculations
  const memoizedStats = useMemo(() => {
    const totalConnections = nodes.reduce((sum, node) => sum + node.connections.length, 0) / 2;
    const categories = nodes.reduce((acc, node) => {
      acc[node.category] = (acc[node.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...stats,
      totalNodes: nodes.length,
      totalConnections,
      categories,
    };
  }, [nodes, stats]);

  const loadData = useCallback(async () => {
    try {
      // Use cached data if available
      if (nodesCache && statsCache && settingsCache && quizzesCache) {
        setNodes(nodesCache);
        setStats(statsCache);
        setSettings(settingsCache);
        setQuizzes(quizzesCache);
        setLoading(false);
        return;
      }

      const [nodesData, statsData, settingsData, quizzesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NODES),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.QUIZZES),
      ]);

      if (nodesData) {
        const parsedNodes = JSON.parse(nodesData).map((node: any) => ({
          ...node,
          createdAt: new Date(node.createdAt),
        }));
        nodesCache = parsedNodes;
        setNodes(parsedNodes);
      }

      if (statsData) {
        const parsedStats = JSON.parse(statsData);
        parsedStats.achievements = parsedStats.achievements.map((achievement: any) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
        }));
        statsCache = parsedStats;
        setStats(parsedStats);
      }

      if (settingsData) {
        const parsedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) };
        settingsCache = parsedSettings;
        setSettings(parsedSettings);
      }

      if (quizzesData) {
        const parsedQuizzes = JSON.parse(quizzesData).map((quiz: any) => ({
          ...quiz,
          createdAt: new Date(quiz.createdAt),
        }));
        quizzesCache = parsedQuizzes;
        setQuizzes(parsedQuizzes);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveNodes = useCallback(async (newNodes: KnowledgeNode[]) => {
    try {
      const serializedNodes = JSON.stringify(newNodes);
      await AsyncStorage.setItem(STORAGE_KEYS.NODES, serializedNodes);
      nodesCache = newNodes;
      setNodes(newNodes);
    } catch (error) {
      console.error('Error saving nodes:', error);
    }
  }, []);

  const saveStats = useCallback(async (newStats: UserStats) => {
    try {
      const serializedStats = JSON.stringify(newStats);
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, serializedStats);
      statsCache = newStats;
      setStats(newStats);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      const serializedSettings = JSON.stringify(newSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, serializedSettings);
      settingsCache = newSettings;
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  const saveQuizzes = useCallback(async (newQuizzes: Quiz[]) => {
    try {
      const serializedQuizzes = JSON.stringify(newQuizzes);
      await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, serializedQuizzes);
      quizzesCache = newQuizzes;
      setQuizzes(newQuizzes);
    } catch (error) {
      console.error('Error saving quizzes:', error);
    }
  }, []);

  const addNode = useCallback(async (nodeData: Omit<KnowledgeNode, 'id' | 'createdAt' | 'position'>) => {
    const newNode: KnowledgeNode = {
      ...nodeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
    };

    const newNodes = [...nodes, newNode];
    await saveNodes(newNodes);

    // Update stats
    const newStats = {
      ...stats,
      totalNodes: stats.totalNodes + 1,
      experiencePoints: stats.experiencePoints + 10,
      categories: {
        ...stats.categories,
        [nodeData.category]: (stats.categories[nodeData.category] || 0) + 1,
      },
    };

    // Calculate new level
    newStats.level = Math.floor(newStats.experiencePoints / 100) + 1;

    await saveStats(newStats);
  }, [nodes, stats, saveNodes, saveStats]);

  const updateNode = useCallback(async (nodeId: string, updates: Partial<KnowledgeNode>) => {
    const newNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    await saveNodes(newNodes);
  }, [nodes, saveNodes]);

  const updateNodePosition = useCallback(async (nodeId: string, position: { x: number; y: number }) => {
    const newNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, position } : node
    );
    await saveNodes(newNodes);
  }, [nodes, saveNodes]);

  const deleteNode = useCallback(async (nodeId: string) => {
    const newNodes = nodes.filter(node => node.id !== nodeId);
    await saveNodes(newNodes);

    // Update stats
    const deletedNode = nodes.find(node => node.id === nodeId);
    if (deletedNode) {
      const newStats = {
        ...stats,
        totalNodes: Math.max(0, stats.totalNodes - 1),
        categories: {
          ...stats.categories,
          [deletedNode.category]: Math.max(0, (stats.categories[deletedNode.category] || 0) - 1),
        },
      };
      await saveStats(newStats);
    }
  }, [nodes, stats, saveNodes, saveStats]);

  const connectNodes = useCallback(async (nodeId1: string, nodeId2: string) => {
    const newNodes = nodes.map(node => {
      if (node.id === nodeId1 && !node.connections.includes(nodeId2)) {
        return { ...node, connections: [...node.connections, nodeId2] };
      }
      if (node.id === nodeId2 && !node.connections.includes(nodeId1)) {
        return { ...node, connections: [...node.connections, nodeId1] };
      }
      return node;
    });
    
    await saveNodes(newNodes);

    // Update stats
    const newStats = {
      ...memoizedStats,
      totalConnections: memoizedStats.totalConnections + 1,
      experiencePoints: memoizedStats.experiencePoints + 5,
    };
    await saveStats(newStats);
  }, [nodes, memoizedStats, saveNodes, saveStats]);

  const generateAIContent = useCallback(async (prompt: string, nodeId?: string): Promise<string> => {
    if (!settings.openaiApiKey || !settings.aiEnabled) {
      throw new Error('OpenAI API key not configured or AI disabled');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates educational content for a knowledge management app. Provide clear, concise, and informative responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI content');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }, [settings.openaiApiKey, settings.aiEnabled]);

  const generateQuizFromNodes = useCallback(async (nodeIds: string[], difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<Quiz> => {
    const selectedNodes = nodes.filter(node => nodeIds.includes(node.id));
    const questions: QuizQuestion[] = [];

    for (const node of selectedNodes) {
      // Generate different types of questions based on node content
      const questionTypes: QuizQuestion['type'][] = ['multiple-choice', 'true-false', 'fill-blank'];
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question: QuizQuestion;

      switch (questionType) {
        case 'multiple-choice':
          question = {
            id: `${node.id}-mc-${Date.now()}`,
            type: 'multiple-choice',
            question: `What is the main concept discussed in "${node.title}"?`,
            options: [
              node.content.split('.')[0] + '.',
              'A completely different concept',
              'An unrelated topic',
              'Something else entirely',
            ],
            correctAnswer: node.content.split('.')[0] + '.',
            explanation: `This question is based on the content of "${node.title}".`,
            difficulty,
            nodeId: node.id,
            category: node.category,
          };
          break;

        case 'true-false':
          question = {
            id: `${node.id}-tf-${Date.now()}`,
            type: 'true-false',
            question: `True or False: The main topic of "${node.title}" is related to ${node.category}.`,
            correctAnswer: 'True',
            explanation: `This node is categorized under ${node.category}.`,
            difficulty,
            nodeId: node.id,
            category: node.category,
          };
          break;

        case 'fill-blank':
          const words = node.title.split(' ');
          const blankWord = words[Math.floor(words.length / 2)];
          const questionText = node.title.replace(blankWord, '____');
          question = {
            id: `${node.id}-fb-${Date.now()}`,
            type: 'fill-blank',
            question: `Fill in the blank: ${questionText}`,
            correctAnswer: blankWord,
            explanation: `The complete title is "${node.title}".`,
            difficulty,
            nodeId: node.id,
            category: node.category,
          };
          break;

        default:
          continue;
      }

      questions.push(question);
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      title: `Knowledge Quiz - ${new Date().toLocaleDateString()}`,
      questions,
      difficulty,
      timeLimit: settings.quizSettings.defaultTimeLimit,
      createdAt: new Date(),
    };

    const newQuizzes = [...quizzes, quiz];
    await saveQuizzes(newQuizzes);

    return quiz;
  }, [nodes, quizzes, settings.quizSettings.defaultTimeLimit, saveQuizzes]);

  const updateQuizStats = useCallback(async (quizResult: {
    quizId: string;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    difficulty: string;
  }) => {
    const newQuizStats: QuizStats = {
      ...stats.quizStats,
      totalQuizzes: stats.quizStats.totalQuizzes + 1,
      correctAnswers: stats.quizStats.correctAnswers + quizResult.correctAnswers,
      totalQuestions: stats.quizStats.totalQuestions + quizResult.totalQuestions,
      timeSpent: stats.quizStats.timeSpent + Math.round(quizResult.timeSpent / 60), // Convert to minutes
      difficultyProgress: {
        ...stats.quizStats.difficultyProgress,
        [quizResult.difficulty]: stats.quizStats.difficultyProgress[quizResult.difficulty] + 1,
      },
    };

    // Calculate average score
    newQuizStats.averageScore = (newQuizStats.correctAnswers / newQuizStats.totalQuestions) * 100;

    // Update experience points based on quiz performance
    const scorePercentage = (quizResult.correctAnswers / quizResult.totalQuestions) * 100;
    const bonusXP = Math.round(scorePercentage / 10); // 1 XP per 10% score

    const newStats = {
      ...stats,
      quizStats: newQuizStats,
      experiencePoints: stats.experiencePoints + bonusXP,
    };

    // Calculate new level
    newStats.level = Math.floor(newStats.experiencePoints / 100) + 1;

    await saveStats(newStats);
  }, [stats, saveStats]);

  return {
    nodes,
    stats: memoizedStats,
    settings,
    quizzes,
    loading,
    addNode,
    updateNode,
    updateNodePosition,
    deleteNode,
    connectNodes,
    generateAIContent,
    generateQuizFromNodes,
    updateQuizStats,
    updateSettings: saveSettings,
  };
}