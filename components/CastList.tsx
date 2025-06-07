import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router } from "expo-router"
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

import { getImageUrl } from "@/api/movies"

const { width } = Dimensions.get("window")
const CAST_CARD_WIDTH = width * 0.25

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
}

interface CastListProps {
  cast: Cast[]
}

export function CastList({ cast }: CastListProps) {
  const handleCastPress = (person: Cast) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: "/person/[id]",
      params: { id: person.id }
    })
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {cast.map((person: Cast, index: number) => (
        <AnimatedTouchable
          key={person.id}
          style={styles.castCard}
          onPress={() => handleCastPress(person)}
          entering={FadeInRight.delay(index * 100).duration(500)}
          activeOpacity={0.8}
        >
          <Image
            source={person.profile_path ? { uri: getImageUrl(person.profile_path, "w185") } : require("../assets/images/placeholder-person.png")}
            style={styles.profileImage}
            contentFit="cover"
            placeholder={require("../assets/images/placeholder-person.png")}
          />

          <Text style={styles.name} numberOfLines={2}>
            {person.name}
          </Text>

          <Text style={styles.character} numberOfLines={2}>
            {person.character}
          </Text>
        </AnimatedTouchable>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingRight: 16,
  },
  castCard: {
    width: CAST_CARD_WIDTH,
    marginRight: 12,
  },
  profileImage: {
    width: CAST_CARD_WIDTH,
    height: CAST_CARD_WIDTH * 1.2,
    borderRadius: 8,
    backgroundColor: "#1E1E1E",
    marginBottom: 8,
  },
  name: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 2,
    lineHeight: 16,
  },
  character: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#CCCCCC",
    lineHeight: 14,
  },
})
