import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, SafeAreaView, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native'
import CodeHighlighter from 'react-native-code-highlighter'
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { WebView } from 'react-native-webview'

import { IconButton, Image, Text, XStack } from '@/componentsV2'
import { Copy, Eye, X } from '@/componentsV2/icons/LucideIcon'
import { getCodeLanguageIcon } from '@/utils/icons/codeLanguage'
import { markdownColors } from '../MarkdownStyles'

interface MarkdownCodeProps {
  text: string
  language?: string
  isDark: boolean
  onCopy: (content: string) => void
  containerStyle?: ViewStyle
  textStyle?: TextStyle
}

export const MarkdownCode: React.FC<MarkdownCodeProps> = ({
  text,
  language = 'text',
  isDark,
  onCopy,
  containerStyle,
  textStyle
}) => {
  const currentColors = isDark ? markdownColors.dark : markdownColors.light
  const lang = language || 'text'
  const [isPreviewVisible, setPreviewVisible] = useState(false)
  const { t } = useTranslation()

  const isHtmlPreviewEnabled = useMemo(() => {
    const normalized = lang.toLowerCase()
    return normalized === 'html' || normalized === 'htm'
  }, [lang])

  const handleOpenPreview = () => {
    setPreviewVisible(true)
  }

  const handleClosePreview = () => {
    setPreviewVisible(false)
  }

  return (
    <>
      <View className="gap-2 px-3 pt-0 pb-3 rounded-3 mt-2" style={containerStyle}>
        <XStack className="py-2 justify-between items-center border-b" style={{ borderColor: currentColors.codeBorder }}>
          <XStack className="gap-2 flex-1 items-center">
            {getCodeLanguageIcon(lang) && <Image source={getCodeLanguageIcon(lang)} className="w-5 h-5" />}
            <Text className="text-base">{lang.toUpperCase()}</Text>
          </XStack>
          <XStack className="gap-2 items-center">
            {isHtmlPreviewEnabled && <IconButton icon={<Eye size={16} color="$gray60" />} onPress={handleOpenPreview} />}
            <IconButton icon={<Copy size={16} color="$gray60" />} onPress={() => onCopy(text)} />
          </XStack>
        </XStack>
        <CodeHighlighter
          customStyle={{ backgroundColor: 'transparent' }}
          scrollViewProps={{
            contentContainerStyle: {
              backgroundColor: 'transparent'
            },
            showsHorizontalScrollIndicator: false
          }}
          textStyle={{
            ...textStyle,
            fontSize: 12,
            fontFamily: 'JetbrainMono',
            userSelect: 'none'
          }}
          hljsStyle={isDark ? atomOneDark : atomOneLight}
          language={lang}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={{ style: { flexWrap: 'wrap' } }}>
          {text}
        </CodeHighlighter>
      </View>

      {isHtmlPreviewEnabled && (
        <Modal visible={isPreviewVisible} animationType="fade" onRequestClose={handleClosePreview}>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: isDark ? '#000000' : '#ffffff'
            }}>
            <XStack
              className="items-center justify-between px-4 py-3"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
              }}>
              <Text className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                {t('common.preview')}
              </Text>
              <TouchableOpacity onPress={handleClosePreview} hitSlop={10}>
                <X size={22} className="text-text-primary dark:text-text-primary-dark" />
              </TouchableOpacity>
            </XStack>
            <WebView
              originWhitelist={['*']}
              source={{
                html: text,
                baseUrl: 'https://localhost'
              }}
              style={{ flex: 1 }}
              startInLoadingState
            />
          </SafeAreaView>
        </Modal>
      )}
    </>
  )
}

export default MarkdownCode
