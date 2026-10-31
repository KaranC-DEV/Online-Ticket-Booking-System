# CineBook – React frontend

Dark-themed React 19 + Vite frontend for the Spring Boot Online Ticket Booking System.

## Requirements
- Node.js 20.19+ (or a compatible current Node LTS)
- npm
- Spring Boot backend running at `http://localhost:8080`

## Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173.

On Windows PowerShell, copy the environment file with:
```powershell
Copy-Item .env.example .env
```

## Backend configuration
Set `VITE_API_BASE_URL` in `.env` if the backend uses another host/port.

The Axios client automatically adds `Authorization: Bearer <token>` after login. Login currently recognizes token fields `token`, `accessToken`, or `jwt`. If your `AuthResponseDTO` uses another property, update `src/context/AuthContext.jsx`.

## Endpoints used (from the supplied controllers)
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET `/api/v1/users/me`
- PUT `/api/v1/users/me`
- GET `/api/v1/users?page=0&size=100`
- GET, POST `/api/v1/movies`
- GET `/api/v1/movies/{id}`
- PUT, DELETE `/api/v1/movies/{id}`
- GET, POST `/api/v1/theatres`
- POST `/api/v1/theatres/{theatreId}/screens`
- POST, GET `/api/v1/screens/{screenId}/seats`
- GET, POST `/api/v1/shows`
- GET `/api/v1/shows/{id}`
- POST `/api/v1/bookings/users/{userId}/shows/{showId}/seats/{showSeatId}`
- GET `/api/v1/bookings/{bookingId}/seats`

## Important backend gaps / assumptions
1. The provided controllers do not expose a ShowSeat list/create endpoint. The seat-selection page supports an optional inventory endpoint, but it is disabled until configured. Add a backend endpoint that returns ShowSeat records for a show, then set `VITE_SHOW_SEATS_ENDPOINT` to its path. The code replaces `:showId` in this value.
2. There is no endpoint to list a user's bookings. The My Bookings page explains this limitation rather than making a fake request.
3. There is no GET screens endpoint. The admin screen form asks for the theatre ID.
4. The supplied SeatController snippet had a missing `@RequestBody` on its POST method. Add it to accept JSON correctly.
5. Register request assumes `name`, `email`, `password`; profile update assumes `name`. Align these with your DTOs if they differ.
6. Admin route checks `user.role === "ADMIN"`. Ensure your `/api/v1/users/me` response includes role. If admin role is not included, adjust the role mapping.
7. Show creation payload uses nested references `{ movie: { id }, screen: { id } }`, matching the shown Show entity relationships. Change if `ShowRequestDTO` expects scalar IDs.
8. CORS must allow `http://localhost:5173` in Spring Security / MVC configuration.

## Suggested CORS configuration
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```
If Spring Security is enabled, also enable CORS in your security filter chain (`http.cors(...)`).

## Current functionality
- Customer: movie discovery/search/details, showtime listing, login/register, profile view/update, booking request, booking confirmation state.
- Admin: create/list movies, delete movies, create/list theatres, create screens, create seats, schedule/list shows, view paginated users.
- Not implemented as live features until backend support exists: seat inventory/availability and user's booking history.
