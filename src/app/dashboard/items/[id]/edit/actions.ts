"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_CATEGORIES = new Set([
  "top",
  "bottom",
  "outerwear",
  "dress",
  "footwear",
  "accessory",
  "other",
]);

function getText(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function updateGarment(formData: FormData) {
  const garmentId = getText(formData, "garmentId");
  const name = getText(formData, "name");
  const category = getText(formData, "category");
  const brand = getText(formData, "brand");
  const primaryColor = getText(formData, "primaryColor");
  const material = getText(formData, "material");
  const washingInstructions = getText(
    formData,
    "washingInstructions",
  );
  const detergentRecommendation = getText(
    formData,
    "detergentRecommendation",
  );

  if (!garmentId) {
    redirect("/dashboard");
  }

  if (!name) {
    redirect(
      `/dashboard/items/${garmentId}/edit?error=${encodeURIComponent(
        "Item name is required.",
      )}`,
    );
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    redirect(
      `/dashboard/items/${garmentId}/edit?error=${encodeURIComponent(
        "Select a valid category.",
      )}`,
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: updatedGarment, error } = await supabase
    .from("garments")
    .update({
      name,
      category,
      brand: brand || null,
      primary_color: primaryColor || null,
      material: material || null,
      washing_instructions: washingInstructions || null,
      detergent_recommendation: detergentRecommendation || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", garmentId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(
      `/dashboard/items/${garmentId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (!updatedGarment) {
    redirect("/dashboard");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/items/${garmentId}`);

  redirect(`/dashboard/items/${garmentId}`);
}