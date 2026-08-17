const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .tflite extension ကို Metro Bundler မှ Asset အဖြစ် လက်ခံနိုင်ရန် ထည့်သွင်းခြင်း
config.resolver.assetExts.push('tflite');

module.exports = config;