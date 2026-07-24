import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-bold">
          Wardrobe AI
        </Link>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-neutral-300 hover:text-white"
          >
            Sign in
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
        <p className="mb-4 rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300">
          Your intelligent virtual closet
        </p>

        <h1 className="max-w-3xl text-5xl font-bold leading-tight sm:text-6xl">
          Take better care of your clothes and always know what to wear.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
          Upload your clothing, receive personalized care instructions, and
          generate complete outfits using pieces you already own.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
          >
            Build your closet
          </Link>

          <a
            href="#features"
            className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold hover:bg-neutral-900"
          >
            See how it works
          </a>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3"
      >
        <FeatureCard
          title="Virtual Closet"
          description="Photograph and organize every clothing item you own."
        />

        <FeatureCard
          title="Clothing Care"
          description="Understand washing, drying, ironing, and detergent requirements."
        />

        <FeatureCard
          title="Outfit Generator"
          description="Generate outfits for specific occasions using your own wardrobe."
        />
      </section>
    </main>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="mt-3 leading-7 text-neutral-400">
        {description}
      </p>
    </article>
  );
}