import React, { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Container, HeaderBar, PressableRow, SafeAreaContainer, Text, XStack, YStack } from '@/componentsV2'
import { usePreference } from '@/hooks/usePreference'
import type { ModelDisplayMode } from '@/shared/data/preference/preferenceTypes'

interface ModelDisplayOption {
  value: ModelDisplayMode
  label: string
}

export default function ModelDisplaySettingsScreen() {
  const { t } = useTranslation()
  const [modelDisplayMode, setModelDisplayMode] = usePreference('ui.model_display_mode')

  const modelDisplayOptions: ModelDisplayOption[] = useMemo(() => [
    {
      value: 'full',
      label: 'settings.general.model_display.full'
    },
    {
      value: 'icon',
      label: 'settings.general.model_display.icon'
    }
  ], [])

  const handleOptionPress = useCallback((value: ModelDisplayMode) => {
    setModelDisplayMode(value).catch(console.error)
  }, [setModelDisplayMode])

  return (
    <SafeAreaContainer className="flex-1">
      <HeaderBar title={t('settings.general.model_display.title')} />
      <Container>
        <YStack className="flex-1 gap-3 px-4">
          {modelDisplayOptions.map(opt => (
            <PressableRow
              key={opt.value}
              onPress={() => handleOptionPress(opt.value)}
              className="bg-ui-card-background dark:bg-ui-card-background-dark p-4 rounded-xl">
              <XStack className="items-center">
                <Text className="text-base">{t(opt.label)}</Text>
              </XStack>

              <XStack
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  modelDisplayMode === opt.value
                    ? 'border-gray-900 dark:border-gray-100'
                    : 'border-gray-400 dark:border-gray-600'
                }`}>
                {modelDisplayMode === opt.value && (
                  <XStack className="w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-gray-100" />
                )}
              </XStack>
            </PressableRow>
          ))}
        </YStack>
      </Container>
    </SafeAreaContainer>
  )
}
