import { McpMarketScreen } from '@/screens/mcp/McpMarketScreen'
import McpServerEditorScreen from '@/screens/mcp/McpServerEditorScreen'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import React from 'react'

export type McpStackParamList = {
  McpMarketScreen: undefined
  McpServerEditorScreen: { serverId?: string } | undefined
}

const Stack = createStackNavigator<McpStackParamList>()

export default function McpStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureResponseDistance: 9999,
        ...TransitionPresets.SlideFromRightIOS
      }}>
      <Stack.Screen name="McpMarketScreen" component={McpMarketScreen} />
      <Stack.Screen name="McpServerEditorScreen" component={McpServerEditorScreen} />
    </Stack.Navigator>
  )
}
