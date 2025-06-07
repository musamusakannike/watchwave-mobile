"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useEffect, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated"

export default function Index() {
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const textTranslateY = useSharedValue(50)
  const backgroundOpacity = useSharedValue(0)
  
  // Create shared values first
  const dotOpacity1 = useSharedValue(0)
  const dotOpacity2 = useSharedValue(0)
  const dotOpacity3 = useSharedValue(0)
  const dotScale1 = useSharedValue(0)
  const dotScale2 = useSharedValue(0)
  const dotScale3 = useSharedValue(0)
  
  // Then memoize the arrays
  const dotOpacities = useMemo(
    () => [dotOpacity1, dotOpacity2, dotOpacity3],
    [dotOpacity1, dotOpacity2, dotOpacity3]
  )
  
  const dotScales = useMemo(
    () => [dotScale1, dotScale2, dotScale3],
    [dotScale1, dotScale2, dotScale3]
  )

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTime = await AsyncStorage.getItem("isFirstTimeUser")

      if (isFirstTime === null) {
        // First time user
        router.replace("/welcome")
      } else {
        // Returning user
        router.replace("/(tabs)")
      }
    } catch (error) {
      console.error("Error checking first time user:", error)
      router.replace("/(tabs)")
    }
  }

  useEffect(() => {
    // Background fade in
    backgroundOpacity.value = withTiming(1, { duration: 500 })

    // Logo animation sequence
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))

    logoScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.2, { duration: 600, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55) }),
        withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      ),
    )

    // Text animation
    textOpacity.value = withDelay(800, withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))

    textTranslateY.value = withDelay(800, withTiming(0, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))

    // Dots animation
    dotOpacities.forEach((opacity, index) => {
      opacity.value = withDelay(
        1200 + index * 200,
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
      )
    })

    dotScales.forEach((scale, index) => {
      scale.value = withDelay(
        1200 + index * 200,
        withSequence(withTiming(1.2, { duration: 400 }), withTiming(1, { duration: 400 })),
      )
    })

    // Navigate after animation completes
    const timeoutId = setTimeout(() => {
      runOnJS(checkFirstTimeUser)()
    }, 2500)

    return () => clearTimeout(timeoutId)
  }, [backgroundOpacity, dotOpacities, dotScales, logoOpacity, logoScale, textOpacity, textTranslateY])

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    }
  })

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    }
  })

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    }
  })

  const dotStyles = [
    useAnimatedStyle(() => ({
      opacity: dotOpacities[0].value,
      transform: [{ scale: dotScales[0].value }],
    })),
    useAnimatedStyle(() => ({
      opacity: dotOpacities[1].value,
      transform: [{ scale: dotScales[1].value }],
    })),
    useAnimatedStyle(() => ({
      opacity: dotOpacities[2].value,
      transform: [{ scale: dotScales[2].value }],
    })),
  ]

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={["#1a1a1a", "#121212", "#0a0a0a"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="movie" size={80} color="#E50914" />
        </View>
      </Animated.View>

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.appName}>Watchwave</Text>
        <Text style={styles.tagline}>Your Movie Universe</Text>
      </Animated.View>

      {/* Animated dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View key={index} style={[styles.dot, dotStyles[index]]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(229, 9, 20, 0.3)",
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(229, 9, 20, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#CCCCCC",
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 100,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E50914",
  },
})
