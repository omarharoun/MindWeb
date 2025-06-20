import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TrendingUp, Award, Target, Calendar, Brain } from 'lucide-react-native';
import { useKnowledgeStore } from '@/hooks/useKnowledgeStore';
import { CATEGORIES } from '@/types/knowledge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProgressCard = memo<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}>(({ title, value, subtitle, icon, color }) => (
  <View style={[styles.progressCard, { borderLeftColor: color }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
    {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
  </View>
));

const CategoryProgress = memo<{
  category: { id: string; name: string; color: string };
  count: number;
  total: number;
}>(({ category, count, total }) => {
  const percentage = useMemo(() => 
    total > 0 ? (count / total) * 100 : 0, 
    [count, total]
  );
  
  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryCount}>{count}</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.max(percentage, 5)}%`,
              backgroundColor: category.color,
            },
          ]}
        />
      </View>
    </View>
  );
});

const AchievementItem = memo<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
}>(({ title, description, icon, color, isUnlocked }) => (
  <View style={styles.achievementItem}>
    <View style={[styles.achievementIcon, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <View style={styles.achievementContent}>
      <Text style={styles.achievementTitle}>{title}</Text>
      <Text style={styles.achievementDescription}>{description}</Text>
    </View>
    {isUnlocked && (
      <View style={styles.achievementBadge}>
        <Text style={styles.achievementBadgeText}>✓</Text>
      </View>
    )}
  </View>
));

export default function ProgressScreen() {
  const { stats, nodes } = useKnowledgeStore();

  const { experienceToNextLevel, currentLevelProgress, achievements } = useMemo(() => {
    const expToNext = (stats.level * 100) - stats.experiencePoints;
    const currentProgress = stats.experiencePoints % 100;
    
    const achievementsList = [
      {
        title: 'First Knowledge Node',
        description: 'Created your first knowledge node',
        icon: <Award size={24} color="#10b981" />,
        color: '#10b981',
        isUnlocked: stats.totalNodes > 0,
      },
      {
        title: 'Knowledge Builder',
        description: 'Created 10 knowledge nodes',
        icon: <Brain size={24} color="#3b82f6" />,
        color: '#3b82f6',
        isUnlocked: stats.totalNodes >= 10,
      },
      {
        title: 'Connector',
        description: 'Created 5 connections between nodes',
        icon: <Target size={24} color="#8b5cf6" />,
        color: '#8b5cf6',
        isUnlocked: stats.totalConnections >= 5,
      },
    ];

    return {
      experienceToNextLevel: expToNext,
      currentLevelProgress: currentProgress,
      achievements: achievementsList,
    };
  }, [stats]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>
          Track your learning journey and achievements
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <ProgressCard
            title="Total Knowledge"
            value={stats.totalNodes}
            subtitle="Nodes created"
            icon={<Brain size={20} color="#3b82f6" />}
            color="#3b82f6"
          />
          <ProgressCard
            title="Current Level"
            value={stats.level}
            subtitle={`${experienceToNextLevel} XP to next level`}
            icon={<TrendingUp size={20} color="#10b981" />}
            color="#10b981"
          />
          <ProgressCard
            title="Connections"
            value={stats.totalConnections}
            subtitle="Knowledge links"
            icon={<Target size={20} color="#8b5cf6" />}
            color="#8b5cf6"
          />
          <ProgressCard
            title="Experience"
            value={stats.experiencePoints}
            subtitle="Total XP earned"
            icon={<Award size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
        </View>

        <View style={styles.levelSection}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelText}>Level {stats.level}</Text>
              <Text style={styles.levelXP}>{currentLevelProgress}/100 XP</Text>
            </View>
            <View style={styles.levelProgressBar}>
              <View
                style={[
                  styles.levelProgressFill,
                  { width: `${currentLevelProgress}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Knowledge by Category</Text>
          <View style={styles.categoriesCard}>
            {CATEGORIES.map((category) => (
              <CategoryProgress
                key={category.id}
                category={category}
                count={stats.categories[category.id] || 0}
                total={stats.totalNodes}
              />
            ))}
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsCard}>
            {achievements.map((achievement, index) => (
              <AchievementItem
                key={index}
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                color={achievement.color}
                isUnlocked={achievement.isUnlocked}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    width: (SCREEN_WIDTH - 56) / 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cbd5e1',
    flex: 1,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  levelSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  levelCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
  },
  levelXP: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoriesCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e2e8f0',
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#94a3b8',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 4,
  },
  achievementsSection: {
    marginBottom: 32,
  },
  achievementsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  achievementBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
});