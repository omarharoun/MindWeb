import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Search, Filter, Plus, Settings } from 'lucide-react-native';
import { useKnowledgeStore } from '@/hooks/useKnowledgeStore';
import EnhancedKnowledgeWeb from '@/components/EnhancedKnowledgeWeb';
import EnhancedNodeDetailModal from '@/components/EnhancedNodeDetailModal';
import { KnowledgeNode } from '@/types/knowledge';
import { useRouter } from 'expo-router';

const LoadingScreen = memo(() => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading your knowledge web...</Text>
  </View>
));

const HeaderStats = memo<{ totalNodes: number; level: number }>(({ totalNodes, level }) => (
  <Text style={styles.statsText}>
    {totalNodes} nodes • Level {level}
  </Text>
));

export default function HomeScreen() {
  const {
    nodes,
    stats,
    loading,
    updateNode,
    updateNodePosition,
    deleteNode,
    generateAIContent,
    settings,
  } = useKnowledgeStore();
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleNodePress = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedNode(null);
  }, []);

  const handleAddNode = useCallback(() => {
    router.push('/add');
  }, [router]);

  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updateNodePosition(nodeId, position);
  }, [updateNodePosition]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <HeaderStats totalNodes={stats.totalNodes} level={stats.level} />
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/profile')}>
              <Settings size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddNode}>
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Search size={20} color="#94a3b8" />
            <Text style={styles.actionButtonText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color="#94a3b8" />
            <Text style={styles.actionButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <EnhancedKnowledgeWeb
        nodes={nodes}
        onNodePress={handleNodePress}
        onNodePositionChange={handleNodePositionChange}
      />

      <EnhancedNodeDetailModal
        visible={modalVisible}
        node={selectedNode}
        onClose={handleCloseModal}
        onUpdate={updateNode}
        onDelete={deleteNode}
        onGenerateAI={generateAIContent}
        aiEnabled={settings.aiEnabled}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    backgroundColor: '#334155',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
});