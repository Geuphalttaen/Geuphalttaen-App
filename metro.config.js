const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// pnpm 가상 스토어 심볼릭 링크 해석 지원
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  ...(config.watchFolders ?? []),
];

module.exports = config;
