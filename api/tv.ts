import axios from "axios"

const API_KEY = "b0c0f500a0ad17caed12cc738bf37518"
const BASE_URL = "https://api.themoviedb.org/3"

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
})

// TV Show endpoints
export const fetchTrendingTv = (timeWindow = "day") => {
  return api.get(`/trending/tv/${timeWindow}`).then((res) => res.data)
}

export const fetchPopularTv = (page = 1) => {
  return api.get("/tv/popular", { params: { page } }).then((res) => res.data)
}

export const fetchTopRatedTv = (page = 1) => {
  return api.get("/tv/top_rated", { params: { page } }).then((res) => res.data)
}

export const fetchAiringTodayTv = (page = 1) => {
  return api.get("/tv/airing_today", { params: { page } }).then((res) => res.data)
}

export const fetchOnTheAirTv = (page = 1) => {
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

export const fetchEpisodeDetails = (tvId: number | string, seasonNumber: number | string, episodeNumber: number | string) => {
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
