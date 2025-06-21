import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';

export default function EmptyWebState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Brain size={64} color="#3b82f6" />
      </View>
      <Text style={styles.title}>Your Knowledge Web Awaits</Text>
      <Text style={styles.subtitle}>
        Start building your personal web of knowledge by adding your first insight!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});