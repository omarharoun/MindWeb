import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { KnowledgeNode } from '@/types/knowledge';
import DraggableNode from './DraggableNode';
import ConnectionLine from './ConnectionLine';
import EmptyWebState from './EmptyWebState';

interface EnhancedKnowledgeWebProps {
  nodes: KnowledgeNode[];
  onNodePress: (node: KnowledgeNode) => void;
  onNodePositionChange: (nodeId: string, position: { x: number; y: number }) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WEB_WIDTH = SCREEN_WIDTH * 3;
const WEB_HEIGHT = SCREEN_HEIGHT * 2;

export default function EnhancedKnowledgeWeb({
  nodes,
  onNodePress,
  onNodePositionChange,
}: EnhancedKnowledgeWebProps) {
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
            startNode={node}
            endNode={connectedNode}
          />
        );
      }).filter(Boolean)
    );

    const nodeElements = nodes.map(node => (
      <DraggableNode
        key={node.id}
        node={node}
        onPress={handleNodePress}
        onPositionChange={onNodePositionChange}
        isSelected={selectedNode === node.id}
      />
    ));

    return { connections: connectionElements, nodeComponents: nodeElements };
  }, [nodes, selectedNode, handleNodePress, onNodePositionChange]);

  if (nodes.length === 0) {
    return <EmptyWebState />;
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
      removeClippedSubviews={false}
    >
      <ScrollView
        contentContainerStyle={styles.webContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      >
        <View style={styles.web}>
          <View style={styles.connectionsLayer}>
            {connections}
          </View>
          <View style={styles.nodesLayer}>
            {nodeComponents}
          </View>
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
  connectionsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  nodesLayer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
});