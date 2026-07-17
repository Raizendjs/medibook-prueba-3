import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import GuestCounter from "./GuestCounter";

interface BookingWidgetProps {
  listingId: string;
  price: number;
  currency: string;
  maxGuests: number;
}

interface BookedRange {
  check_in: string;
  check_out: string;
}

export default function BookingWidget({
  listingId,
  price,
  currency,
  maxGuests,
}: BookingWidgetProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loadingRanges, setLoadingRanges] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadBookedDates() {
      const { data } = await supabase
        .from("bookings")
        .select("check_in, check_out")
        .eq("listing_id", listingId)
        .neq("status", "cancelled");

      setBookedRanges(data ?? []);
      setLoadingRanges(false);
    }
    loadBookedDates();
  }, [listingId]);

  function rangesOverlap(inA: string, outA: string, inB: string, outB: string) {
    return inA < outB && inB < outA;
  }

  function hasOverlap(): boolean {
    if (!checkIn || !checkOut) return false;
    return bookedRanges.some((r) =>
      rangesOverlap(checkIn, checkOut, r.check_in, r.check_out)
    );
  }

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const total = nights * price;

  async function handleBook() {
    setError(null);
    setSuccess(false);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Elige fecha de entrada y salida.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("La fecha de salida debe ser después de la entrada.");
      return;
    }

    if (hasOverlap()) {
      setError("Esas fechas ya están reservadas. Elige otras.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("bookings").insert({
      listing_id: listingId,
      user_id: userData.user.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: total,
      status: "pending",
    });

    if (insertError) {
      // el constraint exclude de la base también protege contra solapamientos
      if (insertError.message.includes("exclude") || insertError.code === "23P01") {
        setError("Esas fechas se acaban de reservar. Elige otras.");
      } else {
        setError(`Error al reservar: ${insertError.message}`);
      }
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
    setBookedRanges((prev) => [...prev, { check_in: checkIn, check_out: checkOut }]);
    setCheckIn("");
    setCheckOut("");
  }

  const inputClass =
    "w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow";

  return (
    <div className="sticky top-6 rounded-2xl border border-neutral-200 shadow-lg p-6">
      <p className="text-lg font-semibold text-neutral-900">
        {currency} {price}{" "}
        <span className="text-sm font-normal text-neutral-500">/ noche</span>
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Entrada
          </label>
          <input
            type="date"
            value={checkIn}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Salida
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || new Date().toISOString().split("T")[0]}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3">
        <GuestCounter value={guests} onChange={setGuests} min={1} max={maxGuests} />
      </div>

      {loadingRanges && (
        <p className="text-xs text-neutral-400 mt-3">Cargando disponibilidad...</p>
      )}

      {!loadingRanges && hasOverlap() && (
        <p className="text-xs text-[#FF385C] mt-3">
          Esas fechas ya están ocupadas.
        </p>
      )}

      {nights > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200 space-y-1">
          <div className="flex justify-between text-sm text-neutral-700">
            <span>
              {currency} {price} x {nights} {nights === 1 ? "noche" : "noches"}
            </span>
            <span>{currency} {total}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-1">
            <span>Total</span>
            <span>{currency} {total}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-[#FFF0F1] border border-[#FFD3D8] px-3 py-2">
          <p className="text-xs text-[#FF385C] font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl bg-[#F0FAF0] border border-[#CDEECB] px-3 py-2">
          <p className="text-xs text-[#008A05] font-medium">
            ¡Reserva enviada! Está pendiente de confirmación.
          </p>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={submitting || loadingRanges}
        className="w-full mt-4 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Reservando..." : "Reservar"}
      </button>
    </div>
  );
}