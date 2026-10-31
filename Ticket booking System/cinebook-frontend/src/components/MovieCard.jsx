import { Link } from "react-router-dom";
import { Clock3, Languages } from "lucide-react";

const palettes = [
  "poster-violet",
  "poster-blue",
  "poster-red",
  "poster-gold",
  "poster-green",
];

export default function MovieCard({ movie, index = 0 }) {
  const id = movie.id ?? movie.movieId;

  const cardContent = (
    <>
      <div className={`poster ${palettes[index % palettes.length]}`}>
        {movie.posterUrl || movie.imageUrl ? (
          <img src={movie.posterUrl || movie.imageUrl} alt={movie.title} />
        ) : (
          <>
            <span className="poster-kicker">NOW SHOWING</span>
            <strong>{movie.title}</strong>
            <span className="poster-ornament">✦</span>
          </>
        )}
        <span className="poster-rating">{movie.certificate || "CINEMA"}</span>
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>
          {movie.genre || "Movie"} <span>•</span>{" "}
          {movie.language || "Multiple languages"}
        </p>

        <div className="movie-meta">
          <span>
            <Clock3 size={13} />
            {movie.duration ? `${movie.duration} min` : "Feature film"}
          </span>
          <span>
            <Languages size={13} />
            {movie.language || "—"}
          </span>
        </div>
      </div>
    </>
  );

  if (id == null) {
    console.error("Movie ID missing:", movie);
    return <div className="movie-card">{cardContent}</div>;
  }

  return (
    <Link to={`/movies/${id}`} className="movie-card">
      {cardContent}
    </Link>
  );
}
