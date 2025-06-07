import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { ScrollView } from "react-native"
import { MovieCard } from "./MovieCard"
import { Movie } from "./MovieListItem"

export function MovieList({ movies }: { movies: Movie[] }) {
    const handleMoviePress = (movie: Movie) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push({
            pathname: "/movie/[id]" as const,
            params: { id: movie.id }
        })
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
            {movies.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} onPress={() => handleMoviePress(movie)} delay={index * 100} />
            ))}
        </ScrollView>
    )
}
