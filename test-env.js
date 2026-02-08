console.log('process.env.EXPO_OS:', process.env.EXPO_OS);
process.env.EXPO_OS = 'web';
console.log('After setting to web:', process.env.EXPO_OS);
process.env.EXPO_OS = 'ios';
console.log('After setting to ios:', process.env.EXPO_OS);
