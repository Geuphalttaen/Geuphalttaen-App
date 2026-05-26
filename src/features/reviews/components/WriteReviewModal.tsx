// 리뷰 작성 모달 — 별점 + 텍스트 + 청결도
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '@/src/shared/theme';
import { useWriteReview } from '@/src/features/reviews/hooks/useWriteReview';
import { StarRating } from './StarRating';

interface WriteReviewModalProps {
  visible: boolean;
  toiletId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function WriteReviewModal({ visible, toiletId, onClose, onSuccess }: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [cleanlinessScore, setCleanlinessScore] = useState(0);

  const { mutateAsync, isPending } = useWriteReview(toiletId);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('별점을 선택해 주세요');
      return;
    }
    try {
      await mutateAsync({
        rating,
        content: content.trim() || undefined,
        cleanlinessScore: cleanlinessScore > 0 ? cleanlinessScore : undefined,
      });
      setRating(0);
      setContent('');
      setCleanlinessScore(0);
      onSuccess();
    } catch {
      Alert.alert('오류', '리뷰 작성에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent('');
    setCleanlinessScore(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.title}>리뷰 작성</Text>

          {/* 별점 */}
          <View style={styles.field}>
            <Text style={styles.label}>전체 평점</Text>
            <StarRating value={rating} onChange={setRating} size={36} />
          </View>

          {/* 청결도 */}
          <View style={styles.field}>
            <Text style={styles.label}>청결도 (선택)</Text>
            <StarRating value={cleanlinessScore} onChange={setCleanlinessScore} size={28} />
          </View>

          {/* 내용 */}
          <View style={styles.field}>
            <Text style={styles.label}>내용 (선택, 최대 200자)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="이 화장실에 대한 의견을 남겨보세요"
              placeholderTextColor={colors.text3}
              value={content}
              onChangeText={setContent}
              maxLength={200}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/200</Text>
          </View>

          {/* 버튼 */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isPending}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>등록</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.4,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text2,
    letterSpacing: -0.2,
  },
  textInput: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text1,
    backgroundColor: colors.surface,
  },
  charCount: {
    fontSize: 11,
    color: colors.text3,
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text2,
  },
  submitBtn: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
