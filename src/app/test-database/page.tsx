import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TestDatabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_status")
    .select("message")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
          Database test
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Supabase Connection
        </h1>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">
            <p className="font-semibold text-red-300">
              Connection failed
            </p>

            <p className="mt-2 break-words text-sm text-red-200">
              {error.message}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-green-900 bg-green-950/40 p-4">
            <p className="font-semibold text-green-300">
              Connection successful
            </p>

            <p className="mt-2 text-green-100">
              {data?.message}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}