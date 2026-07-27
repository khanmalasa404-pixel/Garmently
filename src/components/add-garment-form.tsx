"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BrowserMultiFormatReader } from "@zxing/browser";

import { createClient } from "@/lib/supabase/client";
import {
  cropImageToBoundingBox,
  type NormalizedBoundingBox,
} from "@/lib/image/crop";

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
  boundingBox: NormalizedBoundingBox | null;
  brandSource: "garment-photo" | "tag-photo" | "unknown";
  brandConfidence: number | null;
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
  imageType: "garment" | "care-label" | "tag" | "catalog",
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

  const [garmentImagePreviewUrl, setGarmentImagePreviewUrl] =
    useState<string | null>(null);

  const [careLabelImage, setCareLabelImage] =
    useState<File | null>(null);

  const [tagImage, setTagImage] =
    useState<File | null>(null);

  const [tagBarcodeValue, setTagBarcodeValue] =
    useState("");

  const [tagBarcodeFormat, setTagBarcodeFormat] =
    useState("");

  const [boundingBox, setBoundingBox] =
    useState<NormalizedBoundingBox | null>(null);

  const [catalogImage, setCatalogImage] =
    useState<File | null>(null);

  const [catalogImagePreviewUrl, setCatalogImagePreviewUrl] =
    useState<string | null>(null);

  const [isGeneratingCatalogPhoto, setIsGeneratingCatalogPhoto] =
    useState(false);

  const [catalogPhotoError, setCatalogPhotoError] =
    useState("");

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

  async function handleTagImageChange(file: File | null) {
    setTagImage(file);
    setTagBarcodeValue("");
    setTagBarcodeFormat("");
    setAnalysisMessage("");

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(objectUrl);

      setTagBarcodeValue(result.getText());
      setTagBarcodeFormat(result.getBarcodeFormat().toString());
    } catch {
      // No barcode/QR found in the tag photo — not an error.
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleGenerateCatalogPhoto() {
    setCatalogPhotoError("");

    if (!garmentImage) {
      setCatalogPhotoError(
        "Upload a clothing photograph first.",
      );
      return;
    }

    setIsGeneratingCatalogPhoto(true);

    try {
      const sourceImage = await cropImageToBoundingBox(
        garmentImage,
        boundingBox,
      );

      const photoFormData = new FormData();
      photoFormData.append("image", sourceImage);

      const response = await fetch(
        "/api/generate-catalog-photo",
        {
          method: "POST",
          body: photoFormData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The catalog photo could not be generated.",
        );
      }

      const binary = atob(data.image as string);
      const bytes = new Uint8Array(binary.length);

      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const mimeType = data.mimeType as string;

      const extension =
        mimeType === "image/png" ? "png" : "jpg";

      const generatedFile = new File(
        [bytes],
        `catalog-photo.${extension}`,
        { type: mimeType },
      );

      if (catalogImagePreviewUrl) {
        URL.revokeObjectURL(catalogImagePreviewUrl);
      }

      setCatalogImage(generatedFile);
      setCatalogImagePreviewUrl(
        URL.createObjectURL(generatedFile),
      );
    } catch (error) {
      setCatalogPhotoError(
        error instanceof Error
          ? error.message
          : "The catalog photo could not be generated.",
      );
    } finally {
      setIsGeneratingCatalogPhoto(false);
    }
  }

  function handleDiscardCatalogPhoto() {
    if (catalogImagePreviewUrl) {
      URL.revokeObjectURL(catalogImagePreviewUrl);
    }

    setCatalogImage(null);
    setCatalogImagePreviewUrl(null);
    setCatalogPhotoError("");
  }

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

      if (tagImage) {
        analysisFormData.append("tagImage", tagImage);
      }

      if (tagBarcodeValue) {
        analysisFormData.append(
          "tagBarcodeValue",
          tagBarcodeValue,
        );

        analysisFormData.append(
          "tagBarcodeFormat",
          tagBarcodeFormat,
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

      setBoundingBox(analysis.boundingBox ?? null);

      const suggestedName =
        analysis.suggestedName ?? "";

      const displayName =
        analysis.brand &&
        !suggestedName
          .toLowerCase()
          .startsWith(analysis.brand.toLowerCase())
          ? `${analysis.brand} ${suggestedName}`.trim()
          : suggestedName;

      setName(displayName);
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

      let tagImagePath: string | null = null;

      if (tagImage) {
        tagImagePath = await uploadImage(
          supabase,
          user.id,
          tagImage,
          "tag",
        );

        uploadedPaths.push(tagImagePath);
      }

      let catalogImagePath: string | null = null;

      if (catalogImage) {
        catalogImagePath = await uploadImage(
          supabase,
          user.id,
          catalogImage,
          "catalog",
        );

        uploadedPaths.push(catalogImagePath);
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
            tag_image_path: tagImagePath,
            catalog_image_path: catalogImagePath,
            tag_barcode_value: tagBarcodeValue || null,
            tag_barcode_format: tagBarcodeFormat || null,
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
      className="mt-10 space-y-8 rounded-[2rem] border border-white/[0.08] bg-[#151410] p-8"
    >
      {errorMessage && (
        <div className="rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-4 text-sm text-[#e6b7b1]">
          {errorMessage}
        </div>
      )}

      {analysisMessage && (
        <div className="rounded-xl border border-[#8fa98a]/30 bg-[#8fa98a]/10 p-4 text-sm text-[#c7dbc2]">
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
            const file =
              event.target.files?.[0] ?? null;

            setGarmentImage(file);

            setGarmentImagePreviewUrl(
              (previousUrl) => {
                if (previousUrl) {
                  URL.revokeObjectURL(previousUrl);
                }

                return file
                  ? URL.createObjectURL(file)
                  : null;
              },
            );

            handleDiscardCatalogPhoto();
            setBoundingBox(null);
            setAnalysisMessage("");
          }}
          className="block w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#e6d3ae] file:px-4 file:py-2 file:font-semibold file:text-[#17130d] disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-[#777064]">
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
          <span className="ml-2 text-[#777064]">
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
          className="block w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#e6d3ae] file:px-4 file:py-2 file:font-semibold file:text-[#17130d] disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-[#777064]">
          Include the material composition and
          washing symbols when available.
        </p>
      </div>

      <div>
        <label
          htmlFor="tagImage"
          className="mb-2 block font-medium"
        >
          Garment tag / label photograph
          <span className="ml-2 text-[#777064]">
            Optional
          </span>
        </label>

        <input
          id="tagImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          disabled={formIsBusy}
          onChange={(event) => {
            void handleTagImageChange(
              event.target.files?.[0] ?? null,
            );
          }}
          className="block w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#e6d3ae] file:px-4 file:py-2 file:font-semibold file:text-[#17130d] disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-[#777064]">
          A photo of the hangtag helps identify the
          brand. If it has a barcode or QR code, we
          try to read it automatically.
        </p>

        {tagBarcodeValue && (
          <p className="mt-2 text-xs text-[#a59d8e]">
            Detected code ({tagBarcodeFormat}):{" "}
            <span className="text-[#e8e1d6]">
              {tagBarcodeValue}
            </span>{" "}
            — for your reference only.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-[#c7a66a]/30 bg-[#c7a66a]/[0.06] p-5">
        <p className="font-semibold text-[#e6d3ae]">
          AI-assisted entry
        </p>

        <p className="mt-2 text-sm leading-6 text-[#a59d8e]">
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
          className="mt-4 rounded-xl bg-[#e6d3ae] px-5 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing
            ? "Analyzing photographs..."
            : "Analyze with AI"}
        </button>

        <p className="mt-3 text-xs text-[#777064]">
          AI analysis supports JPG, PNG, and WEBP.
          HEIC images may still be saved manually.
        </p>
      </div>

      <div className="rounded-2xl border border-[#c7a66a]/30 bg-[#c7a66a]/[0.06] p-5">
        <p className="font-semibold text-[#e6d3ae]">
          Catalog-style photo
        </p>

        <p className="mt-2 text-sm leading-6 text-[#a59d8e]">
          Generate a clean, plain-background version of
          your photo, styled like a catalog product shot.
          This is optional — your original photo is
          always kept too.
        </p>

        {catalogPhotoError && (
          <p className="mt-3 text-sm text-[#e6b7b1]">
            {catalogPhotoError}
          </p>
        )}

        {!catalogImagePreviewUrl ? (
          <button
            type="button"
            onClick={handleGenerateCatalogPhoto}
            disabled={
              formIsBusy ||
              isGeneratingCatalogPhoto ||
              !garmentImage
            }
            className="mt-4 rounded-xl bg-[#e6d3ae] px-5 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGeneratingCatalogPhoto
              ? "Generating catalog photo..."
              : "Generate catalog photo"}
          </button>
        ) : (
          <div className="mt-4">
            <div className="grid max-w-sm grid-cols-2 gap-3">
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-[#777064]">
                  Original
                </p>

                {garmentImagePreviewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={garmentImagePreviewUrl}
                    alt="Original garment photograph"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                )}
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-[#c7a66a]">
                  Catalog style
                </p>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={catalogImagePreviewUrl}
                  alt="Generated catalog-style photograph"
                  className="aspect-square w-full rounded-xl border border-[#c7a66a]/40 object-cover"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleGenerateCatalogPhoto}
                disabled={
                  formIsBusy || isGeneratingCatalogPhoto
                }
                className="rounded-xl border border-[#c7a66a]/40 px-4 py-2 text-sm font-semibold text-[#e6d3ae] hover:bg-[#c7a66a]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingCatalogPhoto
                  ? "Regenerating..."
                  : "Regenerate"}
              </button>

              <button
                type="button"
                onClick={handleDiscardCatalogPhoto}
                disabled={
                  formIsBusy || isGeneratingCatalogPhoto
                }
                className="rounded-xl border border-white/[0.15] px-4 py-2 text-sm text-[#a59d8e] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Discard, keep original
              </button>
            </div>
          </div>
        )}
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
            className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50 disabled:opacity-50"
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
          <span className="ml-2 text-[#777064]">
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
          className="w-full resize-none rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50 disabled:opacity-50"
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
          rows={3}
          value={detergentRecommendation}
          disabled={formIsBusy}
          onChange={(event) =>
            setDetergentRecommendation(
              event.target.value,
            )
          }
          placeholder="Use a mild wool-safe liquid detergent."
          className="w-full resize-none rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={formIsBusy}
          className="rounded-xl bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving item..."
            : "Save clothing item"}
        </button>

        <Link
          href="/dashboard"
          className="rounded-xl border border-white/[0.15] px-6 py-3 text-center font-semibold text-[#e8e1d6] hover:bg-white/[0.05]"
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
          <span className="ml-2 text-[#777064]">
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
        className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50 disabled:opacity-50"
      />
    </div>
  );
}