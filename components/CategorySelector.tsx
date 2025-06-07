import * as Haptics from "expo-haptics"
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native"
import Animated, { FadeInRight } from "react-native-reanimated"

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const defaultCategories = [
  { id: "all", name: "All" },
  { id: "action", name: "Action" },
  { id: "comedy", name: "Comedy" },
  { id: "drama", name: "Drama" },
  { id: "horror", name: "Horror" },
  { id: "romance", name: "Romance" },
  { id: "sci-fi", name: "Sci-Fi" },
  { id: "thriller", name: "Thriller" },
]

interface Category {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categories?: Category[];
}

export function CategorySelector({ selectedCategory, onSelectCategory, categories = defaultCategories }: CategorySelectorProps) {
  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelectCategory(categoryId)
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category, index) => (
        <AnimatedTouchable
          key={category.id}
          style={[styles.categoryButton, selectedCategory === category.id && styles.selectedCategory]}
          onPress={() => handleCategoryPress(category.id)}
          entering={FadeInRight.delay(index * 50).duration(300)}
          activeOpacity={0.8}
        >
          <Text style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}>
            {category.name}
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
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333333",
  },
  selectedCategory: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  categoryText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#CCCCCC",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
})
