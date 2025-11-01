import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import React from 'react'

import GeneralSettingsScreen from '@/screens/settings/general/GeneralSettingsScreen'
import LanguageChangeScreen from '@/screens/settings/general/LanguageChangeScreen'
import ModelDisplaySettingsScreen from '@/screens/settings/general/ModelDisplaySettingsScreen'
import ThemeSettingsScreen from '@/screens/settings/general/ThemeSettingsScreen'

export type GeneralSettingsStackParamList = {
  GeneralSettingsScreen: undefined
  ThemeSettingsScreen: undefined
  ModelDisplaySettingsScreen: undefined
  LanguageChangeScreen: undefined
}

const Stack = createStackNavigator<GeneralSettingsStackParamList>()

export default function GeneralSettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureResponseDistance: 9999,
        ...TransitionPresets.SlideFromRightIOS
      }}>
      <Stack.Screen name="GeneralSettingsScreen" component={GeneralSettingsScreen} />
      <Stack.Screen name="ThemeSettingsScreen" component={ThemeSettingsScreen} />
      <Stack.Screen name="ModelDisplaySettingsScreen" component={ModelDisplaySettingsScreen} />
      <Stack.Screen name="LanguageChangeScreen" component={LanguageChangeScreen} />
    </Stack.Navigator>
  )
}
