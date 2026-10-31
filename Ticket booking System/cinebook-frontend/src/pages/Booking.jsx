import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Armchair, Info, Ticket } from "lucide-react";
import { apiCall, endpoints } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage, Loading } from "../components/UI";

export default function Booking() {
  const { showId } = useParams();
  const nav = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch show details
  useEffect(() => {
    setLoading(true);

    apiCall("get", `${endpoints.shows}/${showId}`)
      .then(setShow)
      .catch((e) => setError(`Unable to load show: ${e.message}`))
      .finally(() => setLoading(false));
  }, [showId]);

  // Fetch seats
  useEffect(() => {
    setSeats([]);
    setSelected(null);

    apiCall("get", `${endpoints.shows}/${showId}/seats`)
      .then((data) => {
        const seatList = Array.isArray(data) ? data : data?.content || [];

        setSeats(seatList);
      })
      .catch((e) => {
        setError(`Unable to load seats: ${e.message}`);
      });
  }, [showId]);

  // Sort seats by physical seat number
  const sortedSeats = [...seats].sort((a, b) => {
    const seatA = a.seat?.seatNumber || a.seatNumber || "";
    const seatB = b.seat?.seatNumber || b.seatNumber || "";

    return seatA.localeCompare(seatB, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  const selectedSeat = seats.find((seat) => seat.id === selected);

  // Book selected seat
  const book = async () => {
    if (!isAuthenticated) {
      nav("/login");
      return;
    }

    const userId = user?.id;

    if (!userId) {
      setError("User ID is missing. Please check UserResponseDTO.");
      return;
    }

    if (!selected) {
      setError("Please select an available seat.");
      return;
    }

    try {
      setError("");

      const data = await apiCall(
        "post",
        endpoints.booking(userId, showId, selected),
      );

      nav("/booking-success", {
        state: { booking: data },
      });
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="page-section">
      <div className="page-title">
        <span className="eyebrow">RESERVE YOUR SEAT</span>

        <h1>
          Make it a <em>movie night.</em>
        </h1>

        <p>
          {show?.showDate} · {show?.startTime} · ₹{show?.ticketPrice} per ticket
        </p>
      </div>

      <div className="booking-panel">
        {/* Cinema Screen */}
        <div className="screen-visual">
          <div className="screen-glow" />
          SCREEN
        </div>

        {/* Seat Legend */}
        <div className="seat-legend">
          <span>
            <i className="seat-dot regular" /> Regular
          </span>

          <span>
            <i className="seat-dot premium" /> Premium
          </span>

          <span>
            <i className="seat-dot selected" /> Selected
          </span>

          <span>
            <i className="seat-dot booked" /> Booked
          </span>
        </div>

        {/* Seat Layout */}
        {sortedSeats.length > 0 ? (
          <div className="seat-grid">
            {sortedSeats.map((item) => {
              const id = item.id;

              const seatType = String(
                item.seat?.seatType || "REGULAR",
              ).toUpperCase();

              const booked =
                String(item.status || "").toUpperCase() !== "AVAILABLE";

              const isSelected = selected === id;

              const seatNumber = item.seat?.seatNumber || item.seatNumber || id;

              return (
                <button
                  key={id}
                  type="button"
                  disabled={booked}
                  className={`seat ${seatType.toLowerCase()} ${
                    booked ? "booked" : isSelected ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelected(id);
                    setError("");
                  }}
                  title={`${seatNumber} · ${seatType} · ${
                    booked ? "Booked" : `₹${item.price}`
                  }`}
                >
                  <Armchair size={16} />
                  {seatNumber}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="inventory-notice">
            <Info />

            <div>
              <strong>No seats found for this show</strong>

              <p>
                The seat inventory endpoint was contacted, but it returned no
                seat records. Check whether ShowSeat records exist for this
                show.
              </p>
            </div>
          </div>
        )}

        <ErrorMessage>{error}</ErrorMessage>

        {/* Booking Summary */}
        <div className="booking-bottom">
          <div>
            <span className="muted">Selected seat</span>

            <strong>
              {selectedSeat?.seat?.seatNumber ||
                selectedSeat?.seatNumber ||
                "None"}
            </strong>
          </div>

          <div>
            <span className="muted">Ticket price</span>

            <strong>₹{selectedSeat?.price ?? show?.ticketPrice ?? "—"}</strong>
          </div>

          <button
            className="button button-primary"
            disabled={!selected || !selectedSeat}
            onClick={book}
          >
            Confirm booking <Ticket size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
