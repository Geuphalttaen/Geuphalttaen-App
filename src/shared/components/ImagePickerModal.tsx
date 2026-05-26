import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/shared/theme';

interface Props {
  visible: boolean;
  onCamera: () => void;
  onLibrary: () => void;
  onClose: () => void;
}

export default function ImagePickerModal({ visible, onCamera, onLibrary, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>사진 첨부</Text>
          <TouchableOpacity
            style={styles.option}
            onPress={onCamera}
            activeOpacity={0.7}
            accessibilityLabel="카메라로 촬영"
          >
            <View style={styles.iconBox}>
              <Text style={styles.optionIcon}>📷</Text>
            </View>
            <Text style={styles.optionText}>카메라</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.option}
            onPress={onLibrary}
            activeOpacity={0.7}
            accessibilityLabel="앨범에서 사진 선택"
          >
            <View style={styles.iconBox}>
              <Text style={styles.optionIcon}>🖼</Text>
            </View>
            <Text style={styles.optionText}>앨범에서 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="취소"
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  cancelBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text2,
  },
});
