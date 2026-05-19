// 시설 아이콘 컴포넌트 — 남/여/장애인/수유실/가족
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { colors } from '@/src/shared/theme';

type FacilityType = 'male' | 'female' | 'disabled' | 'familyRoom';

interface FacilityIconProps {
  type: FacilityType;
  available?: boolean;
  size?: number;
}

const ICON_SIZE = 20;

function MaleIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Circle cx="12" cy="4.5" r="2.2" fill={color} />
      <Path d="M9.2 8h5.6l1.4 6h-2v6h-4.4v-6h-2z" fill={color} />
    </Svg>
  );
}

function FemaleIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Circle cx="12" cy="4.5" r="2.2" fill={color} />
      <Path d="M9 8h6l1.6 5.5-2.4.4L13 19h-2v3h-2v-3H7l.8-5.1-2.4-.4z" fill={color} />
    </Svg>
  );
}

function DisabledIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Circle cx="11" cy="4" r="2" fill={color} />
      <Path d="M11 7c-1.5 0-2.5 1-2.5 2.5V14h4l1.5 4.5h2.2L14.5 13H11v-2h3.5V9.2H11z" fill={color} />
      <Circle cx="11" cy="17.5" r="4.5" stroke={color} strokeWidth="1.6" fill="none" />
    </Svg>
  );
}

function FamilyIcon({ color }: { color: string }) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
      <Circle cx="7.5" cy="5" r="1.8" fill={color} />
      <Circle cx="16.5" cy="5" r="1.8" fill={color} />
      <Path d="M5 11c0-1.5 1-2.5 2.5-2.5S10 9.5 10 11v3H8.5v6h-2v-6H5z" fill={color} />
      <Path d="M14 11c0-1.5 1-2.5 2.5-2.5S19 9.5 19 11v3h-1.5v6h-2v-6H14z" fill={color} />
      <Circle cx="12" cy="13" r="1.2" fill={color} />
      <Path d="M11 14h2v4h-2z" fill={color} />
    </Svg>
  );
}

const iconMap: Record<FacilityType, React.FC<{ color: string }>> = {
  male: MaleIcon,
  female: FemaleIcon,
  disabled: DisabledIcon,
  familyRoom: FamilyIcon,
};

export function FacilityIcon({ type, available = true, size = 28 }: FacilityIconProps) {
  const IconComponent = iconMap[type];
  const iconColor = available ? colors.primary : colors.text3;
  const bgColor = available ? colors.primary12 : colors.surface2;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.29, backgroundColor: bgColor }]}>
      <IconComponent color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
