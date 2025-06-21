import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Edit3,
  Save,
  Tag,
  Link,
  Calendar,
  Sparkles,
  Image,
  Paperclip,
  Palette,
  Trash2,
} from 'lucide-react-native';
import { KnowledgeNode, CATEGORIES, MediaAttachment } from '@/types/knowledge';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface EnhancedNodeDetailModalProps {
  visible: boolean;
  node: KnowledgeNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<KnowledgeNode>) => void;
  onDelete: (nodeId: string) => void;
  onGenerateAI: (prompt: string, nodeId?: string) => Promise<string>;
  aiEnabled: boolean;
}

export default function EnhancedNodeDetailModal({
  visible,
  node,
  onClose,
  onUpdate,
  onDelete,
  onGenerateAI,
  aiEnabled,
}: EnhancedNodeDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [editedColor, setEditedColor] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>([]);

  useEffect(() => {
    if (node) {
      setEditedTitle(node.title);
      setEditedContent(node.content);
      setEditedTags(node.tags.join(', '));
      setEditedColor(node.color);
      setMedia(node.media || []);
    }
  }, [node]);

  if (!node) return null;

  const category = CATEGORIES.find(cat => cat.id === node.category);
  const nodeColor = editedColor || category?.color || '#6b7280';

  const handleSave = () => {
    onUpdate(node.id, {
      title: editedTitle.trim(),
      content: editedContent.trim(),
      tags: editedTags.split(',').map(tag => tag.trim()).filter(Boolean),
      color: editedColor,
      media,
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

  const handleGenerateAI = async (type: 'expand' | 'summarize' | 'related' | 'keypoints') => {
    if (!aiEnabled) {
      Alert.alert('AI Disabled', 'Please enable AI in settings and configure your OpenAI API key.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      let prompt = '';
      switch (type) {
        case 'expand':
          prompt = `Expand on this topic with more detailed information: "${editedTitle}". Current content: ${editedContent}`;
          break;
        case 'summarize':
          prompt = `Provide a concise summary of this content: ${editedContent}`;
          break;
        case 'related':
          prompt = `Suggest 3-5 related topics or concepts for: "${editedTitle}"`;
          break;
        case 'keypoints':
          prompt = `Extract the key points from this content: ${editedContent}`;
          break;
      }

      const aiContent = await onGenerateAI(prompt, node.id);
      
      if (type === 'expand') {
        setEditedContent(aiContent);
      } else {
        setEditedContent(editedContent + '\n\n' + aiContent);
      }
    } catch (error) {
      Alert.alert('AI Error', 'Failed to generate content. Please check your API key and try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddMedia = async (type: 'image' | 'document') => {
    try {
      if (type === 'image') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
          const newMedia: MediaAttachment = {
            id: Date.now().toString(),
            type: 'image',
            uri: result.assets[0].uri,
            name: result.assets[0].fileName || 'image.jpg',
            size: result.assets[0].fileSize,
          };
          setMedia([...media, newMedia]);
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets[0]) {
          const newMedia: MediaAttachment = {
            id: Date.now().toString(),
            type: 'document',
            uri: result.assets[0].uri,
            name: result.assets[0].name,
            size: result.assets[0].size,
          };
          setMedia([...media, newMedia]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add media attachment.');
    }
  };

  const removeMedia = (mediaId: string) => {
    setMedia(media.filter(m => m.id !== mediaId));
  };

  const colorOptions = [
    '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
    '#f97316', '#06b6d4', '#84cc16', '#6366f1', '#ec4899',
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: nodeColor }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <X size={24} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Knowledge Node</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.headerButton}
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
            {node.aiGenerated && (
              <View style={[styles.aiBadge, { backgroundColor: nodeColor }]}>
                <Sparkles size={12} color="#ffffff" />
              </View>
            )}
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
              
              <View style={styles.contentSection}>
                <View style={styles.contentHeader}>
                  <Text style={styles.sectionLabel}>Content</Text>
                  {aiEnabled && (
                    <View style={styles.aiButtons}>
                      <TouchableOpacity
                        style={[styles.aiButton, isGeneratingAI && styles.aiButtonDisabled]}
                        onPress={() => handleGenerateAI('expand')}
                        disabled={isGeneratingAI}
                      >
                        {isGeneratingAI ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Sparkles size={16} color="#ffffff" />
                        )}
                        <Text style={styles.aiButtonText}>Expand</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.aiButton, isGeneratingAI && styles.aiButtonDisabled]}
                        onPress={() => handleGenerateAI('keypoints')}
                        disabled={isGeneratingAI}
                      >
                        <Sparkles size={16} color="#ffffff" />
                        <Text style={styles.aiButtonText}>Key Points</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
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
              </View>

              <View style={styles.colorSection}>
                <Text style={styles.sectionLabel}>Color</Text>
                <View style={styles.colorPicker}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        editedColor === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => setEditedColor(color)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.mediaSection}>
                <Text style={styles.sectionLabel}>Media Attachments</Text>
                <View style={styles.mediaButtons}>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={() => handleAddMedia('image')}
                  >
                    <Image size={20} color="#3b82f6" />
                    <Text style={styles.mediaButtonText}>Add Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaButton}
                    onPress={() => handleAddMedia('document')}
                  >
                    <Paperclip size={20} color="#3b82f6" />
                    <Text style={styles.mediaButtonText}>Add File</Text>
                  </TouchableOpacity>
                </View>
                {media.length > 0 && (
                  <View style={styles.mediaList}>
                    {media.map(item => (
                      <View key={item.id} style={styles.mediaItem}>
                        <Text style={styles.mediaName}>{item.name}</Text>
                        <TouchableOpacity onPress={() => removeMedia(item.id)}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

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

              {node.media && node.media.length > 0 && (
                <View style={styles.mediaSection}>
                  <View style={styles.sectionHeader}>
                    <Paperclip size={16} color="#94a3b8" />
                    <Text style={styles.sectionTitle}>
                      {node.media.length} attachment{node.media.length > 1 ? 's' : ''}
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
              <Trash2 size={20} color="#ffffff" />
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
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  aiBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
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
  contentSection: {
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#e2e8f0',
  },
  aiButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  aiButtonDisabled: {
    backgroundColor: '#64748b',
  },
  aiButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  colorSection: {
    marginBottom: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#f8fafc',
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  mediaList: {
    marginTop: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  mediaName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    flex: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});