"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteGarment(formData: FormData) {
  const garmentId = formData.get("garmentId");

  if (typeof garmentId !== "string" || !garmentId) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: garment, error: fetchError } = await supabase
    .from("garments")
    .select(
      "id, image_path, care_label_image_path, catalog_image_path, tag_image_path",
    )
    .eq("id", garmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !garment) {
    redirect("/dashboard");
  }

  const imagePaths = [
    garment.image_path,
    garment.care_label_image_path,
    garment.catalog_image_path,
    garment.tag_image_path,
  ].filter((path): path is string => Boolean(path));

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("garment-images")
      .remove(imagePaths);

    if (storageError) {
      redirect(
        `/dashboard/items/${garmentId}?error=${encodeURIComponent(
          storageError.message,
        )}`,
      );
    }
  }

  const { error: deleteError } = await supabase
    .from("garments")
    .delete()
    .eq("id", garmentId)
    .eq("user_id", user.id);

  if (deleteError) {
    redirect(
      `/dashboard/items/${garmentId}?error=${encodeURIComponent(
        deleteError.message,
      )}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}