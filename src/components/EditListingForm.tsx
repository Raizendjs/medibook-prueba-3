import { useState } from "react";
import { supabase } from "../lib/supabase";
import ImageUploader from "./ImageUploader";
import GuestCounter from "./GuestCounter";

interface ExistingImage {
  id: string;
  url: string;
}

interface EditListingFormProps {
  listingId: string;
  initial: {
    title: string;
    description: string | null;
    price: number;
    currency: string;
    country: string;
    city: string | null;
    address: string | null;
    max_guests: number | null;
  };
  initialImages: ExistingImage[];
}

export default function EditListingForm({
  listingId,
  initial,
  initialImages,
}: EditListingFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState(String(initial.price));
  const [currency, setCurrency] = useState(initial.currency);
  const [country, setCountry] = useState(initial.country);
  const [city, setCity] = useState(initial.city ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [maxGuests, setMaxGuests] = useState(initial.max_guests ?? 1);
  const [images, setImages] = useState(initialImages);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function removeExistingImage(imageId: string) {
    const { error: deleteError } = await supabase
      .from("listing_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      setError("No se pudo quitar la imagen.");
      return;
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const parsedPrice = parseFloat(price);
    if (!title || isNaN(parsedPrice) || parsedPrice <= 0 || !country) {
      setError("Título, precio válido y país son obligatorios.");
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        title,
        description,
        price: parsedPrice,
        currency,
        country,
        city,
        address,
        max_guests: maxGuests,
      })
      .eq("id", listingId);

    if (updateError) {
      setError(`Error guardando cambios: ${updateError.message}`);
      setSubmitting(false);
      return;
    }

    if (newImageUrls.length > 0) {
      const startIndex = images.length;
      const imageRows = newImageUrls.map((url, index) => ({
        listing_id: listingId,
        url,
        order_index: startIndex + index,
      }));

      const { error: imagesError } = await supabase
        .from("listing_images")
        .insert(imageRows);

      if (imagesError) {
        setError(`Cambios guardados, pero hubo un error con las imágenes nuevas: ${imagesError.message}`);
        setSubmitting(false);
        return;
      }
    }

    setSuccess(true);
    setSubmitting(false);
    setNewImageUrls([]);
  }

  const fieldBase =
    "rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow";
  const inputClass = `w-full ${fieldBase}`;
  const labelClass = "block text-sm font-semibold text-neutral-900 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-5">
        <div>
          <label className={labelClass}>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            rows={4}
          />
        </div>
      </section>

      <hr className="border-neutral-200" />

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
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
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
            className={inputClass}
          />
        </div>

        <GuestCounter value={maxGuests} onChange={setMaxGuests} />
      </section>

      <hr className="border-neutral-200" />

      <section>
        <label className="block text-sm font-semibold text-neutral-900 mb-3">
          Fotos actuales
        </label>
        {images.length === 0 ? (
          <p className="text-sm text-neutral-500 mb-4">No tienes fotos todavía.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <ImageUploader
          onImagesUploaded={(urls) => setNewImageUrls((prev) => [...prev, ...urls])}
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
            ¡Cambios guardados con éxito!
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold rounded-xl px-4 py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}