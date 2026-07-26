"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STORAGE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const AI_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

type AnalysisResult = {
  suggestedName: string;
  category:
    | "top"
    | "bottom"
    | "outerwear"
    | "dress"
    | "footwear"
    | "accessory"
    | "other";
  brand: string | null;
  primaryColor: string;
  secondaryColors: string[];
  material: string | null;
  pattern: string;
  formality:
    | "casual"
    | "smart-casual"
    | "business"
    | "formal"
    | "unknown";
  washingInstructions: string | null;
  detergentRecommendation: string | null;
  careWarnings: string[];
  careSource:
    | "care-label"
    | "visual-estimate"
    | "mixed";
  confidence: number;
};

function validateStorageImage(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than 10 MB.`;
  }

  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  const validType =
    STORAGE_IMAGE_TYPES.has(file.type) ||
    (extension !== undefined &&
      ALLOWED_EXTENSIONS.has(extension));

  if (!validType) {
    return `${file.name} is not a supported image format.`;
  }

  return null;
}

function validateAiImage(file: File): string | null {
  const storageError = validateStorageImage(file);

  if (storageError) {
    return storageError;
  }

  if (!AI_IMAGE_TYPES.has(file.type)) {
    return `${file.name} must be converted to JPG, PNG, or WEBP before AI analysis.`;
  }

  return null;
}

function getFileExtension(file: File) {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (
    extension &&
    ALLOWED_EXTENSIONS.has(extension)
  ) {
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

  const filePath =
    `${userId}/${imageType}-${crypto.randomUUID()}.${extension}`;

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

  const [supabase] = useState(() =>
    createClient(),
  );

  const [garmentImage, setGarmentImage] =
    useState<File | null>(null);

  const [careLabelImage, setCareLabelImage] =
    useState<File | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [primaryColor, setPrimaryColor] =
    useState("");
  const [material, setMaterial] = useState("");

  const [
    washingInstructions,
    setWashingInstructions,
  ] = useState("");

  const [
    detergentRecommendation,
    setDetergentRecommendation,
  ] = useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [analysisMessage, setAnalysisMessage] =
    useState("");

  async function handleAnalyze() {
    setErrorMessage("");
    setAnalysisMessage("");

    if (!garmentImage) {
      setErrorMessage(
        "Upload a clothing photograph before running AI analysis.",
      );
      return;
    }

    const garmentImageError =
      validateAiImage(garmentImage);

    if (garmentImageError) {
      setErrorMessage(garmentImageError);
      return;
    }

    if (careLabelImage) {
      const careLabelError =
        validateAiImage(careLabelImage);

      if (careLabelError) {
        setErrorMessage(careLabelError);
        return;
      }
    }

    setIsAnalyzing(true);

    try {
      const analysisFormData = new FormData();

      analysisFormData.append(
        "garmentImage",
        garmentImage,
      );

      if (careLabelImage) {
        analysisFormData.append(
          "careLabelImage",
          careLabelImage,
        );
      }

      const response = await fetch(
        "/api/analyze-garment",
        {
          method: "POST",
          body: analysisFormData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI analysis failed.",
        );
      }

      const analysis =
        data.analysis as AnalysisResult;

      setName(analysis.suggestedName ?? "");
      setCategory(analysis.category ?? "");
      setBrand(analysis.brand ?? "");
      setPrimaryColor(
        analysis.primaryColor ?? "",
      );
      setMaterial(analysis.material ?? "");

      setWashingInstructions(
        analysis.washingInstructions ?? "",
      );

      setDetergentRecommendation(
        analysis.detergentRecommendation ?? "",
      );

      const confidencePercentage = Math.round(
        analysis.confidence * 100,
      );

      const careSourceLabel =
        analysis.careSource.replaceAll("-", " ");

      setAnalysisMessage(
        `AI analysis completed. Source: ${careSourceLabel}. Confidence: ${confidencePercentage}%. Review every field before saving.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The garment could not be analyzed.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setAnalysisMessage("");

    const cleanedName = name.trim();
    const cleanedCategory = category.trim();
    const cleanedBrand = brand.trim();

    const cleanedPrimaryColor =
      primaryColor.trim();

    const cleanedMaterial = material.trim();

    const cleanedWashingInstructions =
      washingInstructions.trim();

    const cleanedDetergentRecommendation =
      detergentRecommendation.trim();

    if (!cleanedName || !cleanedCategory) {
      setErrorMessage(
        "Enter a name and select a category.",
      );
      return;
    }

    if (!garmentImage) {
      setErrorMessage(
        "Upload a photograph of the clothing item.",
      );
      return;
    }

    const garmentImageError =
      validateStorageImage(garmentImage);

    if (garmentImageError) {
      setErrorMessage(garmentImageError);
      return;
    }

    if (careLabelImage) {
      const careLabelError =
        validateStorageImage(careLabelImage);

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
        throw new Error(
          "Your session expired. Please sign in again.",
        );
      }

      const garmentImagePath =
        await uploadImage(
          supabase,
          user.id,
          garmentImage,
          "garment",
        );

      uploadedPaths.push(garmentImagePath);

      let careLabelImagePath:
        | string
        | null = null;

      if (careLabelImage) {
        careLabelImagePath =
          await uploadImage(
            supabase,
            user.id,
            careLabelImage,
            "care-label",
          );

        uploadedPaths.push(
          careLabelImagePath,
        );
      }

      const { error: insertError } =
        await supabase
          .from("garments")
          .insert({
            user_id: user.id,
            name: cleanedName,
            category: cleanedCategory,
            brand: cleanedBrand || null,
            primary_color:
              cleanedPrimaryColor || null,
            material:
              cleanedMaterial || null,
            image_path: garmentImagePath,
            care_label_image_path:
              careLabelImagePath,
            washing_instructions:
              cleanedWashingInstructions ||
              null,
            detergent_recommendation:
              cleanedDetergentRecommendation ||
              null,
          });

      if (insertError) {
        throw new Error(
          insertError.message,
        );
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

  const formIsBusy =
    isAnalyzing || isSubmitting;

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

      {analysisMessage && (
        <div className="rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-200">
          {analysisMessage}
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
          disabled={formIsBusy}
          onChange={(event) => {
            setGarmentImage(
              event.target.files?.[0] ?? null,
            );

            setAnalysisMessage("");
          }}
          className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-neutral-500">
          Upload a clear image showing the entire
          clothing item.
        </p>
      </div>

      <div>
        <label
          htmlFor="careLabelImage"
          className="mb-2 block font-medium"
        >
          Care-label photograph
          <span className="ml-2 text-neutral-500">
            Optional
          </span>
        </label>

        <input
          id="careLabelImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          disabled={formIsBusy}
          onChange={(event) => {
            setCareLabelImage(
              event.target.files?.[0] ?? null,
            );

            setAnalysisMessage("");
          }}
          className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-neutral-500">
          Include the material composition and
          washing symbols when available.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-900 bg-violet-950/20 p-5">
        <p className="font-semibold text-violet-200">
          AI-assisted entry
        </p>

        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Gemini will examine the photographs and
          suggest the clothing details. You remain
          responsible for reviewing the care
          information before saving.
        </p>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={
            formIsBusy || !garmentImage
          }
          className="mt-4 rounded-xl bg-violet-200 px-5 py-3 font-semibold text-violet-950 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing
            ? "Analyzing photographs..."
            : "Analyze with AI"}
        </button>

        <p className="mt-3 text-xs text-neutral-500">
          AI analysis supports JPG, PNG, and WEBP.
          HEIC images may still be saved manually.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          id="name"
          label="Item name"
          placeholder="Black wool overcoat"
          value={name}
          onChange={setName}
          required
          disabled={formIsBusy}
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
            value={category}
            disabled={formIsBusy}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
          >
            <option value="" disabled>
              Select a category
            </option>

            <option value="top">Top</option>
            <option value="bottom">
              Bottom
            </option>
            <option value="outerwear">
              Outerwear
            </option>
            <option value="dress">Dress</option>
            <option value="footwear">
              Footwear
            </option>
            <option value="accessory">
              Accessory
            </option>
            <option value="other">Other</option>
          </select>
        </div>

        <FormField
          id="brand"
          label="Brand"
          placeholder="Zara"
          value={brand}
          onChange={setBrand}
          disabled={formIsBusy}
        />

        <FormField
          id="primaryColor"
          label="Primary colour"
          placeholder="Black"
          value={primaryColor}
          onChange={setPrimaryColor}
          disabled={formIsBusy}
        />

        <FormField
          id="material"
          label="Material"
          placeholder="80% wool, 20% polyester"
          value={material}
          onChange={setMaterial}
          disabled={formIsBusy}
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
          rows={4}
          value={washingInstructions}
          disabled={formIsBusy}
          onChange={(event) =>
            setWashingInstructions(
              event.target.value,
            )
          }
          placeholder="Wash cold on a gentle cycle. Do not tumble dry."
          className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
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
          rows={3}
          value={detergentRecommendation}
          disabled={formIsBusy}
          onChange={(event) =>
            setDetergentRecommendation(
              event.target.value,
            )
          }
          placeholder="Use a mild wool-safe liquid detergent."
          className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={formIsBusy}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving item..."
            : "Save clothing item"}
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
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

function FormField({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
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
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400 disabled:opacity-50"
      />
    </div>
  );
}