import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KnowledgeNode, UserStats, Achievement, CATEGORIES } from '@/types/knowledge';

const STORAGE_KEYS = {
  NODES: 'mindweb_nodes',
  STATS: 'mindweb_stats',
};

const DEFAULT_STATS: UserStats = {
  totalNodes: 0,
  totalConnections: 0,
  experiencePoints: 0,
  level: 1,
  streakDays: 0,
  categories: {},
  achievements: [],
};

// Cache for parsed data to avoid repeated JSON parsing
let nodesCache: KnowledgeNode[] | null = null;
let statsCache: UserStats | null = null;

export function useKnowledgeStore() {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
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
      if (nodesCache && statsCache) {
        setNodes(nodesCache);
        setStats(statsCache);
        setLoading(false);
        return;
      }

      const [nodesData, statsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NODES),
        AsyncStorage.getItem(STORAGE_KEYS.STATS),
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

  return {
    nodes,
    stats: memoizedStats,
    loading,
    addNode,
    updateNode,
    deleteNode,
    connectNodes,
  };
}