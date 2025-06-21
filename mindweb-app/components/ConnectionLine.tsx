import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { KnowledgeNode } from '@/types/knowledge';

interface ConnectionLineProps {
  startNode: KnowledgeNode;
  endNode: KnowledgeNode;
}

export default function ConnectionLine({ startNode, endNode }: ConnectionLineProps) {
  const startX = startNode.position.x + 60; // Center of node (width/2)
  const startY = startNode.position.y + 45; // Center of node (height/2)
  const endX = endNode.position.x + 60;
  const endY = endNode.position.y + 45;

  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const opacity = Math.max(0.3, 1 - distance / 500); // Fade based on distance

  return (
    <View
      style={[
        styles.container,
        {
          left: Math.min(startX, endX) - 2,
          top: Math.min(startY, endY) - 2,
          width: Math.abs(endX - startX) + 4,
          height: Math.abs(endY - startY) + 4,
        },
      ]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity={opacity} />
            <Stop offset="100%" stopColor="#8b5cf6" stopOpacity={opacity * 0.6} />
          </LinearGradient>
        </Defs>
        <Line
          x1={startX > endX ? Math.abs(endX - startX) : 0}
          y1={startY > endY ? Math.abs(endY - startY) : 0}
          x2={startX > endX ? 0 : Math.abs(endX - startX)}
          y2={startY > endY ? 0 : Math.abs(endY - startY)}
          stroke="url(#connectionGradient)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});