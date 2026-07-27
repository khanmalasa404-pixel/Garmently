import {
  Modality,
  createPartFromBase64,
  createUserContent,
} from "@google/genai";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  createGeminiClient,
  describeGeminiError,
  fileToBase64,
  validateImage,
} from "@/lib/gemini/image-request";

export const runtime = "nodejs";

const CATALOG_PHOTO_MODEL = "gemini-2.5-flash-image";

const CATALOG_PHOTO_PROMPT = `
Replace the background of this clothing photo with a seamless, evenly lit,
pure white studio background, as used in e-commerce catalog photography.
Preserve the garment exactly as-is: do not change its shape, color,
texture, pattern, folds, or any printed or embroidered detail. Do not add
people, mannequins, new objects, shadows, text, or watermarks. Keep the
garment centered and fully visible.
`.trim();

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
          error: "You must be signed in to generate a catalog photo.",
        },
        {
          status: 401,
        },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "A garment photograph is required.",
        },
        {
          status: 400,
        },
      );
    }

    const imageError = validateImage(image);

    if (imageError) {
      return NextResponse.json(
        {
          error: imageError,
        },
        {
          status: 400,
        },
      );
    }

    const imageBase64 = await fileToBase64(image);

    const gemini = createGeminiClient();

    const result = await gemini.models.generateContent({
      model: CATALOG_PHOTO_MODEL,

      contents: [
        createUserContent([
          CATALOG_PHOTO_PROMPT,
          createPartFromBase64(imageBase64, image.type),
        ]),
      ],

      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const inlineData = result.candidates
      ?.at(0)
      ?.content?.parts?.find((part) => part.inlineData)?.inlineData;

    if (!inlineData?.data || !inlineData.mimeType) {
      return NextResponse.json(
        {
          error: "Gemini did not return a usable catalog photo.",
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      image: inlineData.data,
      mimeType: inlineData.mimeType,
    });
  } catch (error) {
    console.error("Catalog photo generation failed:", error);

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
