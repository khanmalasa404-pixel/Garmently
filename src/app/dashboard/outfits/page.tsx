import Link from "next/link";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard-header";
import OutfitGenerator from "@/components/outfit-generator";
import { createClient } from "@/lib/supabase/server";

import { logout } from "../actions";

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
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#c7a66a]" />

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
            Occasion styling
          </p>
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
          Outfit generator
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-[#a59d8e]">
          Choose an occasion and Gemini will combine pieces already stored
          in your virtual closet.
        </p>

        <p className="mt-3 text-sm text-[#777064]">
          Closet items available: {count ?? 0}
        </p>

        {(count ?? 0) === 0 ? (
          <section className="mt-10 rounded-[2rem] border border-dashed border-white/[0.12] p-10 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
              Your closet is empty
            </h2>

            <p className="mt-3 text-[#a59d8e]">
              Add clothing before generating an
              outfit.
            </p>

            <Link
              href="/dashboard/add-item"
              className="mt-6 inline-block rounded-xl bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
            >
              Add clothing
            </Link>
          </section>
        ) : (
          <OutfitGenerator />
        )}
      </div>
    </main>
  );
}
