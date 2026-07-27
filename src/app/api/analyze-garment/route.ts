import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import {
  createGeminiClient,
  describeGeminiError,
  fileToBase64,
  validateImage,
} from "@/lib/gemini/image-request";

export const runtime = "nodejs";

const MAX_TOTAL_SIZE = 27 * 1024 * 1024;

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

  boundingBox: z
    .object({
      xMin: z.number().min(0).max(1),
      yMin: z.number().min(0).max(1),
      xMax: z.number().min(0).max(1),
      yMax: z.number().min(0).max(1),
    })
    .nullable(),

  brandSource: z.enum([
    "garment-photo",
    "tag-photo",
    "unknown",
  ]),

  brandConfidence: z.number().min(0).max(1).nullable(),
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

    boundingBox: {
      type: ["object", "null"],
      description:
        "Normalized bounding box of the garment in the first (garment) image, as fractions of image width/height (0 to 1, origin top-left). Null if the garment cannot be confidently localized.",
      properties: {
        xMin: { type: "number", minimum: 0, maximum: 1 },
        yMin: { type: "number", minimum: 0, maximum: 1 },
        xMax: { type: "number", minimum: 0, maximum: 1 },
        yMax: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["xMin", "yMin", "xMax", "yMax"],
      additionalProperties: false,
    },

    brandSource: {
      type: "string",
      enum: ["garment-photo", "tag-photo", "unknown"],
    },

    brandConfidence: {
      type: ["number", "null"],
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
    "boundingBox",
    "brandSource",
    "brandConfidence",
  ],

  additionalProperties: false,
};

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
    const tagImage = formData.get("tagImage");

    const tagBarcodeValueRaw = formData.get("tagBarcodeValue");
    const tagBarcodeFormatRaw = formData.get("tagBarcodeFormat");

    const tagBarcodeValue =
      typeof tagBarcodeValueRaw === "string" && tagBarcodeValueRaw.trim()
        ? tagBarcodeValueRaw.trim()
        : null;

    const tagBarcodeFormat =
      typeof tagBarcodeFormatRaw === "string" && tagBarcodeFormatRaw.trim()
        ? tagBarcodeFormatRaw.trim()
        : null;

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
    }

    const hasTagImage =
      tagImage instanceof File && tagImage.size > 0;

    if (hasTagImage) {
      const tagImageError = validateImage(tagImage);

      if (tagImageError) {
        return NextResponse.json(
          {
            error: tagImageError,
          },
          {
            status: 400,
          },
        );
      }
    }

    const totalSize =
      garmentImage.size +
      (hasCareLabel ? careLabelImage.size : 0) +
      (hasTagImage ? tagImage.size : 0);

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        {
          error:
            "The uploaded images together must be smaller than 27 MB.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = `
Analyze these photographs for a virtual wardrobe application.

The first image is the clothing item. A second image, when supplied, is
the garment's material and care label. A third image, when supplied, is
the garment's hangtag/brand label, which may show a printed brand name,
logo, style number, or barcode/QR code.

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
- A bounding box around the garment in the first image
- Where the brand was identified from, and how confidently

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
9. If a brand is identified with reasonable confidence, suggestedName
   MUST start with that exact brand name (e.g. "Zara Wool Overcoat", not
   "Wool Overcoat"). If no brand is identified, do not invent one.
10. When a third "tag" image is supplied, look for a visible brand name
    or logo printed or woven on it — this is a stronger brand signal
    than the garment photo alone. A decoded barcode/QR value alone is
    not sufficient evidence of a brand or specific product; do not
    assert a product match from a code with no accompanying readable
    brand text.
11. Estimate a normalized bounding box tightly around the garment in the
    first (garment) image, as fractions of image width/height (0 to 1,
    origin top-left). If the garment cannot be confidently localized,
    return null for boundingBox.
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

    if (hasTagImage) {
      const tagImageBase64 = await fileToBase64(tagImage);

      input.push(
        {
          type: "text" as const,
          text:
            "This next image is the garment's hangtag/brand label. Read any visible brand name, logo, or style number carefully.",
        },
        {
          type: "image" as const,
          data: tagImageBase64,
          mime_type: tagImage.type,
        },
      );
    }

    if (tagBarcodeValue) {
      input.push({
        type: "text" as const,
        text: `A barcode/QR code on the tag was already decoded as: ${tagBarcodeValue}${
          tagBarcodeFormat ? ` (format: ${tagBarcodeFormat})` : ""
        }. Treat this only as weak supporting context — do not claim to identify a specific product/SKU from it.`,
      });
    }

    const gemini = createGeminiClient();

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
        error: describeGeminiError(error),
      },
      {
        status: 500,
      },
    );
  }
}