import { useEffect, useMemo, useState } from "react";
import { apiCall, endpoints } from "../services/api";
import MovieCard from "../components/MovieCard";
import { Empty, Loading, SearchBox } from "../components/UI";
export default function Movies() {
  const [movies, setMovies] = useState([]),
    [q, setQ] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    apiCall("get", endpoints.movies)
      .then((d) => setMovies(Array.isArray(d) ? d : d?.content || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(
    () =>
      movies.filter((m) =>
        `${m.title} ${m.genre} ${m.language}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [movies, q],
  );
  return (
    <section className="content-section page-section">
      <div className="page-title">
        <span className="eyebrow">THE MOVIE COLLECTION</span>
        <h1>
          Find your <em>next favourite.</em>
        </h1>
        <p>Search the latest stories and choose your cinema experience.</p>
      </div>
      <SearchBox value={q} onChange={setQ} />
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : filtered.length ? (
        <div className="movie-grid">
          {filtered.map((m, i) => (
            <MovieCard key={m.id ?? i} movie={m} index={i} />
          ))}
        </div>
      ) : (
        <Empty
          title="No matching movies"
          detail="Try another title, genre or language."
        />
      )}
    </section>
  );
}
