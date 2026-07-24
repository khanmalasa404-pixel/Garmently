import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteGarment } from "./garment-actions";
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

  let garmentImageUrl: string | null = null;
  let careLabelImageUrl: string | null = null;

  if (garment.image_path) {
    const { data } = await supabase.storage
      .from("garment-images")
      .createSignedUrl(garment.image_path, 60 * 60);

    garmentImageUrl = data?.signedUrl ?? null;
  }

  if (garment.care_label_image_path) {
    const { data } = await supabase.storage
      .from("garment-images")
      .createSignedUrl(garment.care_label_image_path, 60 * 60);

    careLabelImageUrl = data?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to closet
        </Link>

        {query.error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">
            {query.error}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
              {garmentImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={garmentImageUrl}
                  alt={garment.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-neutral-500">
                  No clothing photograph
                </div>
              )}
            </div>

            {careLabelImageUrl && (
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-500">
                  Care label
                </p>

                <div className="overflow-hidden rounded-2xl border border-neutral-800">
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
            <p className="text-sm capitalize text-neutral-500">
              {garment.category}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {garment.name}
            </h1>

            <div className="mt-8 divide-y divide-neutral-800 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
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

            <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Washing instructions
              </p>

              <p className="mt-3 leading-7 text-neutral-300">
                {garment.washing_instructions ||
                  "No washing instructions have been added."}
              </p>
            </section>

            <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Detergent recommendation
              </p>

              <p className="mt-3 leading-7 text-neutral-300">
                {garment.detergent_recommendation ||
                  "No detergent recommendation has been added."}
              </p>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/dashboard/items/${garment.id}/edit`}
                className="rounded-xl bg-white px-6 py-3 text-center font-semibold text-black hover:bg-neutral-200"
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
                  className="w-full rounded-xl border border-red-900 px-6 py-3 font-semibold text-red-300 hover:bg-red-950/40"
                >
                  Delete item
                </button>
              </form>
            </div>

            <p className="mt-4 text-xs text-neutral-600">
              The delete button immediately removes the garment and its
              uploaded images.
            </p>
          </div>
        </div>
      </section>
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
      <span className="text-neutral-500">{label}</span>

      <span className="text-right font-medium">
        {value || "Not provided"}
      </span>
    </div>
  );
}