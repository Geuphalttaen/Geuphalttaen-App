import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const kakaoAppKey = process.env.KAKAO_APP_KEY ?? '';
  if (!kakaoAppKey) {
    console.warn('⚠️  KAKAO_APP_KEY 가 설정되지 않았습니다. .env.local 에 추가 후 npx expo prebuild 를 다시 실행하세요.');
  }

  return {
    ...config,
    name: '급할땐',
    slug: 'geuphalttaen',
    plugins: [
      [
        '@react-native-seoul/kakao-login',
        {
          kakaoAppKey,
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
          cameraPermission: '사진을 촬영하려면 카메라 접근 권한이 필요합니다.',
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
  };
};
