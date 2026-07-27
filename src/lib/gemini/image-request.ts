import { GoogleGenAI } from "@google/genai";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateImage(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    return `${file.name} must be a JPG, PNG, or WEBP image.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than 10 MB.`;
  }

  return null;
}

export async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return buffer.toString("base64");
}

export function createGeminiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

function isRateLimitError(error: unknown): boolean {
  const statusCode = (error as { statusCode?: number })
    ?.statusCode;

  if (statusCode === 429) {
    return true;
  }

  const message =
    error instanceof Error ? error.message : String(error);

  return (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("exceeded your current quota") ||
    message.includes("429")
  );
}

export function describeGeminiError(error: unknown): string {
  if (isRateLimitError(error)) {
    return "Gemini's free-tier request limit was reached. Wait about a minute and try again, or check your plan and billing at ai.google.dev.";
  }

  return error instanceof Error
    ? error.message
    : "The request to Gemini failed.";
}
