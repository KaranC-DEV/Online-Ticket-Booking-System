import { useEffect, useState } from "react";
import {
  Film,
  Building2,
  MonitorPlay,
  Armchair,
  CalendarDays,
  Users,
  Plus,
  RefreshCw,
} from "lucide-react";

import { apiCall, endpoints } from "../services/api";
import { ErrorMessage, Loading } from "../components/UI";

const blankMovie = {
  title: "",
  description: "",
  genre: "",
  language: "",
  duration: "",
  releaseDate: "",
  certificate: "UA",
  status: "ACTIVE",
};

const blankTheatre = {
  name: "",
  address: "",
  location: "",
};

const blankScreen = {
  theatreId: "",
  screenName: "",
  capacity: "",
};

const blankSeatGeneration = {
  screenId: "",
  regularSeats: "",
  premiumSeats: "",
};

const blankShow = {
  movieId: "",
  screenId: "",
  showDate: "",
  startTime: "",
  endTime: "",
  ticketPrice: "",
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

export default function Admin() {
  const [tab, setTab] = useState("overview");

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [movie, setMovie] = useState(blankMovie);
  const [theatre, setTheatre] = useState(blankTheatre);
  // For creating a new screen
  const [screen, setScreen] = useState(blankScreen);

  // For storing existing screens fetched from the backend
  const [screens, setScreens] = useState([]);
  const [seatGeneration, setSeatGeneration] = useState(blankSeatGeneration);
  const [show, setShow] = useState(blankShow);

  const refresh = async () => {
    setLoading(true);
    setError("");

    try {
      const [movieData, theatreData, showData] = await Promise.all([
        apiCall("get", endpoints.adminMovies),
        apiCall("get", endpoints.theatres),
        apiCall("get", endpoints.shows),
      ]);

      setMovies(getList(movieData));
      setTheatres(getList(theatreData));
      setShows(getList(showData));

      const screenResults = await Promise.all(
        getList(theatreData).map(async (theatre) => {
          const data = await apiCall("get", endpoints.screens(theatre.id));

          return getList(data).map((item) => ({
            ...item,
            theatreName: theatre.name,
          }));
        }),
      );

      setScreens(screenResults.flat());
      try {
        const userData = await apiCall(
          "get",
          `${endpoints.users}?page=0&size=100`,
        );

        setUsers(getList(userData));
      } catch {
        setUsers([]);
      }
    } catch (e) {
      setError(e.message || "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const refreshShowStatuses = async () => {
    try {
      const data = await apiCall("get", endpoints.shows);
      const updatedShows = getList(data);

      setShows((previousShows) =>
        previousShows.map((oldShow) => {
          const updatedShow = updatedShows.find(
            (item) => item.id === oldShow.id,
          );

          return updatedShow
            ? { ...oldShow, status: updatedShow.status }
            : oldShow;
        }),
      );
    } catch (e) {
      console.error("Failed to refresh show statuses:", e);
    }
  };

  useEffect(() => {
    refresh();
  }, []);
  useEffect(() => {
    if (tab !== "shows") return;

    const interval = setInterval(() => {
      refreshShowStatuses();
    }, 5000);

    return () => clearInterval(interval);
  }, [tab]);

  const submit = async (e, fn) => {
    e.preventDefault();
    setError("");
    setNotice("");

    try {
      await fn();
      await refresh();

      setNotice("Saved successfully.");

      setTimeout(() => {
        setNotice("");
      }, 3000);
    } catch (x) {
      setError(x.message);
    }
  };

  const field = (
    obj,
    setObj,
    key,
    label,
    type = "text",
    required = true,
    min,
  ) => (
    <label key={key}>
      {label}
      <input
        type={type}
        required={required}
        min={min}
        value={obj[key] ?? ""}
        onChange={(e) => setObj({ ...obj, [key]: e.target.value })}
      />
    </label>
  );

  const tabs = [
    ["overview", "Overview", LayoutIcon],
    ["movies", "Movies", Film],
    ["theatres", "Theatres", Building2],
    ["screens", "Screens", MonitorPlay],
    ["seats", "Seats", Armchair],
    ["shows", "Shows", CalendarDays],
    ["users", "Users", Users],
  ];

  return (
    <section className="admin-layout page-section">
      <aside className="admin-sidebar">
        <span className="eyebrow">WORKSPACE</span>
        <h2>Admin panel</h2>

        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}

        <button className="refresh-button" onClick={refresh}>
          <RefreshCw size={15} />
          Refresh data
        </button>
      </aside>

      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">CINEBOOK MANAGEMENT</span>
            <h1>{tabs.find((t) => t[0] === tab)?.[1]}</h1>
          </div>
          <span className="admin-pill">ADMIN</span>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {notice && <div className="alert alert-success">{notice}</div>}

        {loading ? (
          <Loading />
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="stat-grid">
                {[
                  [Film, "Movies", movies.length],
                  [Building2, "Theatres", theatres.length],
                  [CalendarDays, "Shows", shows.length],
                  [Users, "Users", users.length || "—"],
                ].map(([Icon, label, value]) => (
                  <div className="stat-card" key={label}>
                    <Icon />
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* MOVIES */}
            {tab === "movies" && (
              <>
                <form
                  className="admin-form card-panel"
                  onSubmit={(e) =>
                    submit(e, async () => {
                      await apiCall("post", endpoints.movies, {
                        ...movie,
                        duration: Number(movie.duration),
                      });

                      setMovie(blankMovie);
                    })
                  }
                >
                  <h3>
                    <Plus size={17} /> Add movie
                  </h3>

                  <div className="form-grid">
                    {field(movie, setMovie, "title", "Title")}
                    {field(movie, setMovie, "genre", "Genre")}
                    {field(movie, setMovie, "language", "Language")}
                    {field(
                      movie,
                      setMovie,
                      "duration",
                      "Duration (minutes)",
                      "number",
                      true,
                      1,
                    )}
                    {field(
                      movie,
                      setMovie,
                      "releaseDate",
                      "Release date",
                      "date",
                    )}
                    {field(movie, setMovie, "certificate", "Certificate")}
                    {field(movie, setMovie, "status", "Status")}
                  </div>

                  <label>
                    Description
                    <textarea
                      required
                      value={movie.description}
                      onChange={(e) =>
                        setMovie({
                          ...movie,
                          description: e.target.value,
                        })
                      }
                    />
                  </label>

                  <button className="button button-primary">
                    Create movie
                  </button>
                </form>

                <DataTable
                  title="Movies"
                  rows={movies}
                  cols={["id", "title", "genre", "language", "status"]}
                  onStatusChange={async (id, currentStatus) => {
                    try {
                      setError("");
                      setNotice("");

                      const newStatus =
                        currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

                      await apiCall(
                        "put",
                        `${endpoints.movies}/${id}/status`,
                        null,
                        { params: { status: newStatus } },
                      );

                      await refresh();

                      setNotice(`Movie status changed to ${newStatus}.`);

                      setTimeout(() => {
                        setNotice("");
                      }, 3000);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                />
              </>
            )}

            {/* THEATRES */}
            {tab === "theatres" && (
              <>
                <form
                  className="admin-form card-panel"
                  onSubmit={(e) =>
                    submit(e, async () => {
                      await apiCall("post", endpoints.theatres, theatre);
                      setTheatre(blankTheatre);
                    })
                  }
                >
                  <h3>
                    <Plus size={17} /> Add theatre
                  </h3>

                  <div className="form-grid">
                    {field(theatre, setTheatre, "name", "Theatre name")}
                    {field(theatre, setTheatre, "address", "Address")}
                    {field(theatre, setTheatre, "location", "Location")}
                  </div>

                  <button className="button button-primary">
                    Create theatre
                  </button>
                </form>

                <DataTable
                  title="Theatres"
                  rows={theatres}
                  cols={["id", "name", "address", "location"]}
                />
              </>
            )}

            {/* SCREENS */}
            {tab === "screens" && (
              <>
                <form
                  className="admin-form card-panel"
                  onSubmit={(e) =>
                    submit(e, async () => {
                      await apiCall(
                        "post",
                        endpoints.screens(screen.theatreId),
                        {
                          screenName: screen.screenName.trim(),
                          capacity: Number(screen.capacity),
                          theatreId: Number(screen.theatreId),
                        },
                      );

                      setScreen({
                        theatreId: "",
                        screenName: "",
                        capacity: "",
                      });
                    })
                  }
                >
                  <h3>
                    <Plus size={17} /> Add screen
                  </h3>

                  <div className="form-grid">
                    <label>
                      Select theatre
                      <select
                        required
                        value={screen.theatreId}
                        onChange={(e) =>
                          setScreen({
                            ...screen,
                            theatreId: e.target.value,
                          })
                        }
                      >
                        <option value="">Choose a theatre</option>

                        {theatres.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} (ID: {t.id})
                          </option>
                        ))}
                      </select>
                    </label>

                    {field(screen, setScreen, "screenName", "Screen name")}

                    {field(
                      screen,
                      setScreen,
                      "capacity",
                      "Total seat capacity",
                      "number",
                      true,
                      1,
                    )}
                  </div>

                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={!theatres.length}
                  >
                    Create screen
                  </button>

                  {!theatres.length && (
                    <p className="form-hint">
                      Please create a theatre first before adding a screen.
                    </p>
                  )}
                </form>

                <DataTable
                  title="Available theatres"
                  rows={theatres}
                  cols={["id", "name", "location"]}
                />
              </>
            )}

            {/* SEATS */}

            {tab === "seats" && (
              <>
                <form
                  className="admin-form card-panel"
                  onSubmit={(e) =>
                    submit(e, async () => {
                      await apiCall(
                        "post",
                        endpoints.generateSeats(seatGeneration.screenId),
                        {
                          regularSeats: Number(seatGeneration.regularSeats),
                          premiumSeats: Number(seatGeneration.premiumSeats),
                        },
                      );

                      setSeatGeneration(blankSeatGeneration);
                    })
                  }
                >
                  <h3>
                    <Plus size={17} /> Generate screen seats
                  </h3>

                  <div className="form-grid">
                    <label>
                      Select theatre and screen
                      <select
                        required
                        value={seatGeneration.screenId}
                        onChange={(e) =>
                          setSeatGeneration({
                            ...seatGeneration,
                            screenId: e.target.value,
                          })
                        }
                      >
                        <option value="">Choose a screen</option>

                        {screens.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.theatreName} — {item.screenName} (ID:{" "}
                            {item.id})
                          </option>
                        ))}
                      </select>
                    </label>

                    {field(
                      seatGeneration,
                      setSeatGeneration,
                      "regularSeats",
                      "Number of regular seats",
                      "number",
                      true,
                      0,
                    )}

                    {field(
                      seatGeneration,
                      setSeatGeneration,
                      "premiumSeats",
                      "Number of premium seats",
                      "number",
                      true,
                      0,
                    )}
                  </div>

                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={!screens.length}
                  >
                    Generate seats
                  </button>

                  {!screens.length && (
                    <p className="form-hint">
                      No screens available. Create a theatre and screen first.
                    </p>
                  )}
                </form>

                <DataTable
                  title="Available screens"
                  rows={screens}
                  cols={["id", "theatreName", "screenName", "capacity"]}
                />
              </>
            )}

            {/* SHOWS */}
            {tab === "shows" && (
              <>
                <form
                  className="admin-form card-panel"
                  onSubmit={(e) =>
                    submit(e, async () => {
                      await apiCall(
                        "post",
                        endpoints.createShow(show.movieId, show.screenId),
                        {
                          showDate: show.showDate,
                          startTime: show.startTime,
                          endTime: show.endTime,
                          ticketPrice: Number(show.ticketPrice),
                        },
                      );

                      setShow(blankShow);
                    })
                  }
                >
                  <h3>
                    <Plus size={17} /> Schedule show
                  </h3>

                  <div className="form-grid">
                    {/* Movie dropdown */}
                    <label>
                      Select movie
                      <select
                        required
                        value={show.movieId}
                        onChange={(e) =>
                          setShow({ ...show, movieId: e.target.value })
                        }
                      >
                        <option value="">Choose a movie</option>

                        {movies
                          .filter((movie) => movie.status === "ACTIVE")
                          .map((movie) => (
                            <option key={movie.id} value={movie.id}>
                              {movie.title} (ID: {movie.id})
                            </option>
                          ))}
                      </select>
                    </label>

                    {/* Screen dropdown */}
                    <label>
                      Select theatre and screen
                      <select
                        required
                        value={show.screenId}
                        onChange={(e) =>
                          setShow({ ...show, screenId: e.target.value })
                        }
                      >
                        <option value="">Choose a screen</option>

                        {screens.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.theatreName} — {item.screenName} (ID:{" "}
                            {item.id})
                          </option>
                        ))}
                      </select>
                    </label>

                    {field(show, setShow, "showDate", "Show date", "date")}

                    {field(show, setShow, "startTime", "Start time", "time")}

                    {field(show, setShow, "endTime", "End time", "time")}

                    {field(
                      show,
                      setShow,
                      "ticketPrice",
                      "Ticket price",
                      "number",
                      true,
                      0,
                    )}
                  </div>

                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={
                      !movies.some((m) => m.status === "ACTIVE") ||
                      !screens.length
                    }
                  >
                    Create show
                  </button>

                  {!movies.some((m) => m.status === "ACTIVE") && (
                    <p className="form-hint">
                      No active movies available. Activate a movie first.
                    </p>
                  )}

                  {!screens.length && (
                    <p className="form-hint">
                      No screens available. Create a screen first.
                    </p>
                  )}
                </form>

                <DataTable
                  title="Shows"
                  rows={shows}
                  cols={[
                    "id",
                    "movieTitle",
                    "theatreName",
                    "screenName",
                    "showDate",
                    "startTime",
                    "endTime",
                    "ticketPrice",
                    "status",
                  ]}
                />
              </>
            )}

            {/* USERS */}
            {tab === "users" && (
              <DataTable
                title="Registered users"
                rows={users}
                cols={["id", "name", "email", "role"]}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function LayoutIcon() {
  return <span>▦</span>;
}

function DataTable({ title, rows = [], cols, onDelete, onStatusChange }) {
  return (
    <div className="card-panel table-panel">
      <h3>{title}</h3>

      {!rows.length ? (
        <p className="muted">No records returned by the API.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {cols.map((c) => (
                  <th key={c}>{c}</th>
                ))}
                {onDelete && <th>Action</th>}
                {onStatusChange && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id ?? i}>
                  {cols.map((c) => (
                    <td key={c}>{String(r[c] ?? "—")}</td>
                  ))}

                  {onStatusChange && (
                    <td>
                      <button
                        className="danger-link"
                        onClick={() => onStatusChange(r.id, r.status)}
                      >
                        {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  )}

                  {onDelete && (
                    <td>
                      <button
                        className="danger-link"
                        onClick={() => {
                          if (window.confirm("Delete this record?")) {
                            onDelete(r.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
