import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Save, Tag, Link2, Palette } from 'lucide-react-native';
import { useKnowledgeStore } from '@/hooks/useKnowledgeStore';
import { CATEGORIES } from '@/types/knowledge';
import { useRouter } from 'expo-router';

export default function AddKnowledgeScreen() {
  const { addNode } = useKnowledgeStore();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and content for your knowledge node.');
      return;
    }

    setLoading(true);
    try {
      const category = CATEGORIES.find(cat => cat.id === selectedCategory);
      
      await addNode({
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        source: source.trim() || undefined,
        connections: [],
        color: category?.color || '#6b7280',
        level: 1,
      });

      // Reset form
      setTitle('');
      setContent('');
      setSource('');
      setTags('');
      setSelectedCategory(CATEGORIES[0].id);

      Alert.alert('Success', 'Knowledge node added to your web!', [
        { text: 'Add Another', style: 'default' },
        { text: 'View Web', onPress: () => router.push('/') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save knowledge node. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Knowledge</Text>
        <Text style={styles.headerSubtitle}>
          Capture and connect new insights to your knowledge web
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What did you learn?"
            placeholderTextColor="#64748b"
            multiline
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Describe your insight in detail..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.labelContainer}>
            <Palette size={16} color="#94a3b8" />
            <Text style={styles.label}>Category</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && {
                    backgroundColor: category.color + '30',
                    borderColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && { color: category.color },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <View style={styles.labelContainer}>
            <Tag size={16} color="#94a3b8" />
            <Text style={styles.label}>Tags</Text>
          </View>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="machine learning, AI, algorithms (comma separated)"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.labelContainer}>
            <Link2 size={16} color="#94a3b8" />
            <Text style={styles.label}>Source</Text>
          </View>
          <TextInput
            style={styles.input}
            value={source}
            onChangeText={setSource}
            placeholder="Book, article, video, or website (optional)"
            placeholderTextColor="#64748b"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save to Knowledge Web'}
          </Text>
        </TouchableOpacity>
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
  formSection: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#e2e8f0',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#475569',
  },
  titleInput: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#475569',
    minHeight: 60,
  },
  contentInput: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#475569',
    minHeight: 120,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cbd5e1',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#64748b',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});