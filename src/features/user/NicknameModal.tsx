import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '@/src/shared/theme';
import { useUpdateNickname } from './api';

interface NicknameModalProps {
  visible: boolean;
  currentNickname?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NicknameModal({ visible, currentNickname, onClose, onSuccess }: NicknameModalProps) {
  const [nickname, setNickname] = useState(currentNickname ?? '');
  const { mutateAsync, isPending } = useUpdateNickname();

  useEffect(() => {
    if (visible) setNickname(currentNickname ?? '');
  }, [visible, currentNickname]);

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (trimmed.length === 0 || trimmed.length > 20) {
      Alert.alert('닉네임 오류', '닉네임은 1자 이상 20자 이하여야 합니다.');
      return;
    }
    try {
      await mutateAsync(trimmed);
      onSuccess?.();
      onClose();
    } catch (e) {
      Alert.alert('오류', (e as Error).message ?? '다시 시도해 주세요.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>닉네임 설정</Text>
          <Text style={styles.desc}>리뷰에 표시될 닉네임을 입력해 주세요.</Text>

          <TextInput
            style={styles.input}
            placeholder="닉네임 (1~20자)"
            placeholderTextColor={colors.text3}
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => { void handleSubmit(); }}
          />
          <Text style={styles.charCount}>{nickname.trim().length}/20</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isPending}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
              onPress={() => { void handleSubmit(); }}
              disabled={isPending}
            >
              <Text style={styles.submitBtnText}>{isPending ? '저장 중...' : '저장'}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '85%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.4,
  },
  desc: {
    fontSize: 13,
    color: colors.text2,
    lineHeight: 18,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text1,
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: colors.text3,
    textAlign: 'right',
    marginTop: -4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
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
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
