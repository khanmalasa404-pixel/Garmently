import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 18 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const GarmentAnalysisSchema = z.object({
  suggestedName: z.string(),

  category: z.enum([
    "top",
    "bottom",
    "outerwear",
    "dress",
    "footwear",
    "accessory",
    "other",
  ]),

  brand: z.string().nullable(),
  primaryColor: z.string(),
  secondaryColors: z.array(z.string()),
  material: z.string().nullable(),
  pattern: z.string(),

  formality: z.enum([
    "casual",
    "smart-casual",
    "business",
    "formal",
    "unknown",
  ]),

  washingInstructions: z.string().nullable(),
  detergentRecommendation: z.string().nullable(),
  careWarnings: z.array(z.string()),

  careSource: z.enum([
    "care-label",
    "visual-estimate",
    "mixed",
  ]),

  confidence: z.number().min(0).max(1),
});

const garmentAnalysisJsonSchema = {
  type: "object",

  properties: {
    suggestedName: {
      type: "string",
      description: "A short natural name for the garment.",
    },

    category: {
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

    brand: {
      type: ["string", "null"],
      description: "Brand only when visible or readable.",
    },

    primaryColor: {
      type: "string",
    },

    secondaryColors: {
      type: "array",
      items: {
        type: "string",
      },
    },

    material: {
      type: ["string", "null"],
      description:
        "Material composition from the label, or a clearly marked visual estimate.",
    },

    pattern: {
      type: "string",
    },

    formality: {
      type: "string",
      enum: [
        "casual",
        "smart-casual",
        "business",
        "formal",
        "unknown",
      ],
    },

    washingInstructions: {
      type: ["string", "null"],
    },

    detergentRecommendation: {
      type: ["string", "null"],
    },

    careWarnings: {
      type: "array",
      items: {
        type: "string",
      },
    },

    careSource: {
      type: "string",
      enum: [
        "care-label",
        "visual-estimate",
        "mixed",
      ],
    },

    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
  },

  required: [
    "suggestedName",
    "category",
    "brand",
    "primaryColor",
    "secondaryColors",
    "material",
    "pattern",
    "formality",
    "washingInstructions",
    "detergentRecommendation",
    "careWarnings",
    "careSource",
    "confidence",
  ],

  additionalProperties: false,
};

function validateImage(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return `${file.name} must be a JPG, PNG, or WEBP image.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than 10 MB.`;
  }

  return null;
}

async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return buffer.toString("base64");
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "The Gemini API key has not been configured.",
        },
        {
          status: 500,
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
          error: "You must be signed in to analyze clothing.",
        },
        {
          status: 401,
        },
      );
    }

    const formData = await request.formData();

    const garmentImage = formData.get("garmentImage");
    const careLabelImage = formData.get("careLabelImage");

    if (!(garmentImage instanceof File)) {
      return NextResponse.json(
        {
          error: "A garment photograph is required.",
        },
        {
          status: 400,
        },
      );
    }

    const garmentError = validateImage(garmentImage);

    if (garmentError) {
      return NextResponse.json(
        {
          error: garmentError,
        },
        {
          status: 400,
        },
      );
    }

    const hasCareLabel =
      careLabelImage instanceof File &&
      careLabelImage.size > 0;

    if (hasCareLabel) {
      const careLabelError = validateImage(careLabelImage);

      if (careLabelError) {
        return NextResponse.json(
          {
            error: careLabelError,
          },
          {
            status: 400,
          },
        );
      }

      if (
        garmentImage.size + careLabelImage.size >
        MAX_TOTAL_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "The two images together must be smaller than 18 MB.",
          },
          {
            status: 400,
          },
        );
      }
    }

    const prompt = `
Analyze these photographs for a virtual wardrobe application.

The first image is the clothing item. A second image, when supplied, is
the garment's material and care label.

Return:
- A short natural item name
- Category
- Brand, only when visible
- Primary and secondary colours
- Pattern
- Formality
- Material composition
- Washing instructions
- Detergent category
- Important care warnings
- Confidence score

Rules:

1. A readable manufacturer label is the strongest source.
2. Do not invent label text, care symbols, brand names, or materials.
3. If material is only estimated visually, clearly describe it as likely
   or estimated.
4. When no readable care label is available, provide only cautious,
   general care guidance.
5. Recommend detergent categories such as mild liquid detergent,
   colour-safe detergent, delicate detergent, or wool-safe detergent.
6. Do not recommend commercial detergent brands.
7. If reliable information cannot be determined, use null.
8. Care source must state whether the result came from the care label,
   visual estimation, or a mixture of both.
    `.trim();

    const garmentImageBase64 =
      await fileToBase64(garmentImage);

    const input = [
      {
        type: "text" as const,
        text: prompt,
      },
      {
        type: "image" as const,
        data: garmentImageBase64,
        mime_type: garmentImage.type,
      },
    ];

    if (hasCareLabel) {
      const careLabelBase64 =
        await fileToBase64(careLabelImage);

      input.push(
        {
          type: "text" as const,
          text:
            "This next image is the material and care label. Read all visible composition text, washing text, and care symbols carefully.",
        },
        {
          type: "image" as const,
          data: careLabelBase64,
          mime_type: careLabelImage.type,
        },
      );
    }

    const gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const interaction = await gemini.interactions.create({
      model: "gemini-3.6-flash",

      input,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: garmentAnalysisJsonSchema,
      },
    });

    if (!interaction.output_text) {
      return NextResponse.json(
        {
          error: "Gemini did not return a usable analysis.",
        },
        {
          status: 502,
        },
      );
    }

    const parsedJson = JSON.parse(
      interaction.output_text,
    );

    const analysis =
      GarmentAnalysisSchema.parse(parsedJson);

    return NextResponse.json({
      analysis,
    });
  } catch (error) {
    console.error("Gemini garment analysis failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error:
            "Gemini returned information in an unexpected format.",
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
            : "The garment could not be analyzed.",
      },
      {
        status: 500,
      },
    );
  }
}