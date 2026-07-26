"use client";
import SaveOutfitButton from "@/components/save-outfit-button";
import { FormEvent, useState } from "react";

type OutfitItem = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  primaryColor: string | null;
  material: string | null;
  imageUrl: string | null;
  role: string;
  reason: string;
};

type GeneratedOutfit = {
  title: string;
  occasion: string;
  explanation: string;
  stylingTips: string[];
  missingPieces: string[];
  items: OutfitItem[];
};

export default function OutfitGenerator() {
  const [occasion, setOccasion] =
    useState("casual-outing");

  const [
    stylePreference,
    setStylePreference,
  ] = useState("");

  const [outfit, setOutfit] =
    useState<GeneratedOutfit | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setOutfit(null);
    setErrorMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch(
        "/api/generate-outfit",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            occasion,
            stylePreference,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The outfit could not be generated.",
        );
      }

      setOutfit(data.outfit);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The outfit could not be generated.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mt-10">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
      >
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="occasion"
              className="mb-2 block font-medium"
            >
              Occasion
            </label>

            <select
              id="occasion"
              value={occasion}
              disabled={isGenerating}
              onChange={(event) =>
                setOccasion(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
            >
              <option value="casual-outing">
                Casual outing
              </option>

              <option value="work">
                Work
              </option>

              <option value="dinner">
                Dinner
              </option>

              <option value="formal-event">
                Formal event
              </option>

              <option value="wedding">
                Wedding
              </option>

              <option value="date-night">
                Date night
              </option>

              <option value="gym">
                Gym
              </option>

              <option value="travel">
                Travel
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="stylePreference"
              className="mb-2 block font-medium"
            >
              Style preference
              <span className="ml-2 text-neutral-500">
                Optional
              </span>
            </label>

            <input
              id="stylePreference"
              value={stylePreference}
              disabled={isGenerating}
              maxLength={200}
              onChange={(event) =>
                setStylePreference(
                  event.target.value,
                )
              }
              placeholder="Old money, minimalist, streetwear..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating
            ? "Building your outfit..."
            : "Generate outfit"}
        </button>
      </form>

      {outfit && (
        <section className="mt-10">
          <div className="rounded-3xl border border-violet-900 bg-violet-950/20 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
              Generated outfit
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {outfit.title}
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
              {outfit.explanation}
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {outfit.items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
              >
                <div className="aspect-square bg-neutral-800">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-500">
                      No photograph
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                    {item.role}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    {item.name}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm text-neutral-400">
                    {item.brand && (
                      <p>Brand: {item.brand}</p>
                    )}

                    {item.primaryColor && (
                      <p>
                        Colour:{" "}
                        {item.primaryColor}
                      </p>
                    )}

                    {item.material && (
                      <p>
                        Material: {item.material}
                      </p>
                    )}
                  </div>

                  <p className="mt-5 border-t border-neutral-800 pt-4 text-sm leading-6 text-neutral-300">
                    {item.reason}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {outfit.stylingTips.length > 0 && (
            <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="text-xl font-semibold">
                Styling tips
              </h3>

              <ul className="mt-4 space-y-3 text-neutral-300">
                {outfit.stylingTips.map(
                  (tip, index) => (
                    <li
                      key={`${tip}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="text-violet-300">
                        •
                      </span>

                      <span>{tip}</span>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}

          {outfit.missingPieces.length > 0 && (
            <section className="mt-6 rounded-2xl border border-amber-900 bg-amber-950/20 p-6">
              <h3 className="text-xl font-semibold text-amber-200">
                Missing from your closet
              </h3>

              <p className="mt-2 text-sm text-neutral-400">
                These pieces would help complete
                the requested outfit:
              </p>

              <ul className="mt-4 space-y-2 text-neutral-300">
                {outfit.missingPieces.map(
                  (piece, index) => (
                    <li
                      key={`${piece}-${index}`}
                    >
                      • {piece}
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}
            <SaveOutfitButton
                outfit={outfit}
                stylePreference={stylePreference}
            />
          <button
            type="button"
            onClick={() => {
              setOutfit(null);
              setErrorMessage("");
            }}
            className="mt-8 rounded-xl border border-neutral-700 px-6 py-3 font-semibold hover:bg-neutral-900"
          >
            Generate another outfit
          </button>
        </section>
      )}
    </div>
  );
}