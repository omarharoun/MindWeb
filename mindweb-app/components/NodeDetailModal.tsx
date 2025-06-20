import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { X, CreditCard as Edit3, Save, Tag, Link, Calendar } from 'lucide-react-native';
import { KnowledgeNode, CATEGORIES } from '@/types/knowledge';

interface NodeDetailModalProps {
  visible: boolean;
  node: KnowledgeNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<KnowledgeNode>) => void;
  onDelete: (nodeId: string) => void;
}

export default function NodeDetailModal({
  visible,
  node,
  onClose,
  onUpdate,
  onDelete,
}: NodeDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTags, setEditedTags] = useState('');

  React.useEffect(() => {
    if (node) {
      setEditedTitle(node.title);
      setEditedContent(node.content);
      setEditedTags(node.tags.join(', '));
    }
  }, [node]);

  if (!node) return null;

  const category = CATEGORIES.find(cat => cat.id === node.category);
  const nodeColor = category?.color || '#6b7280';

  const handleSave = () => {
    onUpdate(node.id, {
      title: editedTitle.trim(),
      content: editedContent.trim(),
      tags: editedTags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Knowledge Node',
      'Are you sure you want to delete this knowledge node? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(node.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: nodeColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Knowledge Node</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <Save size={24} color="#10b981" />
              </TouchableOpacity>
            ) : (
              <Edit3 size={24} color="#f8fafc" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.categoryBadge, { backgroundColor: nodeColor + '20' }]}>
            <Text style={[styles.categoryText, { color: nodeColor }]}>
              {category?.name}
            </Text>
          </View>

          {isEditing ? (
            <>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Knowledge title..."
                placeholderTextColor="#64748b"
                multiline
              />
              <TextInput
                style={styles.contentInput}
                value={editedContent}
                onChangeText={setEditedContent}
                placeholder="Describe what you learned..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <TextInput
                style={styles.tagsInput}
                value={editedTags}
                onChangeText={setEditedTags}
                placeholder="Tags (comma separated)"
                placeholderTextColor="#64748b"
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>{node.title}</Text>
              <Text style={styles.contentText}>{node.content}</Text>

              {node.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <View style={styles.sectionHeader}>
                    <Tag size={16} color="#94a3b8" />
                    <Text style={styles.sectionTitle}>Tags</Text>
                  </View>
                  <View style={styles.tagsContainer}>
                    {node.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {node.connections.length > 0 && (
                <View style={styles.connectionsSection}>
                  <View style={styles.sectionHeader}>
                    <Link size={16} color="#94a3b8" />
                    <Text style={styles.sectionTitle}>
                      Connected to {node.connections.length} nodes
                    </Text>
                  </View>
                </View>
              )}

              {node.source && (
                <View style={styles.sourceSection}>
                  <Text style={styles.sourceLabel}>Source:</Text>
                  <Text style={styles.sourceText}>{node.source}</Text>
                </View>
              )}

              <View style={styles.metaSection}>
                <View style={styles.sectionHeader}>
                  <Calendar size={16} color="#94a3b8" />
                  <Text style={styles.sectionTitle}>
                    Created {node.createdAt.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {!isEditing && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Node</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 2,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginBottom: 16,
    lineHeight: 32,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 60,
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 24,
  },
  contentInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#f8fafc',
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  tagsInput: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#f8fafc',
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#e2e8f0',
  },
  connectionsSection: {
    marginBottom: 24,
  },
  sourceSection: {
    marginBottom: 24,
  },
  sourceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  metaSection: {
    marginBottom: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});