// 지도 마커 컴포넌트 — react-native-maps Marker
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '../theme/colors';

export type MarkerStatus = 'open' | 'busy' | 'closed';

interface ToiletMarkerProps {
  id: number;
  lat: number;
  lng: number;
  status: MarkerStatus;
  selected?: boolean;
  onPress: (id: number) => void;
}

const STATUS_COLOR: Record<MarkerStatus, string> = {
  open: colors.success,
  busy: colors.warning,
  closed: colors.danger,
};

export function ToiletMarker({ id, lat, lng, status, selected = false, onPress }: ToiletMarkerProps) {
  const pinColor = STATUS_COLOR[status];
  const size = selected ? 52 : 40;

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={() => onPress(id)}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
    >
      <View style={[styles.pinContainer, { width: size, height: size * 1.25 }]}>
        {/* 핀 본체 */}
        <View style={[styles.pinBody, { backgroundColor: pinColor, width: size, height: size }]}>
          <View style={styles.pinInner}>
            <Text style={[styles.pinText, { color: pinColor, fontSize: size * 0.25 }]}>WC</Text>
          </View>
        </View>
        {/* 핀 꼬리 */}
        <View style={[styles.pinTail, { borderTopColor: pinColor, borderTopWidth: size * 0.3, borderLeftWidth: size * 0.18, borderRightWidth: size * 0.18 }]} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  pinBody: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInner: {
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: {
    fontWeight: '800',
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
