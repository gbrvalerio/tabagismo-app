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

module.exports = config;
