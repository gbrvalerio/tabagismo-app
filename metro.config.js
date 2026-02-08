const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files from Metro bundler
config.resolver.blockList = [
  // Test files
  /.*\.test\.[jt]sx?$/,
  /.*\.spec\.[jt]sx?$/,
  // Test utilities and setup
  /.*test-utils\.[jt]sx?$/,
  /.*jest\.config\.js$/,
  /.*jest\.setup\.js$/,
  /.*\.setup\.[jt]sx?$/,
];

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
