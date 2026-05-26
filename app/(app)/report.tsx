// 화장실 제보 화면 — 인증 가드 포함
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Redirect, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/src/features/auth/store';
import { submitToiletReport, uploadToiletImage } from '@/src/features/toilets/api';
import { useLocation } from '@/src/features/map/hooks/useLocation';
import { colors } from '@/src/shared/theme';
import ImagePickerModal from '@/src/shared/components/ImagePickerModal';

type UploadedImage = { localUri: string; url: string; originalUrl: string };
type ToiletType = 'PUBLIC' | 'CONVENIENCE_STORE' | 'CAFE' | 'OTHER';
const TOILET_TYPE_LABELS: Record<ToiletType, string> = {
  PUBLIC: '공공',
  CONVENIENCE_STORE: '편의점',
  CAFE: '카페',
  OTHER: '기타',
};

interface FacilityState {
  male: boolean;
  female: boolean;
  disabled: boolean;
  familyRoom: boolean;
}

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

function FieldLabel({ children, required, hint }: FieldLabelProps) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>
        {children}
        {required && <Text style={styles.fieldLabelRequired}> *</Text>}
      </Text>
      {hint && <Text style={styles.fieldLabelHint}>{hint}</Text>}
    </View>
  );
}

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function CheckboxItem({ label, checked, onToggle }: CheckboxItemProps) {
  return (
    <TouchableOpacity
      style={[styles.checkboxItem, checked && styles.checkboxItemChecked]}
      onPress={onToggle}
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked && <Text style={styles.checkboxMark}>✓</Text>}
      </View>
      <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  // 위치 픽커에서 넘어온 좌표 파라미터
  const { pickedLat, pickedLng, pickedAddress } = useLocalSearchParams<{ pickedLat?: string; pickedLng?: string; pickedAddress?: string }>();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [toiletType, setToiletType] = useState<ToiletType>('PUBLIC');
  const [facilities, setFacilities] = useState<FacilityState>({
    male: false,
    female: false,
    disabled: false,
    familyRoom: false,
  });
  const [memo, setMemo] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  // 지도에서 선택한 위치 (없으면 GPS 사용)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { lat, lng } = useLocation();

  // 픽커 파라미터가 유효하면 위치·주소 업데이트
  useEffect(() => {
    if (pickedLat && pickedLng) {
      const parsedLat = parseFloat(pickedLat);
      const parsedLng = parseFloat(pickedLng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setPickedLocation({ lat: parsedLat, lng: parsedLng });
        if (pickedAddress) {
          setAddress(pickedAddress);
        }
      }
    }
  }, [pickedLat, pickedLng, pickedAddress]);

  // 제출에 사용할 최종 좌표: 지도 선택 우선, 없으면 GPS
  const submitLat = pickedLocation?.lat ?? lat;
  const submitLng = pickedLocation?.lng ?? lng;

  const mutation = useMutation({
    mutationFn: submitToiletReport,
    onSuccess: () => {
      Alert.alert('제보 완료', '화장실 제보가 접수되었습니다.\n관리자 검토 후 노출됩니다.', [
        { text: '확인', onPress: () => router.replace('/(app)') },
      ]);
    },
    onError: (err: Error) => {
      Alert.alert('제보 실패', err.message ?? '다시 시도해 주세요');
    },
  });

  const toggleFacility = useCallback((key: keyof FacilityState) => {
    setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Low-1: 모든 deps(setPickerModalVisible, setUploadingCount, setUploadedImages)가 useState setter로 항상 안정(stable)하므로 deps 배열 생략 안전
  const launchPicker = useCallback(async (useCamera: boolean) => {
    setPickerModalVisible(false);
    // 모달 슬라이드 다운 애니메이션(~300ms) 완료 후 시스템 다이얼로그 호출
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 촬영을 위해 카메라 접근을 허용해 주세요.');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 첨부를 위해 사진 라이브러리 접근을 허용해 주세요.');
        return;
      }
    }
    let result;
    try {
      result = useCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7, allowsEditing: false });
    } catch {
      Alert.alert('카메라 오류', '카메라를 사용할 수 없습니다. 실기기에서 시도해 주세요.');
      return;
    }
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    // Low-2: fileSize 미제공(일부 Android) 시 스킵 → 서버 20MB 제한이 최종 방어선
    if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
      Alert.alert('파일 크기 초과', '10MB 이하의 사진을 선택해 주세요.');
      return;
    }
    setUploadingCount((c) => c + 1);
    try {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const uploaded = await uploadToiletImage(asset.uri, mimeType);
      setUploadedImages((prev) => [...prev, { localUri: asset.uri, ...uploaded }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '사진 업로드에 실패했습니다.';
      Alert.alert('업로드 실패', message);
    } finally {
      setUploadingCount((c) => c - 1);
    }
  }, []);

  const handleAddImage = useCallback(() => {
    if (uploadingCount > 0) return;
    setPickerModalVisible(true);
  }, [uploadingCount]);

  const removeImage = useCallback((localUri: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.localUri !== localUri));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '화장실 이름을 입력해 주세요');
      return;
    }
    if (!address.trim()) {
      Alert.alert('위치 선택 필요', '지도에서 위치를 선택해 주세요');
      return;
    }
    if (submitLat === null || submitLng === null) {
      Alert.alert('위치 오류', '위치를 가져올 수 없습니다. 지도에서 직접 선택하거나 위치 권한을 허용해 주세요.');
      return;
    }

    mutation.mutate({
      name: name.trim(),
      address: address.trim(),
      toiletType,
      lat: submitLat,
      lng: submitLng,
      male: facilities.male,
      female: facilities.female,
      disabled: facilities.disabled,
      familyRoom: facilities.familyRoom,
      memo: memo.trim() || undefined,
      images: uploadedImages.map(({ url, originalUrl }) => ({ url, originalUrl })),
    });
  }, [name, address, toiletType, facilities, memo, mutation, submitLat, submitLng, uploadedImages]);

  const isSubmitting = mutation.isPending || uploadingCount > 0;

  // B4/C2: 비로그인 사용자는 로그인 화면으로 리다이렉트 (모든 훅 호출 후 조건부 반환)
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBadge}>NEW</Text>
          <Text style={styles.headerTitle}>화장실 위치 제보</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          accessibilityLabel="닫기"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 폼 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 화장실 이름 */}
        <View style={styles.fieldGroup}>
          <FieldLabel required>화장실 이름</FieldLabel>
          <TextInput
            style={[styles.textInput, name.length > 0 && styles.textInputFilled]}
            placeholder="예) 서울숲공원 공중화장실"
            placeholderTextColor={colors.text3}
            value={name}
            onChangeText={setName}
            maxLength={50}
            returnKeyType="next"
            accessibilityLabel="화장실 이름 입력"
          />
        </View>

        {/* 주소 — 핀으로 자동 입력, 직접 수정 불가 */}
        <View style={styles.fieldGroup}>
          <FieldLabel required>주소</FieldLabel>
          <View style={styles.addressRow}>
            <TextInput
              style={[styles.textInput, styles.textInputDisabled, styles.addressInput, address.length > 0 && styles.textInputFilled]}
              placeholder="지도에서 핀 선택 시 자동 입력"
              placeholderTextColor={colors.text3}
              value={address}
              editable={false}
              accessibilityLabel="주소 (자동 입력)"
            />
            <TouchableOpacity
              style={styles.addressPickBtn}
              onPress={() => router.push('/(app)/location-picker')}
              accessibilityLabel="지도에서 위치 선택"
            >
              <Text style={styles.addressPickBtnText}>지도 선택</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 유형 */}
        <View style={styles.fieldGroup}>
          <FieldLabel required>유형</FieldLabel>
          <View style={styles.segmentedControl}>
            {(Object.keys(TOILET_TYPE_LABELS) as ToiletType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.segmentBtn, toiletType === type && styles.segmentBtnActive]}
                onPress={() => setToiletType(type)}
                accessibilityLabel={TOILET_TYPE_LABELS[type]}
                accessibilityRole="radio"
                accessibilityState={{ selected: toiletType === type }}
              >
                <Text
                  style={[styles.segmentBtnText, toiletType === type && styles.segmentBtnTextActive]}
                >
                  {TOILET_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 이용 가능 시설 */}
        <View style={styles.fieldGroup}>
          <FieldLabel>이용 가능 시설</FieldLabel>
          <View style={styles.checkboxGrid}>
            <CheckboxItem
              label="남성용"
              checked={facilities.male}
              onToggle={() => toggleFacility('male')}
            />
            <CheckboxItem
              label="여성용"
              checked={facilities.female}
              onToggle={() => toggleFacility('female')}
            />
            <CheckboxItem
              label="장애인용"
              checked={facilities.disabled}
              onToggle={() => toggleFacility('disabled')}
            />
            <CheckboxItem
              label="수유실"
              checked={facilities.familyRoom}
              onToggle={() => toggleFacility('familyRoom')}
            />
          </View>
        </View>

        {/* 사진 첨부 */}
        <View style={styles.fieldGroup}>
          <FieldLabel hint="최대 3장">사진 첨부</FieldLabel>
          <View style={styles.photoRow}>
            {uploadedImages.map((img) => (
              <View key={img.localUri} style={styles.photoThumb}>
                <Image source={{ uri: img.localUri }} style={styles.photoThumbImg} />
                <TouchableOpacity
                  style={styles.photoRemoveBtn}
                  onPress={() => removeImage(img.localUri)}
                  accessibilityLabel="사진 제거"
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {uploadingCount > 0 && (
              <View style={[styles.photoPlaceholder, styles.photoUploading]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {uploadedImages.length < 3 && uploadingCount === 0 && (
              <TouchableOpacity
                style={styles.photoPlaceholder}
                onPress={handleAddImage}
                accessibilityLabel="사진 추가"
              >
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoCount}>{uploadedImages.length} / 3</Text>
              </TouchableOpacity>
            )}
            {uploadedImages.length === 0 && (
              <View style={styles.photoHint}>
                <Text style={styles.photoHintText}>
                  입구가 잘 보이는 사진을 첨부해 주세요. 다른 사람의 식별 가능한 얼굴이 포함된 사진은 제외됩니다.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 메모 */}
        <View style={styles.fieldGroup}>
          <FieldLabel>메모</FieldLabel>
          <View style={styles.memoContainer}>
            <TextInput
              style={styles.memoInput}
              placeholder="예) 가게 이용 손님만 사용 가능, 평일 11–22시 운영"
              placeholderTextColor={colors.text3}
              value={memo}
              onChangeText={setMemo}
              maxLength={200}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="메모 입력"
            />
            <Text style={styles.memoCounter}>{memo.length} / 200</Text>
          </View>
        </View>
      </ScrollView>

      <ImagePickerModal
        visible={pickerModalVisible}
        onCamera={() => launchPicker(true)}
        onLibrary={() => launchPicker(false)}
        onClose={() => setPickerModalVisible(false)}
      />

      {/* 하단 CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityLabel="제보 제출하기"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>제보 제출하기 ↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.text1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 18,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    letterSpacing: -0.1,
  },
  fieldLabelRequired: {
    color: colors.danger,
  },
  fieldLabelHint: {
    fontSize: 11,
    color: colors.text3,
    fontWeight: '500',
    marginLeft: 4,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text1,
    letterSpacing: -0.3,
  },
  textInputFilled: {
    borderColor: colors.text1,
    fontWeight: '600',
  },
  textInputDisabled: {
    backgroundColor: colors.surface2,
    color: colors.text2,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  segmentBtn: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text2,
    letterSpacing: -0.2,
  },
  segmentBtnTextActive: {
    fontWeight: '700',
    color: colors.text1,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    width: '47%',
  },
  checkboxItemChecked: {
    backgroundColor: colors.primary08,
    borderColor: colors.primary,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '700',
    lineHeight: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text1,
    letterSpacing: -0.2,
  },
  checkboxLabelChecked: {
    fontWeight: '700',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  photoIcon: {
    fontSize: 22,
  },
  photoCount: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text3,
  },
  photoHint: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  photoHintText: {
    fontSize: 12,
    color: colors.text2,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  memoContainer: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    position: 'relative',
  },
  memoInput: {
    fontSize: 14,
    color: colors.text1,
    letterSpacing: -0.2,
    lineHeight: 21,
    minHeight: 80,
    padding: 0,
  },
  memoCounter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 11,
    color: colors.text3,
    fontWeight: '600',
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressInput: {
    flex: 1,
  },
  addressPickBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addressPickBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.2,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  photoThumbImg: {
    width: 80,
    height: 80,
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  photoUploading: {
    borderStyle: 'solid',
  },
});
