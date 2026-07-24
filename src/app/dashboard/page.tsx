import Link from "next/link";
import { redirect } from "next/navigation";
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
    .order("created_at", { ascending: false });

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
        .createSignedUrl(garment.image_path, 60 * 60);

      return {
        ...garment,
        imageUrl: data?.signedUrl ?? null,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <nav className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-400">
            Wardrobe AI
          </p>

          <h1 className="text-2xl font-bold">
            My Closet
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/add-item"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200"
          >
            Add item
          </Link>

          <form action={logout}>
            <button className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-900">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {error && (
        <section className="mx-auto mt-10 max-w-6xl rounded-xl border border-red-900 bg-red-950/40 p-5 text-red-200">
          Your closet could not be loaded: {error.message}
        </section>
      )}

      {!error && garmentsWithImages.length === 0 && (
        <section className="mx-auto mt-16 max-w-6xl rounded-3xl border border-dashed border-neutral-700 p-12 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-500">
            Signed in as
          </p>

          <p className="mt-2 font-medium">
            {user.email}
          </p>

          <h2 className="mt-10 text-3xl font-bold">
            Your closet is empty
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-neutral-400">
            Upload your clothing, save its care instructions, and begin
            building your virtual wardrobe.
          </p>

          <Link
            href="/dashboard/add-item"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
          >
            Add your first item
          </Link>
        </section>
      )}

      {!error && garmentsWithImages.length > 0 && (
        <section className="mx-auto mt-12 max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm text-neutral-500">
                {garmentsWithImages.length}{" "}
                {garmentsWithImages.length === 1 ? "item" : "items"}
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                Your wardrobe
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {garmentsWithImages.map((garment) => (
              <Link
                key={garment.id}
                href={`/dashboard/items/${garment.id}`}
                className="block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:-translate-y-1 hover:border-neutral-600"
              >
                <article>
                  <div className="aspect-square bg-neutral-800">
                    {garment.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={garment.imageUrl}
                        alt={garment.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-500">
                        No photograph
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm capitalize text-neutral-500">
                      {garment.category}
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                      {garment.name}
                    </h3>

                    <div className="mt-4 space-y-1 text-sm text-neutral-400">
                      {garment.brand && (
                        <p>Brand: {garment.brand}</p>
                      )}

                      {garment.primary_color && (
                        <p>Colour: {garment.primary_color}</p>
                      )}

                      {garment.material && (
                        <p>Material: {garment.material}</p>
                      )}
                    </div>

                    {garment.washing_instructions && (
                      <div className="mt-5 border-t border-neutral-800 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Clothing care
                        </p>

                        <p className="mt-2 text-sm leading-6 text-neutral-300">
                          {garment.washing_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}