"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { router, Stack, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { fetchPersonDetails, getImageUrl } from "@/api/movies"
import { MovieList } from "@/components/MovieList"
import { TVList } from "@/components/TVList"

// Define types
interface Movie {
    id: number
    title: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    popularity: number
    [key: string]: any
}

interface TVShow {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    popularity: number
    [key: string]: any
}

interface Person {
    id: number
    name: string
    profile_path: string | null
    known_for_department: string
    birthday: string | null
    deathday: string | null
    place_of_birth: string | null
    biography: string | null
    movie_credits?: {
        cast: Movie[]
    }
    tv_credits?: {
        cast: TVShow[]
    }
}

const { width } = Dimensions.get("window")
const PROFILE_SIZE = width * 0.4

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [person, setPerson] = useState<Person | null>(null)
    const [loading, setLoading] = useState(true)
    const [showFullBio, setShowFullBio] = useState(false)

    useEffect(() => {
        if (id) {
            loadPerson()
        }
    }, [id])

    const loadPerson = async () => {
        if (!id) return
        try {
            setLoading(true)
            const personData = await fetchPersonDetails(id)
            setPerson(personData)
            setLoading(false)
        } catch (error) {
            console.error("Error loading person details:", error)
            setLoading(false)
        }
    }

    const handleShare = async () => {
        if (!person) return
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

            await Share.share({
                message: `Check out ${person.name} on Watchwave! https://www.themoviedb.org/person/${person.id}`,
                title: person.name,
            })
        } catch (error) {
            console.error("Error sharing:", error)
        }
    }

    const toggleBio = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setShowFullBio(!showFullBio)
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
            </View>
        )
    }

    if (!person) {
        return null
    }

    const calculateAge = (birthday: string | null, deathday: string | null = null): number | null => {
        if (!birthday) return null

        const birthDate = new Date(birthday)
        const endDate = deathday ? new Date(deathday) : new Date()

        let age = endDate.getFullYear() - birthDate.getFullYear()
        const monthDiff = endDate.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
            age--
        }

        return age
    }

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return "Unknown"

        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const age = calculateAge(person.birthday, person.deathday)
    const movieCredits = person.movie_credits?.cast || []
    const tvCredits = person.tv_credits?.cast || []

    // Sort credits by popularity
    const sortedMovieCredits = [...movieCredits].sort((a, b) => b.popularity - a.popularity)
    const sortedTVCredits = [...tvCredits].sort((a, b) => b.popularity - a.popularity)

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Navigation header */}
            <SafeAreaView style={styles.navHeader} edges={["top"]}>
                <View style={styles.navContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.back()
                        }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {person.name}
                    </Text>

                    <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                        <MaterialCommunityIcons name="share" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <Animated.View style={styles.profileImageContainer} entering={FadeIn.duration(500)}>
                        <Image 
                            source={person.profile_path ? getImageUrl(person.profile_path) : undefined} 
                            style={styles.profileImage} 
                            contentFit="cover" 
                        />
                    </Animated.View>

                    <Animated.View style={styles.nameContainer} entering={FadeInDown.delay(200).duration(500)}>
                        <Text style={styles.name}>{person.name}</Text>

                        {person.known_for_department && <Text style={styles.department}>{person.known_for_department}</Text>}
                    </Animated.View>
                </View>

                <Animated.View style={styles.infoSection} entering={FadeInDown.delay(300).duration(500)}>
                    <View style={styles.infoRow}>
                        {person.birthday && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar" size={16} color="#E50914" />
                                <Text style={styles.infoLabel}>Born</Text>
                                <Text style={styles.infoValue}>{formatDate(person.birthday)}</Text>
                                {age && <Text style={styles.infoSubvalue}>({age} years old)</Text>}
                            </View>
                        )}

                        {person.deathday && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar" size={16} color="#E50914" />
                                <Text style={styles.infoLabel}>Died</Text>
                                <Text style={styles.infoValue}>{formatDate(person.deathday)}</Text>
                            </View>
                        )}

                        {person.place_of_birth && (
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="map-marker" size={16} color="#E50914" />
                                <Text style={styles.infoLabel}>Birthplace</Text>
                                <Text style={styles.infoValue}>{person.place_of_birth}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {person.biography && (
                    <Animated.View style={styles.section} entering={FadeInDown.delay(400).duration(500)}>
                        <Text style={styles.sectionTitle}>Biography</Text>
                        <Text style={styles.biography} numberOfLines={showFullBio ? undefined : 5}>
                            {person.biography}
                        </Text>

                        <TouchableOpacity style={styles.readMoreButton} onPress={toggleBio}>
                            <Text style={styles.readMoreText}>{showFullBio ? "Read Less" : "Read More"}</Text>
                            {showFullBio ? <MaterialCommunityIcons name="chevron-up" size={16} color="#E50914" /> : <MaterialCommunityIcons name="chevron-down" size={16} color="#E50914" />}
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {sortedMovieCredits.length > 0 && (
                    <Animated.View style={styles.section} entering={FadeInDown.delay(500).duration(500)}>
                        <Text style={styles.sectionTitle}>Known For (Movies)</Text>
                        <MovieList movies={sortedMovieCredits.slice(0, 10)} />
                    </Animated.View>
                )}

                {sortedTVCredits.length > 0 && (
                    <Animated.View style={styles.section} entering={FadeInDown.delay(600).duration(500)}>
                        <Text style={styles.sectionTitle}>Known For (TV)</Text>
                        <TVList shows={sortedTVCredits.slice(0, 10)} />
                    </Animated.View>
                )}

                <View style={styles.bottomSpace} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
    navHeader: {
        backgroundColor: "#121212",
    },
    navContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1E1E1E",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#FFFFFF",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1E1E1E",
        justifyContent: "center",
        alignItems: "center",
    },
    profileSection: {
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 24,
    },
    profileImageContainer: {
        width: PROFILE_SIZE,
        height: PROFILE_SIZE,
        borderRadius: PROFILE_SIZE / 2,
        overflow: "hidden",
        backgroundColor: "#1E1E1E",
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "#E50914",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    nameContainer: {
        alignItems: "center",
    },
    name: {
        fontFamily: "Poppins-Bold",
        fontSize: 24,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 4,
    },
    department: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "#CCCCCC",
        textAlign: "center",
    },
    infoSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        backgroundColor: "#1E1E1E",
        borderRadius: 12,
        padding: 16,
    },
    infoItem: {
        alignItems: "center",
        marginHorizontal: 8,
        marginVertical: 8,
        minWidth: width / 4,
    },
    infoLabel: {
        fontFamily: "Poppins-Medium",
        fontSize: 12,
        color: "#888888",
        marginTop: 4,
        marginBottom: 2,
    },
    infoValue: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
        color: "#FFFFFF",
        textAlign: "center",
    },
    infoSubvalue: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#CCCCCC",
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#FFFFFF",
        marginBottom: 12,
    },
    biography: {
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        color: "#CCCCCC",
        lineHeight: 22,
    },
    readMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    readMoreText: {
        fontFamily: "Poppins-Medium",
        fontSize: 14,
        color: "#E50914",
        marginRight: 4,
    },
    bottomSpace: {
        height: 40,
    },
})
