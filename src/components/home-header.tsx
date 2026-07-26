"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BrandLogo from "@/components/brand-logo";

const navigationItems = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#how-it-works",
  },
  {
    label: "Clothing care",
    href: "#clothing-care",
  },
];

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0c0c0b]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo href="/" />

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-[#9f988b] transition hover:bg-white/[0.04] hover:text-[#f4efe6]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-[#b8b0a3] transition hover:bg-white/[0.04] hover:text-[#f4efe6]"
            >
              Sign in
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#e6d3ae] px-5 py-2.5 text-sm font-semibold text-[#17130d] transition hover:bg-[#f4e5c8]"
            >
              Build your closet
              <span>→</span>
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] lg:hidden"
          >
            <span className="sr-only">
              Menu
            </span>

            <span className="relative h-5 w-5">
              <span
                className={`absolute left-0 top-1 block h-px w-5 bg-[#f4efe6] transition duration-300 ${
                  menuOpen
                    ? "translate-y-[6px] rotate-45"
                    : ""
                }`}
              />

              <span
                className={`absolute left-0 top-[10px] block h-px w-5 bg-[#f4efe6] transition duration-300 ${
                  menuOpen
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />

              <span
                className={`absolute left-0 top-[16px] block h-px w-5 bg-[#f4efe6] transition duration-300 ${
                  menuOpen
                    ? "-translate-y-[6px] -rotate-45"
                    : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-white/[0.08] bg-[#11110f] px-6 pb-8 pt-6 shadow-2xl transition duration-300 ${
            menuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <BrandLogo href="/" compact />

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] text-xl text-[#b8b0a3]"
            >
              ×
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-[#c7a66a]/20 bg-[#c7a66a]/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d7042]">
              Your intelligent closet
            </p>

            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight text-[#f4efe6]">
              Dress with intention.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map(
              (item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-4 text-[#a59d8e] transition hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-[#f4efe6]"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-xs text-[#8d7042]">
                      0{index + 1}
                    </span>

                    <span className="font-medium">
                      {item.label}
                    </span>
                  </span>

                  <span className="text-[#777064]">
                    →
                  </span>
                </a>
              ),
            )}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full rounded-2xl border border-white/[0.1] px-5 py-4 text-center text-sm font-semibold text-[#e8e1d6]"
            >
              Sign in
            </Link>

            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full rounded-2xl bg-[#e6d3ae] px-5 py-4 text-center text-sm font-semibold text-[#17130d]"
            >
              Build your closet
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}