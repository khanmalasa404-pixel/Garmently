"use client";

import Link from "next/link";
import { useState } from "react";

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

  const [previousOutfit, setPreviousOutfit] =
    useState(outfit);

  // Reset the save state whenever a new outfit is generated.
  if (previousOutfit !== outfit) {
    setPreviousOutfit(outfit);
    setSavedOutfitId(null);
    setErrorMessage("");
    setIsSaving(false);
  }

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
      <div className="mt-8 rounded-2xl border border-[#8fa98a]/30 bg-[#8fa98a]/10 p-5">
        <p className="font-semibold text-[#c7dbc2]">
          Outfit saved successfully.
        </p>

        <Link
          href="/dashboard/saved-outfits"
          className="mt-4 inline-block rounded-xl bg-[#8fa98a]/90 px-5 py-3 font-semibold text-[#0f1610] hover:bg-[#8fa98a]"
        >
          View saved outfits
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-4 text-[#e6b7b1]">
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="rounded-xl bg-[#e6d3ae] px-6 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving outfit..."
          : "Save this outfit"}
      </button>
    </div>
  );
}