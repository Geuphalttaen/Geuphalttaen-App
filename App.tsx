// 앱 진입점 — React Navigation + QueryClientProvider + SafeAreaProvider
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import ReportScreen from './src/screens/ReportScreen';
import { useAuthStore } from './src/store/authStore';

// 네비게이션 스택 파라미터 타입 정의
export type RootStackParamList = {
  Map: undefined;
  List: undefined;
  Detail: { toiletId: number };
  Auth: undefined;
  Report: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function Navigation() {
  const { isAuthenticated, hydrate } = useAuthStore();

  // 앱 시작 시 SecureStore에서 토큰 상태 복원
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Map' : 'Map'}
        screenOptions={{ headerShown: false }}
      >
        {/* 메인 스택 */}
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        {/* 인증 스택 */}
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        {/* 제보 스택 (로그인 필요) */}
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
