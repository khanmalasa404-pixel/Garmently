"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SaveableOutfitItem = {
  id: string;
  role: string;
  reason: string;
};

type SaveableOutfit = {
  title: string;
  occasion: string;
  explanation: string;
  stylingTips: string[];
  missingPieces: string[];
  items: SaveableOutfitItem[];
};

type SaveOutfitButtonProps = {
  outfit: SaveableOutfit;
  stylePreference: string;
};

export default function SaveOutfitButton({
  outfit,
  stylePreference,
}: SaveOutfitButtonProps) {
  const [isSaving, setIsSaving] =
    useState(false);

  const [savedOutfitId, setSavedOutfitId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    setSavedOutfitId(null);
    setErrorMessage("");
    setIsSaving(false);
  }, [outfit]);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/save-outfit",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title: outfit.title,
            occasion: outfit.occasion,
            stylePreference,
            explanation: outfit.explanation,
            stylingTips: outfit.stylingTips,
            missingPieces: outfit.missingPieces,

            items: outfit.items.map(
              (item) => ({
                garmentId: item.id,
                role: item.role,
                reason: item.reason,
              }),
            ),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The outfit could not be saved.",
        );
      }

      setSavedOutfitId(data.outfitId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The outfit could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (savedOutfitId) {
    return (
      <div className="mt-8 rounded-2xl border border-green-900 bg-green-950/30 p-5">
        <p className="font-semibold text-green-200">
          Outfit saved successfully.
        </p>

        <Link
          href="/dashboard/saved-outfits"
          className="mt-4 inline-block rounded-xl bg-green-200 px-5 py-3 font-semibold text-green-950 hover:bg-green-100"
        >
          View saved outfits
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="rounded-xl bg-violet-200 px-6 py-3 font-semibold text-violet-950 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving outfit..."
          : "Save this outfit"}
      </button>
    </div>
  );
}