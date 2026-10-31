import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { apiCall, endpoints } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Empty, Loading } from "../components/UI";

export default function Shows() {
  const [params] = useSearchParams();
  const movieId = params.get("movieId");

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    apiCall("get", endpoints.shows)
      .then((data) => {
        setShows(Array.isArray(data) ? data : data?.content || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return shows.filter(
      (s) => !movieId || String(s.movieId) === String(movieId),
    );
  }, [shows, movieId]);

  if (loading) return <Loading label="Finding showtimes..." />;

  return (
    <section className="content-section page-section">
      <div className="page-title">
        <span className="eyebrow">PLAN YOUR VISIT</span>
        <h1>
          Choose a <em>showtime.</em>
        </h1>
        <p>Select a screening to continue to seat selection.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {filtered.length ? (
        <div className="show-list">
          {filtered.map((s) => (
            <article className="show-row" key={s.id}>
              <div className="show-date">
                <CalendarDays />
                <strong>{s.showDate}</strong>
              </div>

              <div className="show-main">
                <h3>{s.movieTitle || `Movie #${s.movieId}`}</h3>

                <p>
                  <MapPin size={14} />
                  {s.theatreName || "Theatre"} ·{" "}
                  {s.screenName || `Screen ${s.screenId}`}
                </p>

                <div className="show-time">
                  <Clock3 size={14} />
                  {s.startTime} – {s.endTime}
                </div>
              </div>

              <div className="show-price">₹{s.ticketPrice}</div>

              <button
                className="button button-primary button-small"
                onClick={() =>
                  isAuthenticated ? nav(`/book/${s.id}`) : nav("/login")
                }
              >
                Select seats
              </button>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="No showtimes found"
          detail="Create shows in the admin dashboard or choose another movie."
        />
      )}
    </section>
  );
}
