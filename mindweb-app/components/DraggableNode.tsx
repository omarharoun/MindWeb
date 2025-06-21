import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { KnowledgeNode, CATEGORIES } from '@/types/knowledge';

interface DraggableNodeProps {
  node: KnowledgeNode;
  onPress: (node: KnowledgeNode) => void;
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void;
  isSelected: boolean;
}

export default function DraggableNode({
  node,
  onPress,
  onPositionChange,
  isSelected,
}: DraggableNodeProps) {
  const translateX = useSharedValue(node.position.x);
  const translateY = useSharedValue(node.position.y);
  const scale = useSharedValue(1);
  const [isDragging, setIsDragging] = useState(false);

  const category = CATEGORIES.find(c => c.id === node.category);
  const nodeColor = category?.color || '#6b7280';

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      scale.value = withSpring(1.1);
      runOnJS(setIsDragging)(true);
    },
    onActive: (event) => {
      translateX.value = node.position.x + event.translationX;
      translateY.value = node.position.y + event.translationY;
    },
    onEnd: () => {
      scale.value = withSpring(1);
      runOnJS(setIsDragging)(false);
      runOnJS(onPositionChange)(node.id, {
        x: translateX.value,
        y: translateY.value,
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    if (!isDragging) {
      onPress(node);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          styles.node,
          {
            backgroundColor: nodeColor + '20',
            borderColor: nodeColor,
            borderWidth: isSelected ? 3 : 2,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.nodeContent}>
          {node.aiGenerated && (
            <View style={[styles.aiBadge, { backgroundColor: nodeColor }]}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          <Text
            style={[styles.nodeTitle, { color: nodeColor }]}
            numberOfLines={2}
            onPress={handlePress}
          >
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
          {node.media && node.media.length > 0 && (
            <View style={styles.mediaIndicator}>
              <Text style={styles.mediaCount}>{node.media.length}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    width: 120,
    minHeight: 90,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nodeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  aiBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  aiBadgeText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  nodeTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16,
  },
  nodeCategory: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 2,
  },
  nodeTags: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
  },
  mediaIndicator: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCount: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
});