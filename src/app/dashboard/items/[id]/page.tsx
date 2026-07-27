import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { deleteGarment } from "./garment-actions";

import { logout } from "../../actions";

type GarmentPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function GarmentPage({
  params,
  searchParams,
}: GarmentPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: garment, error } = await supabase
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
        catalog_image_path,
        care_label_image_path,
        washing_instructions,
        detergent_recommendation,
        created_at
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !garment) {
    notFound();
  }

  let heroImageUrl: string | null = null;
  let originalImageUrl: string | null = null;
  let careLabelImageUrl: string | null = null;

  const heroImagePath =
    garment.catalog_image_path ?? garment.image_path;

  if (heroImagePath) {
    const { data } = await supabase.storage
      .from("garment-images")
      .createSignedUrl(heroImagePath, 60 * 60);

    heroImageUrl = data?.signedUrl ?? null;
  }

  if (garment.catalog_image_path && garment.image_path) {
    const { data } = await supabase.storage
      .from("garment-images")
      .createSignedUrl(garment.image_path, 60 * 60);

    originalImageUrl = data?.signedUrl ?? null;
  }

  if (garment.care_label_image_path) {
    const { data } = await supabase.storage
      .from("garment-images")
      .createSignedUrl(garment.care_label_image_path, 60 * 60);

    careLabelImageUrl = data?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#a59d8e] hover:text-[#f4efe6]"
        >
          ← Back to closet
        </Link>

        {query.error && (
          <div className="mt-8 rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-4 text-[#e6b7b1]">
            {query.error}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151410]">
              {heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImageUrl}
                  alt={garment.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-[#777064]">
                  No clothing photograph
                </div>
              )}
            </div>

            {originalImageUrl && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7042]">
                  Original photograph
                </p>

                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalImageUrl}
                    alt={`Original photograph of ${garment.name}`}
                    className="w-full object-cover"
                  />
                </div>
              </div>
            )}

            {careLabelImageUrl && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7042]">
                  Care label
                </p>

                <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={careLabelImageUrl}
                    alt={`Care label for ${garment.name}`}
                    className="w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c7a66a]">
              {garment.category}
            </p>

            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
              {garment.name}
            </h1>

            <div className="mt-8 divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151410]">
              <DetailRow
                label="Brand"
                value={garment.brand}
              />

              <DetailRow
                label="Colour"
                value={garment.primary_color}
              />

              <DetailRow
                label="Material"
                value={garment.material}
              />
            </div>

            <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#151410] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7042]">
                Washing instructions
              </p>

              <p className="mt-3 leading-7 text-[#a59d8e]">
                {garment.washing_instructions ||
                  "No washing instructions have been added."}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#151410] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8d7042]">
                Detergent recommendation
              </p>

              <p className="mt-3 leading-7 text-[#a59d8e]">
                {garment.detergent_recommendation ||
                  "No detergent recommendation has been added."}
              </p>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/dashboard/items/${garment.id}/edit`}
                className="rounded-xl bg-[#e6d3ae] px-6 py-3 text-center font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
              >
                Edit item
              </Link>

              <form action={deleteGarment}>
                <input
                  type="hidden"
                  name="garmentId"
                  value={garment.id}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl border border-[#c87a72]/40 px-6 py-3 font-semibold text-[#e6b7b1] hover:bg-[#c87a72]/10"
                >
                  Delete item
                </button>
              </form>
            </div>

            <p className="mt-4 text-xs text-[#5f594f]">
              The delete button immediately removes the garment and its
              uploaded images.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

type DetailRowProps = {
  label: string;
  value: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 p-5">
      <span className="text-[#777064]">{label}</span>

      <span className="text-right font-medium text-[#e8e1d6]">
        {value || "Not provided"}
      </span>
    </div>
  );
}
