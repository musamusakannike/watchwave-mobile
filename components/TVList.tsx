import { ScrollView } from "react-native"
import { TVCard } from "./TVCard"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { Show } from "./TVListItem"

export function TVList({ shows }: { shows: Show[] }) {
  const handleTVPress = (show: Show) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push({
      pathname: "/tv/[id]" as const,
      params: { id: show.id }
    })
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
      {shows.map((show, index) => (
        <TVCard key={show.id} show={show} onPress={() => handleTVPress(show)} delay={index * 100} />
      ))}
    </ScrollView>
  )
}
