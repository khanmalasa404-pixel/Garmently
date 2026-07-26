"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AnalysisResult = {
  suggestedName: string;
  category: string;
  brand: string | null;
  primaryColor: string;
  secondaryColors: string[];
  material: string | null;
  pattern: string;
  formality: string;
  washingInstructions: string | null;
  detergentRecommendation: string | null;
  careWarnings: string[];
  careSource: string;
  confidence: number;
};

export default function TestAiPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setResult(null);
    setError("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch("/api/analyze-garment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The analysis failed.");
      }

      setResult(data.analysis);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The garment could not be analyzed.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back to closet
        </Link>

        <p className="mt-10 text-sm uppercase tracking-widest text-neutral-500">
          Wardrobe AI
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Test AI analysis
        </h1>

        <p className="mt-4 text-neutral-400">
          Upload a garment photograph and an optional care-label photograph.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-8"
        >
          <div>
            <label
              htmlFor="garmentImage"
              className="mb-2 block font-medium"
            >
              Garment photograph
            </label>

            <input
              id="garmentImage"
              name="garmentImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
            />
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
              name="careLabelImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-black"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing
              ? "Analyzing photographs..."
              : "Analyze with AI"}
          </button>
        </form>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-6 text-red-200">
            <p className="font-semibold">Analysis failed</p>
            <p className="mt-2 break-words">{error}</p>
          </div>
        )}

        {result && (
          <section className="mt-8 rounded-3xl border border-green-900 bg-green-950/20 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
              Analysis successful
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {result.suggestedName}
            </h2>

            <div className="mt-8 space-y-4">
              <ResultRow
                label="Category"
                value={result.category}
              />

              <ResultRow
                label="Brand"
                value={result.brand}
              />

              <ResultRow
                label="Primary colour"
                value={result.primaryColor}
              />

              <ResultRow
                label="Secondary colours"
                value={result.secondaryColors.join(", ")}
              />

              <ResultRow
                label="Material"
                value={result.material}
              />

              <ResultRow
                label="Pattern"
                value={result.pattern}
              />

              <ResultRow
                label="Formality"
                value={result.formality}
              />

              <ResultRow
                label="Care source"
                value={result.careSource}
              />

              <ResultRow
                label="Confidence"
                value={`${Math.round(result.confidence * 100)}%`}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-neutral-950 p-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Washing instructions
              </p>

              <p className="mt-3 leading-7 text-neutral-300">
                {result.washingInstructions ||
                  "No reliable washing instructions were found."}
              </p>
            </div>

            <div className="mt-5 rounded-2xl bg-neutral-950 p-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Detergent recommendation
              </p>

              <p className="mt-3 leading-7 text-neutral-300">
                {result.detergentRecommendation ||
                  "No reliable detergent recommendation was found."}
              </p>
            </div>

            {result.careWarnings.length > 0 && (
              <div className="mt-5 rounded-2xl bg-neutral-950 p-5">
                <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                  Care warnings
                </p>

                <ul className="mt-3 space-y-2 text-neutral-300">
                  {result.careWarnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

type ResultRowProps = {
  label: string;
  value: string | null;
};

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex justify-between gap-6 border-b border-neutral-800 pb-4">
      <span className="text-neutral-500">{label}</span>

      <span className="text-right font-medium capitalize">
        {value || "Not detected"}
      </span>
    </div>
  );
}