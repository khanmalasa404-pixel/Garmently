import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateGarment } from "./actions";

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
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href={`/dashboard/items/${garment.id}`}
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Cancel editing
        </Link>

        <p className="mt-10 text-sm uppercase tracking-widest text-neutral-500">
          Garmently
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Edit clothing item
        </h1>

        <p className="mt-4 text-neutral-400">
          Correct the clothing information and care instructions.
        </p>

        {query.error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">
            {query.error}
          </div>
        )}

        <form
          action={updateGarment}
          className="mt-10 space-y-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
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
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
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
              <span className="ml-2 text-neutral-500">
                Optional
              </span>
            </label>

            <textarea
              id="washingInstructions"
              name="washingInstructions"
              rows={5}
              defaultValue={garment.washing_instructions ?? ""}
              placeholder="Machine wash cold on a gentle cycle."
              className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="detergentRecommendation"
              className="mb-2 block font-medium"
            >
              Detergent recommendation
              <span className="ml-2 text-neutral-500">
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
              className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              Save changes
            </button>

            <Link
              href={`/dashboard/items/${garment.id}`}
              className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
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
          <span className="ml-2 text-neutral-500">
            Optional
          </span>
        )}
      </label>

      <input
        id={id}
        name={id}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
      />
    </div>
  );
}