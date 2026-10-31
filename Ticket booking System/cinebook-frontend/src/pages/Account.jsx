import { useEffect, useState } from "react";
import { apiCall, endpoints } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage, Loading } from "../components/UI";

export function Profile() {
  const { user, refreshProfile, setUser } = useAuth();

  const [form, setForm] = useState({ name: user?.name || "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    refreshProfile()
      .then((d) => setForm({ name: d.name || "" }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const d = await apiCall("put", endpoints.me, form);
      setUser(d);
      localStorage.setItem("cinebook_user", JSON.stringify(d));
      setSuccess("Profile updated.");
    } catch (x) {
      setError(x.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="narrow-section page-section">
      <div className="page-title">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1>
          Profile <em>settings.</em>
        </h1>
      </div>

      <form className="admin-form card-panel" onSubmit={save}>
        <label>
          Full name
          <input
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            required
          />
        </label>

        <label>
          Email
          <input value={user?.email || ""} disabled />
        </label>

        <ErrorMessage>{error}</ErrorMessage>
        {success && <div className="alert alert-success">{success}</div>}

        <button className="button button-primary">Save changes</button>
      </form>
    </section>
  );
}

export function MyBookings() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        setError("User ID missing. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const data = await apiCall("get", endpoints.bookings(user.id));
        const bookingList = Array.isArray(data) ? data : data?.content || [];

        const bookingsWithShows = await Promise.all(
          bookingList.map(async (booking) => {
            if (!booking.showId) return booking;

            try {
              const show = await apiCall(
                "get",
                `${endpoints.shows}/${booking.showId}`,
              );
              return { ...booking, show };
            } catch {
              return booking;
            }
          }),
        );

        setRows(bookingsWithShows);
      } catch (e) {
        setError(e.message || "Unable to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id]);

  if (loading) return <Loading />;

  return (
    <section className="page-section">
      <div className="page-title">
        <span className="eyebrow">YOUR TICKETS</span>
        <h1>
          My <em>bookings.</em>
        </h1>
        <p>Signed in as {user?.email}</p>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      {!error && rows.length === 0 && (
        <div className="inventory-notice">
          <p>You haven't booked any tickets yet.</p>
          <a href="/movies" className="button button-primary">
            Explore movies
          </a>
        </div>
      )}

      <div className="booking-history">
        {rows.map((booking) => (
          <div className="card-panel" key={booking.id}>
            <span className="eyebrow">YOUR BOOKING</span>
            <h2>{booking.show?.movieTitle || `Show #${booking.showId}`}</h2>
            <p>{booking.show?.theatreName || "Theatre details unavailable"}</p>
            <p>
              <strong>Reference:</strong> {booking.bookingReference || "—"}
            </p>
            <p>
              <strong>Booking ID:</strong> {booking.id}
            </p>
            <p>
              <strong>Show date:</strong> {booking.show?.showDate || "—"}
            </p>
            <p>
              <strong>Show time:</strong> {booking.show?.startTime || "—"}
            </p>
            <p>
              <strong>Amount:</strong> ₹{booking.totalAmount ?? "—"}
            </p>
            <p>
              <strong>Status:</strong> {booking.status || "—"}
            </p>
            <p>
              <strong>Booked on:</strong>{" "}
              {booking.bookingDateTime
                ? new Date(booking.bookingDateTime).toLocaleString()
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BookingSuccess() {
  return (
    <section className="success-page">
      <div className="success-icon">✓</div>
      <span className="eyebrow">YOU'RE ALL SET</span>
      <h1>
        Enjoy the <em>show.</em>
      </h1>
      <p>Your booking request was accepted by the server.</p>
      <a className="button button-primary" href="/movies">
        Explore more movies
      </a>
    </section>
  );
}
    