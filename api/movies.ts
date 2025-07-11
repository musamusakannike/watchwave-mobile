import axios from "axios"

const API_KEY = "b0c0f500a0ad17caed12cc738bf37518"
const BASE_URL = "https://api.themoviedb.org/3"

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

// Genre mapping for categories
const GENRE_MAPPING = {
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  romance: 10749,
  "sci-fi": 878,
  thriller: 53,
}

// Movie endpoints with genre filtering
export const fetchTrending = (timeWindow = "day", genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/movie", {
        params: {
          with_genres: genreId,
          sort_by: "popularity.desc",
          "vote_count.gte": 100,
        },
      })
      .then((res) => res.data)
  }
  return api.get(`/trending/movie/${timeWindow}`).then((res) => res.data)
}

export const fetchPopular = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/movie", {
        params: {
          page,
          with_genres: genreId,
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/movie/popular", { params: { page } }).then((res) => res.data)
}

export const fetchNowPlaying = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/movie", {
        params: {
          page,
          with_genres: genreId,
          "primary_release_date.gte": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          "primary_release_date.lte": new Date().toISOString().split("T")[0],
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/movie/now_playing", { params: { page } }).then((res) => res.data)
}

export const fetchUpcoming = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/movie", {
        params: {
          page,
          with_genres: genreId,
          "primary_release_date.gte": new Date().toISOString().split("T")[0],
          sort_by: "popularity.desc",
        },
      })
      .then((res) => res.data)
  }
  return api.get("/movie/upcoming", { params: { page } }).then((res) => res.data)
}

export const fetchTopRated = (page = 1, genreId?: number) => {
  if (genreId) {
    return api
      .get("/discover/movie", {
        params: {
          page,
          with_genres: genreId,
          sort_by: "vote_average.desc",
          "vote_count.gte": 300,
        },
      })
      .then((res) => res.data)
  }
  return api.get("/movie/top_rated", { params: { page } }).then((res) => res.data)
}

export const fetchMovieDetails = (movieId: number | string) => {
  return api
    .get(`/movie/${movieId}`, {
      params: {
        append_to_response: "credits,videos,similar,reviews,watch/providers",
      },
    })
    .then((res) => res.data)
}

export const fetchMovieCredits = (movieId: number | string) => {
  return api.get(`/movie/${movieId}/credits`).then((res) => res.data)
}

export const fetchMovieVideos = (movieId: number | string) => {
  return api.get(`/movie/${movieId}/videos`).then((res) => res.data)
}

export const fetchSimilarMovies = (movieId: number | string) => {
  return api.get(`/movie/${movieId}/similar`).then((res) => res.data)
}

export const fetchMovieReviews = (movieId: number | string) => {
  return api.get(`/movie/${movieId}/reviews`).then((res) => res.data)
}

export const searchMovies = (params: any) => {
  const { query, page = 1, genres, year, sortBy } = params

  if (query) {
    return api
      .get("/search/movie", {
        params: {
          query,
          page,
          year,
        },
      })
      .then((res) => res.data)
  } else {
    return api
      .get("/discover/movie", {
        params: {
          page,
          with_genres: genres?.join(","),
          primary_release_year: year,
          sort_by: sortBy,
        },
      })
      .then((res) => res.data)
  }
}

export const fetchGenres = () => {
  return api.get("/genre/movie/list").then((res) => res.data)
}

export const fetchPersonDetails = (personId: number | string) => {
  return api
    .get(`/person/${personId}`, {
      params: {
        append_to_response: "movie_credits,tv_credits",
      },
    })
    .then((res) => res.data)
}

export const fetchWatchProviders = (movieId: number | string) => {
  return api.get(`/movie/${movieId}/watch/providers`).then((res) => res.data)
}

// Configuration
export const fetchConfiguration = () => {
  return api.get("/configuration").then((res) => res.data)
}

// Helper function to get genre ID from category
export const getGenreIdFromCategory = (category: string): number | undefined => {
  return GENRE_MAPPING[category as keyof typeof GENRE_MAPPING]
}

// Helper function to get image URL
export const getImageUrl = (path: string | null | undefined, size = "w500") => {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

// Helper function to get backdrop URL
export const getBackdropUrl = (path: string | null | undefined, size = "w1280") => {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
