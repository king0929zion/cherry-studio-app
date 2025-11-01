import React, { useCallback } from 'react'
import { Pressable, PressableProps, ViewStyle } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { withSpringConfig, ScaleConfig } from '@/config/animations'

interface AnimatedButtonProps extends PressableProps {
  children: React.ReactNode
  style?: ViewStyle
  scaleValue?: number
  disableAnimation?: boolean
}

/**
 * 带弹性按压动画的按钮组件
 * 提供舒适的按压反馈效果
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  scaleValue = ScaleConfig.press,
  disableAnimation = false,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(ScaleConfig.normal)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(
    (event: any) => {
      if (!disableAnimation) {
        scale.value = withSpring(scaleValue, withSpringConfig.press)
      }
      onPressIn?.(event)
    },
    [disableAnimation, scaleValue, onPressIn, scale]
  )

  const handlePressOut = useCallback(
    (event: any) => {
      if (!disableAnimation) {
        scale.value = withSpring(ScaleConfig.normal, withSpringConfig.press)
      }
      onPressOut?.(event)
    },
    [disableAnimation, onPressOut, scale]
  )

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[style, disableAnimation ? undefined : animatedStyle]}>{children}</Animated.View>
    </Pressable>
  )
}

export default AnimatedButton
