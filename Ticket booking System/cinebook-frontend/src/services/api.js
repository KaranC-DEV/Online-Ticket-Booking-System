import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinebook_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  },
);

export const endpoints = {
  // Authentication
  register: "/api/v1/auth/register",
  login: "/api/v1/auth/login",

  // Movies and theatres
  movies: "/api/v1/movies",
  adminMovies: "/api/v1/movies/admin",
  theatres: "/api/v1/theatres",

  // Screens and seats
  screens: (theatreId) => `/api/v1/theatres/${theatreId}/screens`,
  seats: (screenId) => `/api/v1/screens/${screenId}/seats`,
  generateSeats: (screenId) => `/api/v1/screens/${screenId}/seats/generate`,

  // Shows
  shows: "/api/v1/shows",
  createShow: (movieId, screenId) => `/api/v1/shows/${movieId}/${screenId}`,

  // Bookings
  booking: (userId, showId, showSeatId) =>
    `/api/v1/bookings/users/${userId}/shows/${showId}/seats/${showSeatId}`,

  bookings: (userId) => `/api/v1/bookings/users/${userId}`,

  bookingSeats: (bookingId) => `/api/v1/bookings/${bookingId}/seats`,

  // Users
  users: "/api/v1/users",
  me: "/api/v1/users/me",
};

export const apiCall = async (method, url, data, config) => {
  const response = await api({ method, url, data, ...config });
  return response.data;
};

export default api;
