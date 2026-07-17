import { useState } from "react";
import { supabase } from "../lib/supabase";
import ImageUploader from "./ImageUploader";
import GuestCounter from "./GuestCounter";

export default function ListingForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Debes iniciar sesión para publicar una propiedad.");
      setSubmitting(false);
      return;
    }

    if (!title || !price || !country) {
      setError("Título, precio y país son obligatorios.");
      setSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Ingresa un precio válido.");
      setSubmitting(false);
      return;
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        host_id: userData.user.id,
        title,
        description,
        price: parsedPrice,
        currency,
        country,
        city,
        address,
        max_guests: maxGuests,
        status: "active",
      })
      .select()
      .single();

    if (listingError || !listing) {
      setError(`Error creando la propiedad: ${listingError?.message}`);
      setSubmitting(false);
      return;
    }

    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, index) => ({
        listing_id: listing.id,
        url,
        order_index: index,
      }));

      const { error: imagesError } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imagesError) {
        setError(`Propiedad creada, pero hubo un error con las imágenes: ${imagesError.message}`);
        setSubmitting(false);
        return;
      }
    }

    setSuccess(true);
    setSubmitting(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setCountry("");
    setCity("");
    setAddress("");
    setMaxGuests(1);
    setImageUrls([]);
  }

  // Clases base SIN ancho — el ancho se agrega aparte en cada input
  const fieldBase =
    "rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow";
  const inputClass = `w-full ${fieldBase}`;
  const labelClass = "block text-sm font-semibold text-neutral-900 mb-1.5";

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Publica tu espacio
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Completa los detalles y súbelo en minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-5">
          <div>
            <label className={labelClass}>Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Depto luminoso cerca de la playa"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntale a tus huéspedes qué hace especial este lugar..."
              className={`${inputClass} resize-none`}
              rows={4}
            />
          </div>
        </section>

        <hr className="border-neutral-200" />

        {/* Precio — corregido: ancho separado, sin choque de clases */}
        <section>
          <label className={labelClass}>Precio por noche</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, "");
                  setPrice(cleaned);
                }}
                placeholder="0"
                className={`w-full ${fieldBase} pl-8`}
                required
              />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-28 shrink-0 ${fieldBase}`}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </section>

        <hr className="border-neutral-200" />

        <section className="space-y-5">
          <p className="text-sm font-semibold text-neutral-900">Ubicación</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>País</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ecuador"
                className={inputClass}
                required
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Quito"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Dirección</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle y número"
              className={inputClass}
            />
          </div>

          <GuestCounter value={maxGuests} onChange={setMaxGuests} />
        </section>

        <hr className="border-neutral-200" />

        <section>
          <ImageUploader
            onImagesUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])}
          />
        </section>

        {error && (
          <div className="rounded-xl bg-[#FFF0F1] border border-[#FFD3D8] px-4 py-3">
            <p className="text-sm text-[#FF385C] font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-[#F0FAF0] border border-[#CDEECB] px-4 py-3">
            <p className="text-sm text-[#008A05] font-medium">
              ¡Propiedad publicada con éxito!
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-xl px-4 py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Publicando..." : "Publicar propiedad"}
        </button>
      </form>
    </div>
  );
}