import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"

interface Review {
  id: string
  author: string
  created_at: string
  content: string
  author_details: {
    rating: number
  }
}
export function ReviewList({ reviews }: { reviews: Review[] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleReviewPress = (review: Review) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Could navigate to full review page
  }

  return (
    <View style={styles.container}>
      {reviews.map((review, index) => (
        <Animated.View key={review.id} style={styles.reviewCard} entering={FadeInDown.delay(index * 100).duration(500)}>
          <TouchableOpacity onPress={() => handleReviewPress(review)} activeOpacity={0.8}>
            <View style={styles.reviewHeader}>
              <View style={styles.authorContainer}>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons name="account" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{review.author}</Text>
                  <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                </View>
              </View>

              {review.author_details?.rating && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{review.author_details.rating}</Text>
                </View>
              )}
            </View>

            <Text style={styles.reviewContent} numberOfLines={4}>
              {review.content}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  reviewDate: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#888888",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  reviewContent: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
})
