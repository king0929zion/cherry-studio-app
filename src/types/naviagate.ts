import { DrawerNavigationProp } from '@react-navigation/drawer'
import type { NavigatorScreenParams } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { AssistantStackParamList } from '@/navigators/AssistantStackNavigator'
import { HomeStackParamList } from '@/navigators/HomeStackNavigator'
import { AboutStackParamList } from '@/navigators/settings/AboutStackNavigator'
import { DataSourcesStackParamList } from '@/navigators/settings/DataSourcesStackNavigator'
import { GeneralSettingsStackParamList } from '@/navigators/settings/GeneralSettingsStackNavigator'
import { ProvidersStackParamList } from '@/navigators/settings/ProvidersStackNavigator'
import { WebSearchStackParamList } from '@/navigators/settings/WebSearchStackNavigator'
import { SettingsStackParamList } from '@/navigators/SettingsStackNavigator'
import { McpStackParamList } from '@/navigators/McpStackNavigator'
import { WelcomeStackParamList } from '@/navigators/WelcomeStackNavigator'

// App Drawer Navigator
export type AppDrawerParamList = {
  Home:
    | { screen: 'ChatScreen'; params: { topicId: string } }
    | { screen: 'TopicScreen' }
    | { screen: 'SettingsScreen' }
    | { screen: 'GeneralSettings'; params?: any }
    | { screen: 'AssistantSettings'; params?: any }
    | { screen: 'ProvidersSettings'; params?: any }
    | { screen: 'DataSourcesSettings'; params?: any }
    | { screen: 'WebSearchSettings'; params?: any }
    | { screen: 'AboutSettings'; params?: any }
    | undefined
  Assistant:
    | { screen: 'AssistantScreen' }
    | { screen: 'AssistantMarketScreen' }
    | { screen: 'AssistantDetailScreen'; params: { assistantId: string; tab?: string } }
    | undefined
  Mcp:
    | { screen: 'McpMarketScreen' }
    | { screen: 'McpServerEditorScreen'; params?: { serverId?: string } }
}

// Root Stack Navigator (MainStackNavigator)
export type RootStackParamList = {
  Welcome: NavigatorScreenParams<WelcomeStackParamList> | undefined
  HomeScreen: NavigatorScreenParams<AppDrawerParamList> | undefined
}

// Navigation Props
export type RootNavigationProps = StackNavigationProp<RootStackParamList>
export type DrawerNavigationProps = DrawerNavigationProp<AppDrawerParamList>

// Nested Navigator Props
export type HomeNavigationProps = StackNavigationProp<HomeStackParamList>
export type AssistantNavigationProps = StackNavigationProp<AssistantStackParamList>
export type McpNavigationProps = StackNavigationProp<McpStackParamList>
export type SettingsNavigationProps = StackNavigationProp<SettingsStackParamList>
export type WelcomeNavigationProps = StackNavigationProp<WelcomeStackParamList>

// Settings Sub-Navigator Props
export type GeneralSettingsNavigationProps = StackNavigationProp<GeneralSettingsStackParamList>
export type ProvidersNavigationProps = StackNavigationProp<ProvidersStackParamList>
export type DataSourcesNavigationProps = StackNavigationProp<DataSourcesStackParamList>
export type WebSearchNavigationProps = StackNavigationProp<WebSearchStackParamList>
export type AboutNavigationProps = StackNavigationProp<AboutStackParamList>

// Legacy compatibility
export type NavigationProps = RootNavigationProps
