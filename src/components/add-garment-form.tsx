"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

function validateImage(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than 10 MB.`;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  const validType =
    ALLOWED_IMAGE_TYPES.has(file.type) ||
    (extension !== undefined && ALLOWED_EXTENSIONS.has(extension));

  if (!validType) {
    return `${file.name} is not a supported image format.`;
  }

  return null;
}

function getFileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ALLOWED_EXTENSIONS.has(extension)) {
    return extension;
  }

  return "jpg";
}

async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  imageType: "garment" | "care-label",
) {
  const extension = getFileExtension(file);

  const filePath = `${userId}/${imageType}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("garment-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export default function AddGarmentForm() {
  const router = useRouter();
  const supabase = createClient();

  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [careLabelImage, setCareLabelImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const brand = String(formData.get("brand") ?? "").trim();
    const primaryColor = String(
      formData.get("primaryColor") ?? "",
    ).trim();
    const material = String(formData.get("material") ?? "").trim();
    const washingInstructions = String(
      formData.get("washingInstructions") ?? "",
    ).trim();
    const detergentRecommendation = String(
      formData.get("detergentRecommendation") ?? "",
    ).trim();

    if (!name || !category) {
      setErrorMessage("Enter a name and select a category.");
      return;
    }

    if (!garmentImage) {
      setErrorMessage("Upload a photograph of the clothing item.");
      return;
    }

    const garmentImageError = validateImage(garmentImage);

    if (garmentImageError) {
      setErrorMessage(garmentImageError);
      return;
    }

    if (careLabelImage) {
      const careLabelError = validateImage(careLabelImage);

      if (careLabelError) {
        setErrorMessage(careLabelError);
        return;
      }
    }

    setIsSubmitting(true);

    const uploadedPaths: string[] = [];

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your session expired. Please sign in again.");
      }

      const garmentImagePath = await uploadImage(
        supabase,
        user.id,
        garmentImage,
        "garment",
      );

      uploadedPaths.push(garmentImagePath);

      let careLabelImagePath: string | null = null;

      if (careLabelImage) {
        careLabelImagePath = await uploadImage(
          supabase,
          user.id,
          careLabelImage,
          "care-label",
        );

        uploadedPaths.push(careLabelImagePath);
      }

      const { error: insertError } = await supabase
        .from("garments")
        .insert({
          user_id: user.id,
          name,
          category,
          brand: brand || null,
          primary_color: primaryColor || null,
          material: material || null,
          image_path: garmentImagePath,
          care_label_image_path: careLabelImagePath,
          washing_instructions: washingInstructions || null,
          detergent_recommendation: detergentRecommendation || null,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("garment-images")
          .remove(uploadedPaths);
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The garment could not be saved.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 space-y-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
    >
      {errorMessage && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="garmentImage"
          className="mb-2 block font-medium"
        >
          Clothing photograph
        </label>

        <input
          id="garmentImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          required
          onChange={(event) => {
            setGarmentImage(event.target.files?.[0] ?? null);
          }}
          className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
        />

        <p className="mt-2 text-sm text-neutral-500">
          Upload a clear photograph showing the entire clothing item.
        </p>
      </div>

      <div>
        <label
          htmlFor="careLabelImage"
          className="mb-2 block font-medium"
        >
          Care-label photograph
          <span className="ml-2 text-neutral-500">Optional</span>
        </label>

        <input
          id="careLabelImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={(event) => {
            setCareLabelImage(event.target.files?.[0] ?? null);
          }}
          className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
        />

        <p className="mt-2 text-sm text-neutral-500">
          Photograph the material and washing label when available.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="name"
          label="Item name"
          placeholder="Black wool overcoat"
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
            defaultValue=""
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
          >
            <option value="" disabled>
              Select a category
            </option>

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
          placeholder="Zara"
        />

        <FormField
          id="primaryColor"
          label="Primary colour"
          placeholder="Black"
        />

        <FormField
          id="material"
          label="Material"
          placeholder="80% wool, 20% polyester"
        />
      </div>

      <div>
        <label
          htmlFor="washingInstructions"
          className="mb-2 block font-medium"
        >
          Washing instructions
          <span className="ml-2 text-neutral-500">Optional</span>
        </label>

        <textarea
          id="washingInstructions"
          name="washingInstructions"
          rows={4}
          placeholder="Wash cold on a gentle cycle. Do not tumble dry."
          className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label
          htmlFor="detergentRecommendation"
          className="mb-2 block font-medium"
        >
          Detergent recommendation
          <span className="ml-2 text-neutral-500">Optional</span>
        </label>

        <textarea
          id="detergentRecommendation"
          name="detergentRecommendation"
          rows={3}
          placeholder="Use a mild wool-safe liquid detergent."
          className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving item..." : "Save clothing item"}
        </button>

        <Link
          href="/dashboard"
          className="rounded-xl border border-neutral-700 px-6 py-3 text-center font-semibold hover:bg-neutral-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
};

function FormField({
  id,
  label,
  placeholder,
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
      />
    </div>
  );
}