import React from 'react'
import { TouchableOpacityProps } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Pressable } from 'react-native'
import XStack from '../XStack'
import { withSpringConfig, ScaleConfig } from '@/config/animations'

export interface PressableRowProps extends TouchableOpacityProps {
  className?: string
  disableAnimation?: boolean
}

const PressableRow: React.FC<PressableRowProps> = ({ className, children, disableAnimation = false, ...props }) => {
  const scale = useSharedValue(ScaleConfig.normal)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (!disableAnimation) {
      scale.value = withSpring(ScaleConfig.press, withSpringConfig.press)
    }
  }

  const handlePressOut = () => {
    if (!disableAnimation) {
      scale.value = withSpring(ScaleConfig.normal, withSpringConfig.press)
    }
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={props.onPress}
      disabled={props.disabled}
      {...props}>
      <Animated.View style={disableAnimation ? undefined : animatedStyle}>
        <XStack className={`justify-between items-center py-[14px] px-4 ${className || ''}`}>{children}</XStack>
      </Animated.View>
    </Pressable>
  )
}

export default PressableRow
