import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const OccasionSchema = z.enum([
  "casual-outing",
  "work",
  "dinner",
  "formal-event",
  "wedding",
  "date-night",
  "gym",
  "travel",
  "other",
]);

const RoleSchema = z.enum([
  "top",
  "bottom",
  "outerwear",
  "dress",
  "footwear",
  "accessory",
  "other",
]);

const SaveOutfitSchema = z.object({
  title: z.string().trim().min(1).max(100),
  occasion: OccasionSchema,

  stylePreference: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),

  explanation: z
    .string()
    .trim()
    .min(1)
    .max(3000),

  stylingTips: z
    .array(z.string().trim().min(1).max(500))
    .max(5),

  missingPieces: z
    .array(z.string().trim().min(1).max(500))
    .max(5),

  items: z
    .array(
      z.object({
        garmentId: z.string().uuid(),
        role: RoleSchema,
        reason: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(10),
});

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    const parsedRequest =
      SaveOutfitSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            "The generated outfit contains invalid or incomplete information.",
        },
        {
          status: 400,
        },
      );
    }

    const outfit = parsedRequest.data;

    const garmentIds = outfit.items.map(
      (item) => item.garmentId,
    );

    const uniqueGarmentIds = new Set(garmentIds);

    if (
      uniqueGarmentIds.size !== garmentIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "The outfit contains the same clothing item more than once.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to save an outfit.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: ownedGarments,
      error: garmentError,
    } = await supabase
      .from("garments")
      .select("id")
      .eq("user_id", user.id)
      .in("id", garmentIds);

    if (garmentError) {
      return NextResponse.json(
        {
          error: garmentError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (
      !ownedGarments ||
      ownedGarments.length !== garmentIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "One or more selected garments do not belong to your closet.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: savedOutfit,
      error: outfitError,
    } = await supabase
      .from("outfits")
      .insert({
        user_id: user.id,
        title: outfit.title,
        occasion: outfit.occasion,
        style_preference:
          outfit.stylePreference || null,
        explanation: outfit.explanation,
        styling_tips: outfit.stylingTips,
        missing_pieces: outfit.missingPieces,
      })
      .select("id")
      .single();

    if (outfitError || !savedOutfit) {
      return NextResponse.json(
        {
          error:
            outfitError?.message ||
            "The outfit could not be saved.",
        },
        {
          status: 500,
        },
      );
    }

    const outfitItemRows = outfit.items.map(
      (item, index) => ({
        outfit_id: savedOutfit.id,
        garment_id: item.garmentId,
        role: item.role,
        reason: item.reason,
        position: index,
      }),
    );

    const { error: itemsError } =
      await supabase
        .from("outfit_items")
        .insert(outfitItemRows);

    if (itemsError) {
      // Remove the incomplete parent record.
      // The database cascade also removes any inserted outfit items.
      await supabase
        .from("outfits")
        .delete()
        .eq("id", savedOutfit.id)
        .eq("user_id", user.id);

      return NextResponse.json(
        {
          error: itemsError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      outfitId: savedOutfit.id,
      message: "Outfit saved successfully.",
    });
  } catch (error) {
    console.error("Saving outfit failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The outfit could not be saved.",
      },
      {
        status: 500,
      },
    );
  }
}