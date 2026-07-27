import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";

import { logout } from "../actions";

export const dynamic = "force-dynamic";

type GarmentRecord = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  primary_color: string | null;
  material: string | null;
  image_path: string | null;
};

type OutfitItemRecord = {
  role: string;
  reason: string;
  position: number;

  garments:
    | GarmentRecord
    | GarmentRecord[]
    | null;
};

type SavedOutfitRecord = {
  id: string;
  title: string;
  occasion: string;
  style_preference: string | null;
  explanation: string;
  styling_tips: string[] | null;
  missing_pieces: string[] | null;
  created_at: string;
  outfit_items: OutfitItemRecord[] | null;
};

function getGarment(
  value:
    | GarmentRecord
    | GarmentRecord[]
    | null,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function formatOccasion(occasion: string) {
  return occasion
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function SavedOutfitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("outfits")
    .select(
      `
        id,
        title,
        occasion,
        style_preference,
        explanation,
        styling_tips,
        missing_pieces,
        created_at,
        outfit_items (
          role,
          reason,
          position,
          garments (
            id,
            name,
            category,
            brand,
            primary_color,
            material,
            image_path
          )
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const outfits =
    (data ?? []) as unknown as SavedOutfitRecord[];

  const imagePaths = Array.from(
    new Set(
      outfits.flatMap((outfit) =>
        (outfit.outfit_items ?? [])
          .map((item) => {
            const garment = getGarment(
              item.garments,
            );

            return garment?.image_path;
          })
          .filter(
            (path): path is string =>
              Boolean(path),
          ),
      ),
    ),
  );

  const signedImageEntries =
    await Promise.all(
      imagePaths.map(async (imagePath) => {
        const { data: signedData } =
          await supabase.storage
            .from("garment-images")
            .createSignedUrl(
              imagePath,
              60 * 60,
            );

        return [
          imagePath,
          signedData?.signedUrl ?? null,
        ] as const;
      }),
    );

  const imageUrls =
    new Map<string, string>();

  signedImageEntries.forEach(
    ([imagePath, imageUrl]) => {
      if (imageUrl) {
        imageUrls.set(
          imagePath,
          imageUrl,
        );
      }
    },
  );

  return (
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#c7a66a]" />

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
                Your outfits
              </p>
            </div>

            <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
              Saved outfits
            </h1>

            <p className="mt-4 text-[#a59d8e]">
              Review combinations generated from
              your virtual closet.
            </p>
          </div>

          <Link
            href="/dashboard/outfits"
            className="rounded-xl bg-[#e6d3ae] px-5 py-3 text-center font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
          >
            Generate a new outfit
          </Link>
        </div>

        {error && (
          <div className="mt-10 rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-5 text-[#e6b7b1]">
            Saved outfits could not be loaded:{" "}
            {error.message}
          </div>
        )}

        {!error && outfits.length === 0 && (
          <section className="mt-12 rounded-[2rem] border border-dashed border-white/[0.12] p-12 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
              No saved outfits yet
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-[#a59d8e]">
              Generate an outfit for an occasion
              and save it here for later.
            </p>

            <Link
              href="/dashboard/outfits"
              className="mt-7 inline-block rounded-xl bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
            >
              Generate outfit
            </Link>
          </section>
        )}

        {!error && outfits.length > 0 && (
          <div className="mt-12 space-y-12">
            {outfits.map((outfit) => {
              const outfitItems = [
                ...(outfit.outfit_items ?? []),
              ].sort(
                (firstItem, secondItem) =>
                  firstItem.position -
                  secondItem.position,
              );

              return (
                <article
                  key={outfit.id}
                  className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151410]"
                >
                  <header className="border-b border-white/[0.07] p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7a66a]">
                          {formatOccasion(
                            outfit.occasion,
                          )}
                        </p>

                        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                          {outfit.title}
                        </h2>

                        {outfit.style_preference && (
                          <p className="mt-2 text-sm text-[#777064]">
                            Style:{" "}
                            {
                              outfit.style_preference
                            }
                          </p>
                        )}
                      </div>

                      <time className="text-sm text-[#777064]">
                        {new Intl.DateTimeFormat(
                          "en-CA",
                          {
                            dateStyle:
                              "medium",
                          },
                        ).format(
                          new Date(
                            outfit.created_at,
                          ),
                        )}
                      </time>
                    </div>

                    <p className="mt-5 max-w-4xl leading-7 text-[#a59d8e]">
                      {outfit.explanation}
                    </p>
                  </header>

                  <div className="grid gap-6 p-7 sm:grid-cols-2 lg:grid-cols-3">
                    {outfitItems.map(
                      (outfitItem) => {
                        const garment =
                          getGarment(
                            outfitItem.garments,
                          );

                        if (!garment) {
                          return null;
                        }

                        const imageUrl =
                          garment.image_path
                            ? imageUrls.get(
                                garment.image_path,
                              )
                            : null;

                        return (
                          <Link
                            key={`${outfit.id}-${garment.id}`}
                            href={`/dashboard/items/${garment.id}`}
                            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f0d] transition hover:-translate-y-1 hover:border-[#c7a66a]/40"
                          >
                            <div className="aspect-square bg-[#201e18]">
                              {imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={
                                    garment.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#777064]">
                                  No photograph
                                </div>
                              )}
                            </div>

                            <div className="p-5">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c7a66a]">
                                {
                                  outfitItem.role
                                }
                              </p>

                              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                                {garment.name}
                              </h3>

                              <div className="mt-3 space-y-1 text-sm text-[#777064]">
                                {garment.primary_color && (
                                  <p>
                                    Colour:{" "}
                                    {
                                      garment.primary_color
                                    }
                                  </p>
                                )}

                                {garment.material && (
                                  <p>
                                    Material:{" "}
                                    {
                                      garment.material
                                    }
                                  </p>
                                )}
                              </div>

                              <p className="mt-4 border-t border-white/[0.07] pt-4 text-sm leading-6 text-[#a59d8e]">
                                {
                                  outfitItem.reason
                                }
                              </p>
                            </div>
                          </Link>
                        );
                      },
                    )}
                  </div>

                  {(
                    outfit.styling_tips ?? []
                  ).length > 0 && (
                    <section className="border-t border-white/[0.07] p-7">
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                        Styling tips
                      </h3>

                      <ul className="mt-4 space-y-3 text-[#a59d8e]">
                        {(
                          outfit.styling_tips ??
                          []
                        ).map(
                          (tip, index) => (
                            <li
                              key={`${outfit.id}-tip-${index}`}
                              className="flex gap-3"
                            >
                              <span className="text-[#c7a66a]">
                                •
                              </span>

                              <span>{tip}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </section>
                  )}

                  {(
                    outfit.missing_pieces ?? []
                  ).length > 0 && (
                    <section className="border-t border-[#c7a66a]/25 bg-[#c7a66a]/[0.06] p-7">
                      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#e6d3ae]">
                        Missing pieces
                      </h3>

                      <ul className="mt-4 space-y-2 text-[#a59d8e]">
                        {(
                          outfit.missing_pieces ??
                          []
                        ).map(
                          (piece, index) => (
                            <li
                              key={`${outfit.id}-missing-${index}`}
                            >
                              • {piece}
                            </li>
                          ),
                        )}
                      </ul>
                    </section>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}