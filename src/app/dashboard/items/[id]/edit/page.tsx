import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard-header";
import { createClient } from "@/lib/supabase/server";
import { updateGarment } from "./actions";

import { logout } from "../../../actions";

type EditGarmentPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditGarmentPage({
  params,
  searchParams,
}: EditGarmentPageProps) {
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
        washing_instructions,
        detergent_recommendation
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !garment) {
    notFound();
  }

  return (
    <main className="min-h-screen text-[#f4efe6]">
      <DashboardHeader
        userEmail={user.email}
        logoutAction={logout}
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link
          href={`/dashboard/items/${garment.id}`}
          className="text-sm text-[#a59d8e] hover:text-[#f4efe6]"
        >
          ← Cancel editing
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px w-10 bg-[#c7a66a]" />

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
            Edit garment
          </p>
        </div>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
          Edit clothing item
        </h1>

        <p className="mt-4 leading-7 text-[#a59d8e]">
          Correct the clothing information and care instructions.
        </p>

        {query.error && (
          <div className="mt-8 rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-4 text-[#e6b7b1]">
            {query.error}
          </div>
        )}

        <form
          action={updateGarment}
          className="mt-10 space-y-8 rounded-[2rem] border border-white/[0.08] bg-[#151410] p-8"
        >
          <input
            type="hidden"
            name="garmentId"
            value={garment.id}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              id="name"
              label="Item name"
              defaultValue={garment.name}
              required
            />

            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-medium"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                required
                defaultValue={garment.category}
                className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="outerwear">Outerwear</option>
                <option value="dress">Dress</option>
                <option value="footwear">Footwear</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </select>
            </div>

            <FormField
              id="brand"
              label="Brand"
              defaultValue={garment.brand ?? ""}
            />

            <FormField
              id="primaryColor"
              label="Primary colour"
              defaultValue={garment.primary_color ?? ""}
            />

            <FormField
              id="material"
              label="Material"
              defaultValue={garment.material ?? ""}
            />
          </div>

          <div>
            <label
              htmlFor="washingInstructions"
              className="mb-2 block font-medium"
            >
              Washing instructions
              <span className="ml-2 text-[#777064]">
                Optional
              </span>
            </label>

            <textarea
              id="washingInstructions"
              name="washingInstructions"
              rows={5}
              defaultValue={garment.washing_instructions ?? ""}
              placeholder="Machine wash cold on a gentle cycle."
              className="w-full resize-none rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
            />
          </div>

          <div>
            <label
              htmlFor="detergentRecommendation"
              className="mb-2 block font-medium"
            >
              Detergent recommendation
              <span className="ml-2 text-[#777064]">
                Optional
              </span>
            </label>

            <textarea
              id="detergentRecommendation"
              name="detergentRecommendation"
              rows={4}
              defaultValue={
                garment.detergent_recommendation ?? ""
              }
              placeholder="Use a mild liquid detergent."
              className="w-full resize-none rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
            >
              Save changes
            </button>

            <Link
              href={`/dashboard/items/${garment.id}`}
              className="rounded-xl border border-white/[0.15] px-6 py-3 text-center font-semibold text-[#e8e1d6] hover:bg-white/[0.05]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  defaultValue: string;
  required?: boolean;
};

function FormField({
  id,
  label,
  defaultValue,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-medium"
      >
        {label}

        {!required && (
          <span className="ml-2 text-[#777064]">
            Optional
          </span>
        )}
      </label>

      <input
        id={id}
        name={id}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
      />
    </div>
  );
}
