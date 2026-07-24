import Link from "next/link";
import { redirect } from "next/navigation";
import AddGarmentForm from "@/components/add-garment-form";
import { createClient } from "@/lib/supabase/server";

export default async function AddItemPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to closet
        </Link>

        <p className="mt-10 text-sm uppercase tracking-widest text-neutral-500">
          Wardrobe AI
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Add a clothing item
        </h1>

        <p className="mt-4 max-w-2xl text-neutral-400">
          Upload a photograph and record the clothing details. Automatic AI
          analysis will be added after the basic upload system is working.
        </p>

        <AddGarmentForm />
      </section>
    </main>
  );
}