import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import { Login, Register } from "./pages/Auth";
import Shows from "./pages/Shows";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import { BookingSuccess, MyBookings, Profile } from "./pages/Account";
import { useAuth } from "./context/AuthContext";

function Protected({ children, admin = false }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (admin && String(user?.role || "").toUpperCase() !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  return <Routes><Route element={<Layout/>}>
    <Route index element={<Home/>}/><Route path="movies" element={<Movies/>}/><Route path="movies/:id" element={<MovieDetails/>}/>
    <Route path="login" element={<Login/>}/><Route path="register" element={<Register/>}/>
    <Route path="shows" element={<Shows/>}/>
    <Route path="book/:showId" element={<Protected><Booking/></Protected>}/>
    <Route path="booking-success" element={<Protected><BookingSuccess/></Protected>}/>
    <Route path="my-bookings" element={<Protected><MyBookings/></Protected>}/>
    <Route path="profile" element={<Protected><Profile/></Protected>}/>
    <Route path="admin" element={<Protected admin><Admin/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Route></Routes>;
}