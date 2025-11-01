const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('sql')

// 添加对 @cherrystudio/ai-core 的支持
config.resolver.resolverMainFields = ['react-native', 'browser', 'main']
config.resolver.platforms = ['ios', 'android', 'native', 'web']

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  eventsource: path.join(__dirname, 'src/polyfills/eventsource.ts')
}

module.exports = withNativeWind(config, { input: './global.css' })
