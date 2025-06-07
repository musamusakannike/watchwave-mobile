import axios from "axios"

const API_KEY = "b0c0f500a0ad17caed12cc738bf37518"
const BASE_URL = "https://api.themoviedb.org/3"

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

// Genre mapping for TV show categories
const TV_GENRE_MAPPING = {
  action: 10759, // Action & Adventure
  comedy: 35,
  drama: 18,
  "sci-fi": 10765, // Sci-Fi & Fantasy
  fantasy: 10765, // Sci-Fi & Fantasy
  crime: 80,
  documentary: 99,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  news: 10763,
  reality: 10764,
  soap: 10766,
  talk: 10767,
  war: 10768,
  western: 37,
}

// TV Show endpoints with genre filtering
export const fetchTrendingTv = (timeWindow = "day", genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/tv", {
        params: {
          with_genres: genreId,
          sort_by: "popularity.desc",
          "vote_count.gte": 50,
        },
      })
      .then((res) => res.data)
  }
  return api.get(`/trending/tv/${timeWindow}`).then((res) => res.data)
}

export const fetchPopularTv = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/tv", {
        params: {
          page,
          with_genres: genreId,
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/tv/popular", { params: { page } }).then((res) => res.data)
}

export const fetchTopRatedTv = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/tv", {
        params: {
          page,
          with_genres: genreId,
          sort_by: "vote_average.desc",
          "vote_count.gte": 100,
        },
      })
      .then((res) => res.data)
  }
  return api.get("/tv/top_rated", { params: { page } }).then((res) => res.data)
}

export const fetchAiringTodayTv = (page = 1, genreId?: number) => {
  if (genreId) {
    const today = new Date().toISOString().split("T")[0]
    return api
      .get("/discover/tv", {
        params: {
          page,
          with_genres: genreId,
          "air_date.gte": today,
          "air_date.lte": today,
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/tv/airing_today", { params: { page } }).then((res) => res.data)
}

export const fetchOnTheAirTv = (page = 1, genreId?: number) => {
  if (genreId) {
    const today = new Date().toISOString().split("T")[0]
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    return api
      .get("/discover/tv", {
        params: {
          page,
          with_genres: genreId,
          "air_date.gte": today,
          "air_date.lte": futureDate,
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/tv/on_the_air", { params: { page } }).then((res) => res.data)
}

export const fetchTVDetails = (tvId: number | string) => {
  return api
    .get(`/tv/${tvId}`, {
      params: {
        append_to_response: "credits,videos,similar,reviews,watch/providers",
      },
    })
    .then((res) => res.data)
}

export const fetchTVCredits = (tvId: number | string) => {
  return api.get(`/tv/${tvId}/credits`).then((res) => res.data)
}

export const fetchTVVideos = (tvId: number | string) => {
  return api.get(`/tv/${tvId}/videos`).then((res) => res.data)
}

export const fetchSimilarTVShows = (tvId: number | string) => {
  return api.get(`/tv/${tvId}/similar`).then((res) => res.data)
}

export const fetchTVReviews = (tvId: number | string) => {
  return api.get(`/tv/${tvId}/reviews`).then((res) => res.data)
}

export const fetchSeasonDetails = (tvId: number | string, seasonNumber: number | string) => {
  return api.get(`/tv/${tvId}/season/${seasonNumber}`).then((res) => res.data)
}

export const fetchEpisodeDetails = (
  tvId: number | string,
  seasonNumber: number | string,
  episodeNumber: number | string,
) => {
  return api.get(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`).then((res) => res.data)
}

export const searchTVShows = (params: any) => {
  const { query, page = 1, genres, year, sortBy } = params

  if (query) {
    return api
      .get("/search/tv", {
        params: {
          query,
          page,
          first_air_date_year: year,
        },
      })
      .then((res) => res.data)
  } else {
    return api
      .get("/discover/tv", {
        params: {
          page,
          with_genres: genres?.join(","),
          first_air_date_year: year,
          sort_by: sortBy,
        },
      })
      .then((res) => res.data)
  }
}

export const fetchTVGenres = () => {
  return api.get("/genre/tv/list").then((res) => res.data)
}

export const fetchTVWatchProviders = (tvId: number | string) => {
  return api.get(`/tv/${tvId}/watch/providers`).then((res) => res.data)
}

// Helper function to get genre ID from category for TV shows
export const getTVGenreIdFromCategory = (category: string): number | undefined => {
  return TV_GENRE_MAPPING[category as keyof typeof TV_GENRE_MAPPING]
}

// Helper function to get image URL (reused from movies)
export const getImageUrl = (path: string | null | undefined, size = "w500") => {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Helper function to get backdrop URL (reused from movies)
export const getBackdropUrl = (path: string | null | undefined, size = "w1280") => {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
