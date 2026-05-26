import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/src/shared/theme';

function KakaoMark({ size = 21 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.477 2 2 5.925 2 10.76c0 3.026 1.864 5.683 4.69 7.228L5.5 22l3.75-2.01c.886.157 1.79.24 2.75.24 5.523 0 10-3.924 10-8.76C22 5.925 17.523 2 12 2z"
        fill="rgba(25,12,0,0.88)"
      />
    </Svg>
  );
}

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export default function KakaoLoginButton({ onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="카카오로 시작하기"
    >
      <View style={styles.iconWrap}>
        <KakaoMark size={21} />
      </View>
      <Text style={styles.text}>카카오로 시작하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.kakao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  iconWrap: {
    position: 'absolute',
    left: 22,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.kakaoText,
    letterSpacing: -0.3,
  },
});
