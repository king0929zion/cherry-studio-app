import { Container, HeaderBar, SafeAreaContainer } from '@/componentsV2'
import Text from '@/componentsV2/base/Text'
import TextField from '@/componentsV2/base/TextField'
import XStack from '@/componentsV2/layout/XStack'
import YStack from '@/componentsV2/layout/YStack'
import { ArrowLeft } from '@/componentsV2/icons'
import { useMcpServers } from '@/hooks/useMcp'
import { mcpService } from '@/services/McpService'
import { MCPServer, McpServerType } from '@/types/mcp'
import { uuid } from '@/utils'
import { Switch } from 'heroui-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'

interface FormState {
  name: string
  description: string
  baseUrl: string
  type: McpServerType
  headers: string
  timeout: string
  isActive: boolean
}

const TYPE_OPTIONS: { value: McpServerType; labelKey: string; descriptionKey: string }[] = [
  {
    value: 'streamableHttp',
    labelKey: 'mcp.editor.type.streamable_http',
    descriptionKey: 'mcp.editor.type.streamable_http_desc'
  },
  {
    value: 'sse',
    labelKey: 'mcp.editor.type.sse',
    descriptionKey: 'mcp.editor.type.sse_desc'
  }
]

function parseHeaders(raw: string): Record<string, string> | undefined {
  if (!raw || raw.trim().length === 0) {
    return undefined
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value)
        }
        return acc
      }, {})
    }
    throw new Error('Headers must be a JSON object')
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Invalid header JSON'
    )
  }
}

function serializeHeaders(headers?: Record<string, string>) {
  if (!headers) return ''
  try {
    return JSON.stringify(headers, null, 2)
  } catch {
    return ''
  }
}

function serializeTimeout(timeout?: number) {
  if (!timeout) return ''
  return String(timeout)
}

