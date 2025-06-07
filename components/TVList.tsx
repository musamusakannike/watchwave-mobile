import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { ScrollView } from "react-native"
import { Movie, MovieListItem } from "./MovieListItem"


export function TVList({ shows }: { shows: Movie[] }) {
  const handleTVPress = (show: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/tv/${show.id}`)
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
      {shows.map((show: Movie) => (
        <MovieListItem key={show.id} movie={show} onPress={() => handleTVPress(show)} />
      ))}
    </ScrollView>
  )
}
