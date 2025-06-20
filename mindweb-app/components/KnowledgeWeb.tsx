import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { KnowledgeNode } from '@/types/knowledge';
import { CATEGORIES } from '@/types/knowledge';

interface KnowledgeWebProps {
  nodes: KnowledgeNode[];
  onNodePress: (node: KnowledgeNode) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WEB_WIDTH = SCREEN_WIDTH * 2;
const WEB_HEIGHT = SCREEN_HEIGHT * 1.5;

const KnowledgeNodeComponent = memo<{
  node: KnowledgeNode;
  onPress: () => void;
  isSelected: boolean;
}>(({ node, onPress, isSelected }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.9);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(1.1);
    opacity.value = withSpring(1);
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
    opacity.value = withSpring(0.9);
  }, [scale, opacity]);

  const { category, nodeColor, nodeStyle } = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === node.category);
    const color = cat?.color || '#6b7280';
    const style = {
      left: node.position.x,
      top: node.position.y,
      backgroundColor: color + '20',
      borderColor: color,
      borderWidth: isSelected ? 3 : 2,
    };
    return { category: cat, nodeColor: color, nodeStyle: style };
  }, [node.category, node.position, isSelected]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.node, nodeStyle]}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.nodeContent, animatedStyle]}>
        <Text style={[styles.nodeTitle, { color: nodeColor }]} numberOfLines={2}>
          {node.title}
        </Text>
        <Text style={styles.nodeCategory} numberOfLines={1}>
          {category?.name}
        </Text>
        {node.tags.length > 0 && (
          <Text style={styles.nodeTags} numberOfLines={1}>
            {node.tags.slice(0, 2).join(', ')}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

const ConnectionLine = memo<{
  node: KnowledgeNode;
  connectedNode: KnowledgeNode;
}>(({ node, connectedNode }) => {
  const connectionStyle = useMemo(() => ({
    left: Math.min(node.position.x + 40, connectedNode.position.x + 40),
    top: Math.min(node.position.y + 30, connectedNode.position.y + 30),
    width: Math.abs(connectedNode.position.x - node.position.x),
    height: Math.abs(connectedNode.position.y - node.position.y),
  }), [node.position, connectedNode.position]);

  return (
    <View
      style={[styles.connection, connectionStyle]}
    />
  );
});

const EmptyState = memo(() => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>Your Knowledge Web Awaits</Text>
    <Text style={styles.emptySubtitle}>
      Start building your personal web of knowledge by adding your first insight!
    </Text>
  </View>
));

export default function KnowledgeWeb({ nodes, onNodePress }: KnowledgeWebProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNodePress = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node.id);
    onNodePress(node);
  }, [onNodePress]);

  const { connections, nodeComponents } = useMemo(() => {
    if (nodes.length === 0) return { connections: [], nodeComponents: [] };

    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    
    const connectionElements = nodes.flatMap(node =>
      node.connections.map(connectionId => {
        const connectedNode = nodeMap.get(connectionId);
        if (!connectedNode) return null;

        return (
          <ConnectionLine
            key={`${node.id}-${connectionId}`}
            node={node}
            connectedNode={connectedNode}
          />
        );
      }).filter(Boolean)
    );

    const nodeElements = nodes.map(node => (
      <KnowledgeNodeComponent
        key={node.id}
        node={node}
        onPress={() => handleNodePress(node)}
        isSelected={selectedNode === node.id}
      />
    ));

    return { connections: connectionElements, nodeComponents: nodeElements };
  }, [nodes, selectedNode, handleNodePress]);

  if (nodes.length === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.webContainer}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      maximumZoomScale={2}
      minimumZoomScale={0.5}
      removeClippedSubviews={true}
    >
      <ScrollView
        contentContainerStyle={styles.webContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <View style={styles.web}>
          {connections}
          {nodeComponents}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webContainer: {
    width: WEB_WIDTH,
  },
  webContent: {
    height: WEB_HEIGHT,
  },
  web: {
    width: WEB_WIDTH,
    height: WEB_HEIGHT,
    position: 'relative',
  },
  node: {
    position: 'absolute',
    width: 80,
    height: 60,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nodeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeTitle: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  nodeCategory: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
  },
  nodeTags: {
    fontSize: 7,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1,
  },
  connection: {
    position: 'absolute',
    backgroundColor: '#334155',
    height: 1,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
});