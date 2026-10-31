import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Clapperboard, Film, LayoutDashboard, LogIn, LogOut, Ticket, UserRound, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const admin = String(user?.role || "").toUpperCase() === "ADMIN";
  return <div className="app-shell">
    <header className="topbar">
      <Link to="/" className="brand"><span className="brand-mark"><Clapperboard size={21}/></span><span>CINE<span className="brand-accent">BOOK</span></span></Link>
      <nav className="main-nav">
        <NavLink to="/">Discover</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        {isAuthenticated && <NavLink to="/my-bookings">My bookings</NavLink>}
        {admin && <NavLink to="/admin"><LayoutDashboard size={15}/> Admin</NavLink>}
      </nav>
      <div className="top-actions">
        {isAuthenticated ? <>
          <Link className="profile-link" to="/profile"><UserRound size={17}/><span>{user?.name || user?.email || "Account"}</span></Link>
          <button className="icon-button" title="Sign out" onClick={() => { logout(); navigate("/"); }}><LogOut size={17}/></button>
        </> : <Link className="button button-primary button-small" to="/login"><LogIn size={16}/> Sign in</Link>}
      </div>
    </header>
    <main className="page-wrap"><Outlet /></main>
    <footer className="footer"><div className="brand"><Clapperboard size={18}/> CINE<span className="brand-accent">BOOK</span></div><span>Your next great movie night starts here.</span><span>© {new Date().getFullYear()} CineBook</span></footer>
  </div>;
}