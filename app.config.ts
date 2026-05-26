import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '급할땐',
  slug: 'geuphalttaen',
  plugins: [
    [
      '@react-native-seoul/kakao-login',
      {
        kakaoAppKey: process.env.KAKAO_APP_KEY ?? '',
      },
    ],
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: process.env.NAVER_MAP_CLIENT_ID ?? '',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: '사진을 첨부하려면 사진 라이브러리 접근 권한이 필요합니다.',
      },
    ],
    'expo-web-browser',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0B0D12',
        resizeMode: 'contain',
        image: './assets/splash-icon.png',
      },
    ],
  ],
});
