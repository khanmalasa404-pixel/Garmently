import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RequestSchema = z.object({
  occasion: z.enum([
    "casual-outing",
    "work",
    "dinner",
    "formal-event",
    "wedding",
    "date-night",
    "gym",
    "travel",
    "other",
  ]),

  stylePreference: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),
});

const OutfitSchema = z.object({
  title: z.string().min(1),

  items: z
    .array(
      z.object({
        garmentId: z.string().uuid(),

        role: z.enum([
          "top",
          "bottom",
          "outerwear",
          "dress",
          "footwear",
          "accessory",
          "other",
        ]),

        reason: z.string(),
      }),
    )
    .min(1)
    .max(10),

  explanation: z.string(),

  stylingTips: z
    .array(z.string())
    .max(5),

  missingPieces: z.array(z.string()).max(5),
});

const outfitJsonSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
      description: "A short name for the generated outfit.",
    },

    items: {
      type: "array",
      minItems: 1,
      maxItems: 10,

      items: {
        type: "object",

        properties: {
          garmentId: {
            type: "string",
            description:
              "The exact garment UUID supplied in the closet data.",
          },

          role: {
            type: "string",
            enum: [
              "top",
              "bottom",
              "outerwear",
              "dress",
              "footwear",
              "accessory",
              "other",
            ],
          },

          reason: {
            type: "string",
            description:
              "A concise explanation of why this garment belongs in the outfit.",
          },
        },

        required: [
          "garmentId",
          "role",
          "reason",
        ],

        additionalProperties: false,
      },
    },

    explanation: {
      type: "string",
      description:
        "Explain why the pieces work together for the selected occasion.",
    },

    stylingTips: {
      type: "array",
      maxItems: 5,

      items: {
        type: "string",
      },
    },

    missingPieces: {
      type: "array",
      maxItems: 5,

      items: {
        type: "string",
      },

      description:
        "Types of pieces missing from the closet that would complete the outfit.",
    },
  },

  required: [
    "title",
    "items",
    "explanation",
    "stylingTips",
    "missingPieces",
  ],

  additionalProperties: false,
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "The Gemini API key has not been configured.",
        },
        {
          status: 500,
        },
      );
    }

    const requestBody = await request.json();

    const parsedRequest =
      RequestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            "Select a valid occasion and enter a shorter style preference.",
        },
        {
          status: 400,
        },
      );
    }

    const { occasion, stylePreference } =
      parsedRequest.data;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to generate an outfit.",
        },
        {
          status: 401,
        },
      );
    }

    const { data: garments, error: garmentsError } =
      await supabase
        .from("garments")
        .select(
          `
            id,
            name,
            category,
            brand,
            primary_color,
            material,
            image_path,
            created_at
          `,
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (garmentsError) {
      return NextResponse.json(
        {
          error: garmentsError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!garments || garments.length === 0) {
      return NextResponse.json(
        {
          error:
            "Add at least one clothing item before generating an outfit.",
        },
        {
          status: 400,
        },
      );
    }

    const closetForGemini = garments.map(
      (garment) => ({
        id: garment.id,
        name: garment.name,
        category: garment.category,
        brand: garment.brand,
        primaryColor: garment.primary_color,
        material: garment.material,
      }),
    );

    const prompt = `
You are creating an outfit using a user's real virtual closet.

Occasion:
${occasion}

Additional style preference:
${stylePreference || "No additional preference provided."}

Available garments:
${JSON.stringify(closetForGemini, null, 2)}

Rules:

1. Use only garment IDs contained in the available-garments list.
2. Copy every selected garment ID exactly.
3. Never invent clothing, IDs, colours, materials, or brands.
4. Prefer a complete outfit appropriate for the selected occasion.
5. A dress may replace a separate top and bottom.
6. Outerwear and accessories are optional.
7. Avoid selecting two garments that serve the same core role unless
   intentional layering makes sense.
8. Explain why the colours, materials, formality, and categories work.
9. If the closet cannot produce a complete outfit, select the best
   available pieces and list the missing types in missingPieces.
10. Do not recommend buying specific brands or products.
    `.trim();

    const gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const interaction =
      await gemini.interactions.create({
        model: "gemini-flash-latest",

        input: [
          {
            type: "text",
            text: prompt,
          },
        ],

        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: outfitJsonSchema,
        },
      });

    if (!interaction.output_text) {
      return NextResponse.json(
        {
          error:
            "Gemini did not return a usable outfit.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedJson = JSON.parse(
      interaction.output_text,
    );

    const generatedOutfit =
      OutfitSchema.parse(parsedJson);

    const garmentsById = new Map(
      garments.map((garment) => [
        garment.id,
        garment,
      ]),
    );

    const selectedIds = new Set<string>();

    for (const selectedItem of generatedOutfit.items) {
      if (
        !garmentsById.has(selectedItem.garmentId)
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini selected an item that does not exist in your closet. Please generate the outfit again.",
          },
          {
            status: 502,
          },
        );
      }

      if (
        selectedIds.has(selectedItem.garmentId)
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini selected the same item more than once. Please generate the outfit again.",
          },
          {
            status: 502,
          },
        );
      }

      selectedIds.add(selectedItem.garmentId);
    }

    const outfitItems = await Promise.all(
      generatedOutfit.items.map(
        async (selectedItem) => {
          const garment = garmentsById.get(
            selectedItem.garmentId,
          )!;

          let imageUrl: string | null = null;

          if (garment.image_path) {
            const { data } =
              await supabase.storage
                .from("garment-images")
                .createSignedUrl(
                  garment.image_path,
                  60 * 60,
                );

            imageUrl =
              data?.signedUrl ?? null;
          }

          return {
            id: garment.id,
            name: garment.name,
            category: garment.category,
            brand: garment.brand,
            primaryColor:
              garment.primary_color,
            material: garment.material,
            imageUrl,
            role: selectedItem.role,
            reason: selectedItem.reason,
          };
        },
      ),
    );

    return NextResponse.json({
      outfit: {
        title: generatedOutfit.title,
        occasion,
        explanation:
          generatedOutfit.explanation,
        stylingTips:
          generatedOutfit.stylingTips,
        missingPieces:
          generatedOutfit.missingPieces,
        items: outfitItems,
      },
    });
  } catch (error) {
    console.error(
      "Outfit generation failed:",
      error,
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "Gemini returned the outfit in an unexpected format. Please try again.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The outfit could not be generated.",
      },
      {
        status: 500,
      },
    );
  }
}