export function McpServerEditorScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { t } = useTranslation()
  const { mcpServers } = useMcpServers()
  const editingId = route.params?.serverId
  const editingServer = useMemo(
    () => (editingId ? mcpServers.find(server => server.id === editingId) : undefined),
    [mcpServers, editingId]
  )

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    baseUrl: '',
    type: 'streamableHttp',
    headers: '',
    timeout: '',
    isActive: true
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!editingServer) return

    setForm({
      name: editingServer.name || '',
      description: editingServer.description || '',
      baseUrl: editingServer.baseUrl || '',
      type: (editingServer.type as McpServerType) || 'streamableHttp',
      headers: serializeHeaders(editingServer.headers),
      timeout: serializeTimeout(editingServer.timeout),
      isActive: editingServer.isActive
    })
  }, [editingServer])

  const handleBack = () => {
    navigation.goBack()
  }

  const handleSelectType = (value: McpServerType) => {
    setForm(prev => ({ ...prev, type: value }))
  }

  const validate = () => {
    if (!form.name.trim()) {
      throw new Error(t('mcp.editor.validation.name_required'))
    }

    if (!form.baseUrl.trim()) {
      throw new Error(t('mcp.editor.validation.base_url_required'))
    }

    try {
      // eslint-disable-next-line no-new
      new URL(form.baseUrl.trim())
    } catch {
      throw new Error(t('mcp.editor.validation.base_url_invalid'))
    }

    if (form.timeout && Number.isNaN(Number(form.timeout))) {
      throw new Error(t('mcp.editor.validation.timeout_invalid'))
    }
  }

  const handleSave = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)
      validate()

      const headers = parseHeaders(form.headers)
      const timeout = form.timeout ? Number(form.timeout) : undefined

      if (editingServer) {
        await mcpService.updateMcpServer(editingServer.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          baseUrl: form.baseUrl.trim(),
          type: form.type,
          headers,
          timeout,
          isActive: form.isActive
        })
      } else {
        const newServer: MCPServer = {
          id: uuid(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          baseUrl: form.baseUrl.trim(),
          type: form.type,
          isActive: form.isActive,
          headers,
          timeout,
          disabledTools: []
        }
        await mcpService.createMcpServer(newServer)
      }

      navigation.goBack()
    } catch (error) {
      Alert.alert(t('common.error'), error instanceof Error ? error.message : String(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaContainer>
      <HeaderBar
        title={editingServer ? t('mcp.editor.title_edit') : t('mcp.editor.title_create')}
        leftButton={{
          icon: <ArrowLeft size={22} />,
          onPress: handleBack
        }}
        rightButton={{
          icon: (
            <Text
              className={`text-sm font-semibold ${
                isSaving
                  ? 'opacity-40 text-text-secondary dark:text-text-secondary-dark'
                  : 'text-green-100 dark:text-green-dark-100'
              }`}>
              {t('common.save')}
            </Text>
          ),
          onPress: handleSave
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Container className="gap-5">
          <YStack className="gap-3">
            <TextField className="gap-2">
              <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('common.name')}
              </TextField.Label>
              <TextField.Input
                className="h-11 rounded-xl px-3 text-sm"
                placeholder={t('mcp.editor.name_placeholder')}
                value={form.name}
                onChangeText={name => setForm(prev => ({ ...prev, name }))}
              />
            </TextField>

            <TextField className="gap-2">
              <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('common.description')}
              </TextField.Label>
              <TextField.Input
                className="h-24 rounded-xl px-3 py-3 text-sm"
                placeholder={t('mcp.editor.description_placeholder')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.description}
                onChangeText={description => setForm(prev => ({ ...prev, description }))}
              />
            </TextField>

            <TextField className="gap-2">
              <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('mcp.editor.base_url')}
              </TextField.Label>
              <TextField.Input
                className="h-11 rounded-xl px-3 text-sm"
                placeholder="https://your-server.example.com/mcp"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.baseUrl}
                onChangeText={baseUrl => setForm(prev => ({ ...prev, baseUrl }))}
              />
            </TextField>

            <YStack className="gap-2">
              <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('mcp.editor.type')}
              </Text>
              <XStack className="gap-2">
                {TYPE_OPTIONS.map(option => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelectType(option.value)}
                    className={`flex-1 rounded-xl border px-4 py-3 ${
                      form.type === option.value
                        ? 'border-green-20 bg-green-10 dark:border-green-dark-20 dark:bg-green-dark-10'
                        : 'border-transparent bg-ui-card-background dark:bg-ui-card-background-dark'
                    }`}>
                    <YStack className="gap-1">
                      <Text
                        className={`text-base font-medium ${
                          form.type === option.value
                            ? 'text-green-100 dark:text-green-dark-100'
                            : 'text-text-primary dark:text-text-primary-dark'
                        }`}>
                        {t(option.labelKey)}
                      </Text>
                      <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        {t(option.descriptionKey)}
                      </Text>
                    </YStack>
                  </Pressable>
                ))}
              </XStack>
            </YStack>

            <TextField className="gap-2">
              <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('mcp.editor.headers')}
              </TextField.Label>
              <TextField.Input
                className="h-28 rounded-xl px-3 py-3 text-sm"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder='{ "Authorization": "Bearer ..." }'
                autoCapitalize="none"
                autoCorrect={false}
                value={form.headers}
                onChangeText={headers => setForm(prev => ({ ...prev, headers }))}
              />
              <Text className="text-xs text-text-secondary dark:text-text-secondary-dark opacity-70">
                {t('mcp.editor.headers_hint')}
              </Text>
            </TextField>

            <TextField className="gap-2">
              <TextField.Label className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('mcp.editor.timeout')}
              </TextField.Label>
              <TextField.Input
                className="h-11 rounded-xl px-3 text-sm"
                placeholder={t('mcp.editor.timeout_placeholder')}
                keyboardType="numeric"
                value={form.timeout}
                onChangeText={timeout => setForm(prev => ({ ...prev, timeout }))}
              />
            </TextField>

            <XStack className="items-center justify-between py-2">
              <Text className="text-sm font-medium text-text-secondary dark:text-text-secondary">
                {t('mcp.editor.is_active')}
              </Text>
              <Switch
                color="success"
                isSelected={form.isActive}
                onSelectedChange={isActive => setForm(prev => ({ ...prev, isActive }))}
              >
                <Switch.Thumb colors={{ defaultBackground: 'white', selectedBackground: 'white' }} />
              </Switch>
            </XStack>
          </YStack>
        </Container>
      </ScrollView>
    </SafeAreaContainer>
  )
}

export default McpServerEditorScreen
