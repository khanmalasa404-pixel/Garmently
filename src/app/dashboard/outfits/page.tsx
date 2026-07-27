import Link from "next/link";
import { redirect } from "next/navigation";

import OutfitGenerator from "@/components/outfit-generator";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("garments")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to closet
        </Link>

        <p className="mt-10 text-sm uppercase tracking-widest text-neutral-500">
          Garmently
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Outfit generator
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-neutral-400">
          Choose an occasion and Gemini will
          combine pieces already stored in your
          virtual closet.
        </p>

        <p className="mt-3 text-sm text-neutral-500">
          Closet items available: {count ?? 0}
        </p>

        {(count ?? 0) === 0 ? (
          <section className="mt-10 rounded-3xl border border-dashed border-neutral-700 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Your closet is empty
            </h2>

            <p className="mt-3 text-neutral-400">
              Add clothing before generating an
              outfit.
            </p>

            <Link
              href="/dashboard/add-item"
              className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              Add clothing
            </Link>
          </section>
        ) : (
          <OutfitGenerator />
        )}
      </section>
    </main>
  );
}