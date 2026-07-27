import { redirect } from "next/navigation";
import AddGarmentForm from "@/components/add-garment-form";
import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";

import { logout } from "../actions";

export default async function AddItemPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#c7a66a]" />

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
            New garment
          </p>
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
          Add a clothing item
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-[#a59d8e]">
          Photograph the garment, let Gemini suggest the details, and
          optionally generate a clean catalog-style photo before saving it
          to your closet.
        </p>

        <AddGarmentForm />
      </div>
    </main>
  );
}
