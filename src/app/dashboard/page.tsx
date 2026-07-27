import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";

import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: garments, error } = await supabase
    .from("garments")
    .select(
      `
        id,
        name,
        category,
        brand,
        primary_color,
        material,
        image_path,
        washing_instructions,
        detergent_recommendation,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  const garmentsWithImages = await Promise.all(
    (garments ?? []).map(async (garment) => {
      if (!garment.image_path) {
        return {
          ...garment,
          imageUrl: null,
        };
      }

      const { data } = await supabase.storage
        .from("garment-images")
        .createSignedUrl(
          garment.image_path,
          60 * 60,
        );

      return {
        ...garment,
        imageUrl: data?.signedUrl ?? null,
      };
    }),
  );

  return (
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        itemCount={garmentsWithImages.length}
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151410] px-6 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c7a66a]/10 blur-3xl" />

          <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-white/[0.025] blur-3xl" />

          <div className="absolute right-8 top-8 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-black/20 px-4 py-2 backdrop-blur-md sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#8fa98a] shadow-[0_0_12px_rgba(143,169,138,0.65)]" />

            <span className="text-xs font-medium text-[#a59d8e]">
              Closet synchronized
            </span>
          </div>

          <div className="absolute bottom-[-2.5rem] right-8 hidden select-none font-[family-name:var(--font-display)] text-[15rem] font-semibold leading-none text-white/[0.018] lg:block">
            G
          </div>

          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#c7a66a]" />

              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
                Personal wardrobe
              </p>
            </div>

            <h1 className="mt-7 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              Dress with
              <span className="block italic text-[#e6d3ae]">
                intention.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#a59d8e] sm:text-lg">
              Curate your closet, protect every garment, and create
              thoughtful outfits using pieces you already own.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/dashboard/add-item"
                className="group inline-flex items-center gap-3 rounded-full bg-[#e6d3ae] px-6 py-3 text-sm font-semibold text-[#17130d] transition hover:bg-[#f4e5c8]"
              >
                Add a garment

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/dashboard/outfits"
                className="inline-flex items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm font-semibold text-[#e8e1d6] transition hover:border-[#c7a66a]/40 hover:bg-[#c7a66a]/10"
              >
                Create an outfit

                <span className="text-[#c7a66a]">
                  ✦
                </span>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/[0.07] pt-6">
              <HeroStat
                value={garmentsWithImages.length}
                label={
                  garmentsWithImages.length === 1
                    ? "Garment"
                    : "Garments"
                }
              />

              <HeroStat
                value="AI"
                label="Care analysis"
              />

              <HeroStat
                value="Private"
                label="Image storage"
              />
            </div>
          </div>
        </section>

        {error && (
          <section className="mt-8 rounded-2xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-5 text-[#e6b7b1]">
            <p className="font-semibold">
              Your closet could not be loaded
            </p>

            <p className="mt-2 text-sm">
              {error.message}
            </p>
          </section>
        )}

        {!error && garmentsWithImages.length === 0 && (
          <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-dashed border-white/[0.12] bg-[#131310] px-6 py-16 text-center sm:px-12">
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#c7a66a]/10 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c7a66a]/25 bg-[#c7a66a]/[0.07]">
                <svg
                  viewBox="0 0 48 48"
                  className="h-9 w-9"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 10.5C24 7.5 26.2 5.5 29 5.5C31.7 5.5 34 7.6 34 10.3C34 13.6 31.8 15.1 29.3 16.6L27.8 17.5"
                    stroke="#E6D3AE"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M24 16.5L9.5 30.5C8.1 31.9 9.1 34.3 11.1 34.3H36.9C38.9 34.3 39.9 31.9 38.5 30.5L24 16.5Z"
                    stroke="#C7A66A"
                    strokeWidth="2.3"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7042]">
                Your collection
              </p>

              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
                Begin your wardrobe.
              </h2>

              <p className="mx-auto mt-5 max-w-lg leading-7 text-[#a59d8e]">
                Upload your first piece to receive care guidance and begin
                creating outfits from your own closet.
              </p>

              <Link
                href="/dashboard/add-item"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] transition hover:bg-[#f4e5c8]"
              >
                Add your first garment
                <span>→</span>
              </Link>
            </div>
          </section>
        )}

        {!error && garmentsWithImages.length > 0 && (
          <section className="mt-14">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8d7042]">
                  Your collection
                </p>

                <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
                  The wardrobe
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#777064]">
                  Explore your garments, review their care information, or
                  select pieces for your next outfit.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-[#777064]">
                  {garmentsWithImages.length}{" "}
                  {garmentsWithImages.length === 1
                    ? "garment"
                    : "garments"}
                </span>

                <span className="h-px w-14 bg-[#c7a66a]/50" />
              </div>
            </div>

            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {garmentsWithImages.map((garment) => (
                <Link
                  key={garment.id}
                  href={`/dashboard/items/${garment.id}`}
                  className="group block overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-[#151410] transition duration-500 hover:-translate-y-1.5 hover:border-[#c7a66a]/30 hover:shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
                >
                  <article>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#201e18]">
                      {garment.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={garment.imageUrl}
                          alt={garment.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#777064]">
                          No photograph
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />

                      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                        {garment.category}
                      </div>

                      <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-[#e6d3ae] backdrop-blur-md transition group-hover:border-[#c7a66a]/50 group-hover:bg-[#c7a66a]/20">
                        →
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-[#f4efe6]">
                            {garment.name}
                          </h3>

                          {garment.brand && (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8d7042]">
                              {garment.brand}
                            </p>
                          )}
                        </div>

                        {garment.primary_color && (
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-[#a59d8e]">
                            {garment.primary_color}
                          </span>
                        )}
                      </div>

                      {garment.material && (
                        <p className="mt-5 text-sm leading-6 text-[#8f877a]">
                          {garment.material}
                        </p>
                      )}

                      {garment.washing_instructions && (
                        <div className="mt-5 border-t border-white/[0.07] pt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[#c7a66a]">
                              ✦
                            </span>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#777064]">
                              Care guide available
                            </p>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#a59d8e]">
                            {garment.washing_instructions}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                        <span className="text-xs uppercase tracking-[0.18em] text-[#777064]">
                          View details
                        </span>

                        <span className="text-sm text-[#c7a66a] transition group-hover:translate-x-1">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}

              <Link
                href="/dashboard/add-item"
                className="group flex min-h-[32rem] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/[0.12] bg-white/[0.015] p-8 text-center transition hover:border-[#c7a66a]/35 hover:bg-[#c7a66a]/[0.04]"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c7a66a]/25 bg-[#c7a66a]/[0.07] text-2xl text-[#c7a66a] transition group-hover:scale-105 group-hover:bg-[#c7a66a]/15">
                  +
                </span>

                <h3 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold">
                  Add another piece
                </h3>

                <p className="mt-3 max-w-xs text-sm leading-6 text-[#777064]">
                  Photograph a garment and let AI help organize its details
                  and care instructions.
                </p>
              </Link>
            </div>
          </section>
        )}
      </div>

      <footer className="mt-20 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-[#5f594f] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
  <span className="font-semibold text-[#f4efe6]">
    GARMENT
  </span>
  <span className="font-semibold text-[#c7a66a]">
    Ly
  </span>
  <span> · Dress with intention</span>
</p>
          <p>Your wardrobe remains private to your account.</p>
        </div>
      </footer>
    </main>
  );
}

type HeroStatProps = {
  value: string | number;
  label: string;
};

function HeroStat({
  value,
  label,
}: HeroStatProps) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#e6d3ae]">
        {value}
      </p>

      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#777064]">
        {label}
      </p>
    </div>
  );
}