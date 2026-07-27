import Link from "next/link";

import HomeHeader from "@/components/home-header";

const features = [
  {
    number: "01",
    title: "Your virtual closet",
    description:
      "Photograph and organize the clothing you already own in one private digital collection.",
    detail: "Private garment storage",
  },
  {
    number: "02",
    title: "Intelligent clothing care",
    description:
      "Analyze care labels, materials, washing instructions, and detergent recommendations.",
    detail: "AI-assisted care guidance",
  },
  {
    number: "03",
    title: "Outfits for every occasion",
    description:
      "Choose an occasion and create thoughtful combinations using real pieces from your closet.",
    detail: "Your clothing only",
  },
];

const steps = [
  {
    number: "01",
    title: "Photograph your garments",
    description:
      "Upload a clear clothing image and an optional photograph of its care label.",
  },
  {
    number: "02",
    title: "Review the AI analysis",
    description:
      "Confirm the material, colour, care guidance, and detergent recommendation.",
  },
  {
    number: "03",
    title: "Create your outfit",
    description:
      "Select an occasion and let Garmently style pieces you already own.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden text-[#f4efe6]">
      <HomeHeader />

      <section className="relative">
        <div className="absolute left-[-12rem] top-[-6rem] h-[30rem] w-[30rem] rounded-full bg-[#c7a66a]/10 blur-[120px]" />

        <div className="absolute right-[-14rem] top-20 h-[34rem] w-[34rem] rounded-full bg-white/[0.035] blur-[130px]" />

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#c7a66a]/25 bg-[#c7a66a]/[0.06] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c7a66a] shadow-[0_0_12px_rgba(199,166,106,0.7)]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c7a66a]">
                The intelligent wardrobe
              </span>
            </div>

            <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-display)] text-6xl font-semibold leading-[0.88] tracking-tight sm:text-7xl lg:text-[6.2rem]">
              Your wardrobe,
              <span className="block italic text-[#e6d3ae]">
                thoughtfully curated.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-[#a59d8e] sm:text-lg">
              Build a private virtual closet, understand how to care for
              every garment, and create outfits for any occasion using
              clothing you already own.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#e6d3ae] px-7 py-4 text-sm font-semibold text-[#17130d] transition hover:bg-[#f4e5c8]"
              >
                Build your virtual closet

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.03] px-7 py-4 text-sm font-semibold text-[#e8e1d6] transition hover:border-[#c7a66a]/35 hover:bg-[#c7a66a]/10"
              >
                See how it works

                <span className="text-[#c7a66a]">
                  ↓
                </span>
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-9 gap-y-5 border-t border-white/[0.07] pt-7">
              <HeroDetail
                value="Private"
                label="Closet storage"
              />

              <HeroDetail
                value="AI"
                label="Care analysis"
              />

              <HeroDetail
                value="Personal"
                label="Outfit styling"
              />
            </div>
          </div>

          <ClosetPreview />
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/[0.06] px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          <TrustDetail
            title="Built around your closet"
            description="Every generated outfit uses pieces you actually own."
          />

          <TrustDetail
            title="Care labels come first"
            description="Manufacturer instructions remain the strongest source."
          />

          <TrustDetail
            title="Private by design"
            description="Your wardrobe images remain protected inside your account."
          />
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32"
      >
        <SectionIntroduction
          label="Designed for everyday dressing"
          title="A more thoughtful relationship with your clothes."
          description="Garmently combines clothing organization, care guidance, and personal styling in one private space."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#151410] p-7 transition duration-500 hover:-translate-y-1 hover:border-[#c7a66a]/30 hover:shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:p-8"
            >
              <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#c7a66a]/0 blur-3xl transition group-hover:bg-[#c7a66a]/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.24em] text-[#8d7042]">
                    {feature.number}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.09] text-[#c7a66a] transition group-hover:border-[#c7a66a]/35 group-hover:bg-[#c7a66a]/10">
                    ✦
                  </span>
                </div>

                <h2 className="mt-14 font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {feature.title}
                </h2>

                <p className="mt-4 leading-7 text-[#a59d8e]">
                  {feature.description}
                </p>

                <div className="mt-8 flex items-center gap-3 border-t border-white/[0.07] pt-5">
                  <span className="h-px w-8 bg-[#c7a66a]/60" />

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777064]">
                    {feature.detail}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="clothing-care"
        className="border-y border-white/[0.06] bg-[#11110f]"
      >
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#171611] p-6 sm:p-8">
            <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-[#c7a66a]/10 blur-3xl" />

            <div className="relative rounded-[1.5rem] border border-white/[0.08] bg-[#0f0f0d] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d7042]">
                    Clothing analysis
                  </p>

                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                    Cotton knit top
                  </h3>
                </div>

                <span className="rounded-full border border-[#8fa98a]/25 bg-[#8fa98a]/10 px-3 py-1 text-xs text-[#b8cfb3]">
                  94% confidence
                </span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <CareDetail
                  label="Material"
                  value="100% cotton"
                />

                <CareDetail
                  label="Wash"
                  value="Cold, gentle cycle"
                />

                <CareDetail
                  label="Dry"
                  value="Air dry recommended"
                />

                <CareDetail
                  label="Detergent"
                  value="Mild liquid formula"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[#c7a66a]/15 bg-[#c7a66a]/[0.05] p-5">
                <div className="flex items-center gap-2">
                  <span className="text-[#c7a66a]">
                    ✦
                  </span>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c7a66a]">
                    Care recommendation
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#a59d8e]">
                  Wash with similar colours, avoid bleach, and reshape the
                  garment before air drying.
                </p>
              </div>
            </div>

            <div className="absolute bottom-7 right-7 w-[74%] rounded-[1.5rem] border border-white/[0.08] bg-[#1d1b16]/90 p-5 shadow-2xl backdrop-blur-lg sm:w-[62%]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#777064]">
                Source priority
              </p>

              <div className="mt-4 space-y-3">
                <PriorityRow
                  number="01"
                  label="Manufacturer care label"
                />

                <PriorityRow
                  number="02"
                  label="Material composition"
                />

                <PriorityRow
                  number="03"
                  label="Visual estimation"
                />
              </div>
            </div>
          </div>

          <div>
            <SectionIntroduction
              label="Protect every garment"
              title="Better care begins with better information."
              description="Photograph the care label and Garmently will organize the material composition, washing guidance, drying instructions, and detergent category."
            />

            <div className="mt-9 space-y-5">
              <InformationPoint
                number="01"
                title="Care-label focused"
                description="Manufacturer instructions remain more authoritative than a visual estimate."
              />

              <InformationPoint
                number="02"
                title="Review before saving"
                description="Every AI-generated field can be corrected before it becomes part of your closet."
              />

              <InformationPoint
                number="03"
                title="Practical detergent guidance"
                description="Receive detergent categories rather than unnecessary product advertising."
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32"
      >
        <SectionIntroduction
          label="Three simple steps"
          title="From photograph to complete outfit."
          description="Garmently turns the clothing you already own into an organized, useful, and intelligent wardrobe."
        />

        <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-[#c7a66a]/40 to-transparent lg:block" />

          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-[2rem] border border-white/[0.08] bg-[#151410] p-7 sm:p-8"
            >
              <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#c7a66a]/30 bg-[#16140f] font-[family-name:var(--font-display)] text-2xl font-semibold text-[#e6d3ae] shadow-[0_0_0_8px_#0c0c0b]">
                {step.number}
              </span>

              <h2 className="mt-10 font-[family-name:var(--font-display)] text-3xl font-semibold">
                {step.title}
              </h2>

              <p className="mt-4 leading-7 text-[#a59d8e]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#c7a66a]/20 bg-[#17150f] px-6 py-16 text-center shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:px-10 sm:py-24">
          <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#c7a66a]/15 blur-[110px]" />

          <div className="absolute bottom-[-6rem] right-[-2rem] font-[family-name:var(--font-display)] text-[16rem] font-semibold leading-none text-white/[0.018]">
            G
          </div>

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c7a66a]">
              Your closet, reimagined
            </p>

            <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] sm:text-6xl">
              Start dressing with
              <span className="block italic text-[#e6d3ae]">
                intention.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl leading-8 text-[#a59d8e]">
              Organize your garments, protect them with better care, and
              create outfits tailored to your life.
            </p>

            <Link
              href="/login"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-[#e6d3ae] px-7 py-4 font-semibold text-[#17130d] transition hover:bg-[#f4e5c8]"
            >
              Build your wardrobe

              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <BrandFooter />

          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#777064]">
            <a
              href="#features"
              className="transition hover:text-[#e6d3ae]"
            >
              Features
            </a>

            <a
              href="#clothing-care"
              className="transition hover:text-[#e6d3ae]"
            >
              Clothing care
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-[#e6d3ae]"
            >
              How it works
            </a>

            <Link
              href="/login"
              className="transition hover:text-[#e6d3ae]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ClosetPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:mr-0">
      <div className="absolute -inset-8 rounded-full bg-[#c7a66a]/10 blur-3xl" />

      <div className="relative rounded-[2rem] border border-white/[0.09] bg-[#151410]/95 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-2 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8d7042]">
              My collection
            </p>

            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
              The wardrobe
            </p>
          </div>

          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#a59d8e]">
            12 pieces
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <PreviewGarment
            name="Wool overcoat"
            category="Outerwear"
            background="bg-gradient-to-br from-[#5c5142] via-[#2d2922] to-[#171612]"
          />

          <PreviewGarment
            name="Cotton knit"
            category="Top"
            background="bg-gradient-to-br from-[#8c725f] via-[#4c3e34] to-[#1b1714]"
          />

          <PreviewGarment
            name="Tailored trouser"
            category="Bottom"
            background="bg-gradient-to-br from-[#5d5a50] via-[#34332e] to-[#171713]"
          />

          <div className="relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[1.4rem] border border-dashed border-[#c7a66a]/25 bg-[#c7a66a]/[0.04] p-5">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c7a66a]/10 blur-2xl" />

            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#c7a66a]/25 text-xl text-[#c7a66a]">
              +
            </span>

            <div className="relative">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                Add a piece
              </p>

              <p className="mt-2 text-xs leading-5 text-[#777064]">
                Photograph and organize another garment.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[1.4rem] border border-[#c7a66a]/15 bg-[#c7a66a]/[0.05] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c7a66a]/10 text-[#c7a66a]">
              ✦
            </span>

            <div>
              <p className="text-sm font-semibold text-[#e8e1d6]">
                Outfit ready
              </p>

              <p className="mt-1 text-xs text-[#777064]">
                Casual dinner · 3 selected pieces
              </p>
            </div>
          </div>

          <span className="text-[#c7a66a]">
            →
          </span>
        </div>
      </div>

      <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-white/[0.08] bg-[#11110f]/95 px-5 py-4 shadow-2xl backdrop-blur-xl sm:block">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#777064]">
          Care analysis
        </p>

        <p className="mt-2 text-sm font-semibold text-[#e6d3ae]">
          Cotton · Gentle wash
        </p>
      </div>
    </div>
  );
}

type PreviewGarmentProps = {
  name: string;
  category: string;
  background: string;
};

function PreviewGarment({
  name,
  category,
  background,
}: PreviewGarmentProps) {
  return (
    <article
      className={`group relative min-h-52 overflow-hidden rounded-[1.4rem] border border-white/[0.08] ${background}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
        {category}
      </div>

      <div className="absolute inset-x-4 bottom-4">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
          {name}
        </p>

        <div className="mt-3 h-px w-full bg-white/[0.1]" />

        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/50">
          View details →
        </p>
      </div>
    </article>
  );
}

type HeroDetailProps = {
  value: string;
  label: string;
};

function HeroDetail({
  value,
  label,
}: HeroDetailProps) {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#e6d3ae]">
        {value}
      </p>

      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#777064]">
        {label}
      </p>
    </div>
  );
}

type TrustDetailProps = {
  title: string;
  description: string;
};

function TrustDetail({
  title,
  description,
}: TrustDetailProps) {
  return (
    <div className="px-5 py-7 md:px-8">
      <div className="flex items-start gap-4">
        <span className="mt-1 text-[#c7a66a]">
          ✦
        </span>

        <div>
          <p className="font-semibold text-[#e8e1d6]">
            {title}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#777064]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

type SectionIntroductionProps = {
  label: string;
  title: string;
  description: string;
};

function SectionIntroduction({
  label,
  title,
  description,
}: SectionIntroductionProps) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#c7a66a]" />

        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c7a66a]">
          {label}
        </p>
      </div>

      <h2 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] sm:text-6xl">
        {title}
      </h2>

      <p className="mt-6 max-w-2xl text-base leading-8 text-[#a59d8e] sm:text-lg">
        {description}
      </p>
    </div>
  );
}

type CareDetailProps = {
  label: string;
  value: string;
};

function CareDetail({
  label,
  value,
}: CareDetailProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#777064]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-[#e8e1d6]">
        {value}
      </p>
    </div>
  );
}

type PriorityRowProps = {
  number: string;
  label: string;
};

function PriorityRow({
  number,
  label,
}: PriorityRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-semibold text-[#8d7042]">
        {number}
      </span>

      <span className="h-px flex-1 bg-white/[0.07]" />

      <span className="text-xs text-[#a59d8e]">
        {label}
      </span>
    </div>
  );
}

type InformationPointProps = {
  number: string;
  title: string;
  description: string;
};

function InformationPoint({
  number,
  title,
  description,
}: InformationPointProps) {
  return (
    <div className="flex gap-5 border-t border-white/[0.07] pt-5">
      <span className="text-xs font-semibold tracking-[0.16em] text-[#8d7042]">
        {number}
      </span>

      <div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          {title}
        </h3>

        <p className="mt-2 leading-7 text-[#8f877a]">
          {description}
        </p>
      </div>
    </div>
  );
}

function BrandFooter() {
  return (
    <div>
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Garmently
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8d7042]">
        Artificial Intelligence
      </p>
    </div>
  );
}