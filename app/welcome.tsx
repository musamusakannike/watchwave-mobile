"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { StatusBar } from "expo-status-bar"

const { width } = Dimensions.get("window")
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function Welcome() {
  const scale = useSharedValue(1)
  const logoOpacity = useSharedValue(0)
  const logoRef = useRef(null)

  useEffect(() => {
    logoOpacity.value = withDelay(500, withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))
  }, [logoOpacity])

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: scale.value }],
    }
  })

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    scale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }))

    try {
      await AsyncStorage.setItem("isFirstTimeUser", "false")
      setTimeout(() => {
        router.replace("/(tabs)")
      }, 300)
    } catch (error) {
      console.error("Error saving first time user status:", error)
      router.replace("/(tabs)")
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["rgba(0,0,0,0.7)", "#121212"]} style={styles.background} />

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image ref={logoRef} source={require("../assets/images/logo.png")} style={styles.logo} contentFit="contain" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(800)}>
          <Text style={styles.title}>Watchwave</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1200).duration(800)}>
          <Text style={styles.subtitle}>Discover and explore thousands of movies and TV shows all in one place</Text>
        </Animated.View>

        <Animated.View style={styles.buttonContainer} entering={FadeIn.delay(1600).duration(800)}>
          <AnimatedTouchable style={styles.button} onPress={handleGetStarted} activeOpacity={0.9}>
            <LinearGradient
              colors={["#FF3A3A", "#E50914"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 36,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: width * 0.8,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  gradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
})
