import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export default function BrandLogo({
  href = "/dashboard",
  compact = false,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3"
      aria-label="Garmently home"
    >
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#c7a66a]/35 bg-[#171611] shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition duration-300 group-hover:border-[#c7a66a]/70 group-hover:shadow-[0_10px_35px_rgba(199,166,106,0.12)]">
        <span className="absolute inset-0 bg-gradient-to-br from-[#c7a66a]/15 via-transparent to-transparent" />

        <svg
          viewBox="0 0 48 48"
          className="relative h-7 w-7"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M24 10.5C24 7.5 26.2 5.5 29 5.5C31.7 5.5 34 7.6 34 10.3C34 13.6 31.8 15.1 29.3 16.6L27.8 17.5"
            stroke="#E6D3AE"
            strokeWidth="2.3"
            strokeLinecap="round"
          />

          <path
            d="M24 16.5L9.5 30.5C8.1 31.9 9.1 34.3 11.1 34.3H36.9C38.9 34.3 39.9 31.9 38.5 30.5L24 16.5Z"
            stroke="#C7A66A"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />

          <path
            d="M17.2 34.3L20.5 41L24 34.3L27.5 41L30.8 34.3"
            stroke="#E6D3AE"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {!compact && (
        <span className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-[#f4efe6]">
          Garment<span className="text-[#c7a66a]">Ly</span>
        </span>
      )}
    </Link>
  );
}