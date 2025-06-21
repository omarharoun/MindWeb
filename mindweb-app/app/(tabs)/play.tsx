import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import {
  Gamepad2,
  Play,
  Trophy,
  Clock,
  Target,
  Brain,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react-native';
import { useKnowledgeStore } from '@/hooks/useKnowledgeStore';
import { Quiz, QuizQuestion, QUIZ_DIFFICULTIES } from '@/types/knowledge';

interface QuizSession {
  quiz: Quiz;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: number;
  timeRemaining: number;
  score: number;
  isCompleted: boolean;
}

export default function PlayScreen() {
  const { nodes, generateQuizFromNodes, updateQuizStats, stats } = useKnowledgeStore();
  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const startQuiz = useCallback(async () => {
    if (nodes.length === 0) {
      Alert.alert('No Knowledge Nodes', 'Add some knowledge nodes first to generate quizzes!');
      return;
    }

    try {
      const nodesToUse = selectedNodes.length > 0 ? selectedNodes : nodes.map(n => n.id);
      const quiz = await generateQuizFromNodes(nodesToUse, selectedDifficulty);
      
      const session: QuizSession = {
        quiz,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        timeRemaining: quiz.timeLimit || 300,
        score: 0,
        isCompleted: false,
      };

      setActiveQuiz(session);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz. Please try again.');
    }
  }, [nodes, selectedNodes, selectedDifficulty, generateQuizFromNodes]);

  const answerQuestion = useCallback((answer: string) => {
    if (!activeQuiz) return;

    const currentQuestion = activeQuiz.quiz.questions[activeQuiz.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    const newAnswers = {
      ...activeQuiz.answers,
      [currentQuestion.id]: answer,
    };

    const newScore = isCorrect ? activeQuiz.score + 1 : activeQuiz.score;
    const nextIndex = activeQuiz.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= activeQuiz.quiz.questions.length;

    const updatedSession: QuizSession = {
      ...activeQuiz,
      answers: newAnswers,
      score: newScore,
      currentQuestionIndex: nextIndex,
      isCompleted,
    };

    setActiveQuiz(updatedSession);

    if (isCompleted) {
      completeQuiz(updatedSession);
    }
  }, [activeQuiz]);

  const completeQuiz = useCallback(async (session: QuizSession) => {
    const timeSpent = (Date.now() - session.startTime) / 1000;
    
    await updateQuizStats({
      quizId: session.quiz.id,
      correctAnswers: session.score,
      totalQuestions: session.quiz.questions.length,
      timeSpent,
      difficulty: session.quiz.difficulty,
    });

    setShowResults(true);
  }, [updateQuizStats]);

  const resetQuiz = useCallback(() => {
    setActiveQuiz(null);
    setShowResults(false);
    setSelectedNodes([]);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!activeQuiz || activeQuiz.isCompleted) return;

    const timer = setInterval(() => {
      setActiveQuiz(prev => {
        if (!prev || prev.timeRemaining <= 1) {
          if (prev && !prev.isCompleted) {
            completeQuiz({ ...prev, isCompleted: true });
          }
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, completeQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuizSetup = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.setupCard}>
        <View style={styles.setupHeader}>
          <Gamepad2 size={32} color="#3b82f6" />
          <Text style={styles.setupTitle}>Knowledge Quiz</Text>
        </View>
        <Text style={styles.setupSubtitle}>
          Test your knowledge with AI-generated questions based on your learning nodes
        </Text>

        <View style={styles.difficultySection}>
          <Text style={styles.sectionTitle}>Select Difficulty</Text>
          <View style={styles.difficultyButtons}>
            {QUIZ_DIFFICULTIES.map(difficulty => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyButton,
                  {
                    backgroundColor: difficulty.color + '20',
                    borderColor: selectedDifficulty === difficulty.id ? difficulty.color : 'transparent',
                  },
                ]}
                onPress={() => setSelectedDifficulty(difficulty.id as any)}
              >
                <Text style={[styles.difficultyName, { color: difficulty.color }]}>
                  {difficulty.name}
                </Text>
                <Text style={styles.difficultyDescription}>
                  {difficulty.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.statsPreview}>
          <View style={styles.statItem}>
            <Brain size={20} color="#3b82f6" />
            <Text style={styles.statValue}>{nodes.length}</Text>
            <Text style={styles.statLabel}>Available Nodes</Text>
          </View>
          <View style={styles.statItem}>
            <Trophy size={20} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.quizStats.totalQuizzes}</Text>
            <Text style={styles.statLabel}>Quizzes Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={20} color="#10b981" />
            <Text style={styles.statValue}>{Math.round(stats.quizStats.averageScore)}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, nodes.length === 0 && styles.startButtonDisabled]}
          onPress={startQuiz}
          disabled={nodes.length === 0}
        >
          <Play size={24} color="#ffffff" />
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderQuestion = () => {
    if (!activeQuiz) return null;

    const question = activeQuiz.quiz.questions[activeQuiz.currentQuestionIndex];
    const progress = ((activeQuiz.currentQuestionIndex + 1) / activeQuiz.quiz.questions.length) * 100;

    return (
      <View style={styles.quizContainer}>
        <View style={styles.quizHeader}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {activeQuiz.currentQuestionIndex + 1} of {activeQuiz.quiz.questions.length}
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Clock size={16} color="#f59e0b" />
            <Text style={[styles.timerText, activeQuiz.timeRemaining < 60 && styles.timerWarning]}>
              {formatTime(activeQuiz.timeRemaining)}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <Text style={styles.questionType}>{question.type.replace('-', ' ').toUpperCase()}</Text>
            <Text style={styles.questionText}>{question.question}</Text>

            <View style={styles.answersContainer}>
              {question.type === 'multiple-choice' && question.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.answerButton}
                  onPress={() => answerQuestion(option)}
                >
                  <Text style={styles.answerText}>{option}</Text>
                </TouchableOpacity>
              ))}

              {question.type === 'true-false' && (
                <>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.trueButton]}
                    onPress={() => answerQuestion('True')}
                  >
                    <CheckCircle size={20} color="#10b981" />
                    <Text style={styles.answerText}>True</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.answerButton, styles.falseButton]}
                    onPress={() => answerQuestion('False')}
                  >
                    <XCircle size={20} color="#ef4444" />
                    <Text style={styles.answerText}>False</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderResults = () => {
    if (!activeQuiz) return null;

    const scorePercentage = (activeQuiz.score / activeQuiz.quiz.questions.length) * 100;
    const timeSpent = (Date.now() - activeQuiz.startTime) / 1000;

    return (
      <Modal visible={showResults} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Trophy size={48} color="#f59e0b" />
            <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{Math.round(scorePercentage)}%</Text>
            <Text style={styles.scoreLabel}>
              {activeQuiz.score} out of {activeQuiz.quiz.questions.length} correct
            </Text>
          </View>

          <View style={styles.resultsStats}>
            <View style={styles.resultStat}>
              <Clock size={20} color="#3b82f6" />
              <Text style={styles.resultStatValue}>{formatTime(Math.round(timeSpent))}</Text>
              <Text style={styles.resultStatLabel}>Time Taken</Text>
            </View>
            <View style={styles.resultStat}>
              <Zap size={20} color="#10b981" />
              <Text style={styles.resultStatValue}>{activeQuiz.quiz.difficulty}</Text>
              <Text style={styles.resultStatLabel}>Difficulty</Text>
            </View>
            <View style={styles.resultStat}>
              <Star size={20} color="#f59e0b" />
              <Text style={styles.resultStatValue}>
                {scorePercentage >= 80 ? 'Excellent' : scorePercentage >= 60 ? 'Good' : 'Keep Learning'}
              </Text>
              <Text style={styles.resultStatLabel}>Performance</Text>
            </View>
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
              <RotateCcw size={20} color="#3b82f6" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Play & Test</Text>
        <Text style={styles.headerSubtitle}>
          Challenge yourself with interactive quizzes based on your knowledge
        </Text>
      </View>

      {!activeQuiz ? renderQuizSetup() : renderQuestion()}
      {renderResults()}
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
  setupCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginTop: 12,
  },
  setupSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  difficultySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  difficultyButtons: {
    gap: 12,
  },
  difficultyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  difficultyName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
  statsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#64748b',
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
  },
  timerWarning: {
    color: '#ef4444',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
  },
  questionType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
    lineHeight: 28,
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trueButton: {
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  falseButton: {
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  answerText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#f8fafc',
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultsTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginTop: 16,
  },
  scoreCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginTop: 8,
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  resultsActions: {
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});