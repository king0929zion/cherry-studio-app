/**
 * 统一的动画配置
 * 提供舒适、丝滑、带有弹性的动画参数
 */

import { Easing } from 'react-native'

/**
 * 弹性动画配置 - 轻微弹性，适合按钮和交互元素
 */
export const SpringConfig = {
  // 按压动画 - 快速响应，轻微弹性
  press: {
    damping: 15,
    mass: 0.5,
    stiffness: 400,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // 平滑动画 - 舒适的弹性
  smooth: {
    damping: 20,
    mass: 0.8,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // 轻柔动画 - 更柔和的弹性
  gentle: {
    damping: 25,
    mass: 1,
    stiffness: 200,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
}

/**
 * 缓动曲线配置
 */
export const EasingConfig = {
  // 标准缓动 - 自然流畅
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  // 减速 - 快速开始，平滑结束
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  // 加速 - 平滑开始，快速结束
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  // 弹性 - 轻微弹跳效果
  elastic: Easing.bezier(0.68, -0.55, 0.265, 1.55),
}

/**
 * 动画时长配置（毫秒）
 */
export const DurationConfig = {
  // 快速动画 - 按钮点击等
  fast: 200,
  // 标准动画 - 页面切换等
  normal: 300,
  // 慢速动画 - 复杂过渡
  slow: 400,
  // 超慢 - 特殊效果
  slower: 600,
}

/**
 * 缩放动画值
 */
export const ScaleConfig = {
  // 按压时缩放
  press: 0.95,
  // 激活时缩放
  active: 1.02,
  // 正常状态
  normal: 1.0,
}

/**
 * React Native Reanimated 配置
 */
export const withSpringConfig = {
  // 按压弹性
  press: {
    damping: 15,
    stiffness: 400,
    mass: 0.5,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // 平滑弹性
  smooth: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // 轻柔弹性
  gentle: {
    damping: 25,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
}

/**
 * React Native Reanimated Timing 配置
 */
export const withTimingConfig = {
  // 快速
  fast: {
    duration: DurationConfig.fast,
    easing: EasingConfig.standard,
  },
  // 标准
  normal: {
    duration: DurationConfig.normal,
    easing: EasingConfig.standard,
  },
  // 慢速
  slow: {
    duration: DurationConfig.slow,
    easing: EasingConfig.standard,
  },
}

/**
 * 页面切换动画配置
 */
export const ScreenTransitionConfig = {
  // 标准切换
  standard: {
    animation: 'spring' as const,
    config: SpringConfig.smooth,
  },
  // 快速切换
  fast: {
    animation: 'timing' as const,
    config: {
      duration: DurationConfig.fast,
      easing: EasingConfig.decelerate,
    },
  },
  // iOS 风格
  ios: {
    animation: 'spring' as const,
    config: {
      damping: 20,
      mass: 0.8,
      stiffness: 300,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  },
}

/**
 * BottomSheet 动画配置
 */
export const BottomSheetAnimationConfig = {
  // 弹性出现
  spring: {
    damping: 30,
    mass: 0.7,
    stiffness: 400,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // 平滑时长
  duration: DurationConfig.normal,
}
