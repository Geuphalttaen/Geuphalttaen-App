// 앱 레이아웃 (인증된 사용자용 기본 스택)
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="toilet/[id]" />
      <Stack.Screen name="report" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
