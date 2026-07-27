"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import BrandLogo from "@/components/brand-logo";

type DashboardHeaderProps = {
  itemCount?: number | null;
  userEmail?: string;
  logoutAction: () => Promise<void>;
};

const navigationItems = [
  {
    label: "My closet",
    href: "/dashboard",
  },
  {
    label: "Add clothing",
    href: "/dashboard/add-item",
  },
  {
    label: "Generate outfit",
    href: "/dashboard/outfits",
  },
  {
    label: "Saved outfits",
    href: "/dashboard/saved-outfits",
  },
];

export default function DashboardHeader({
  itemCount = null,
  userEmail,
  logoutAction,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [previousPathname, setPreviousPathname] =
    useState(pathname);

  // Close the mobile menu when the route changes.
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0c0c0b]/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo />

          <nav className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm transition ${
                    active
                      ? "bg-white/[0.08] text-[#f4efe6]"
                      : "text-[#9f988b] hover:bg-white/[0.04] hover:text-[#f4efe6]"
                  }`}
                >
                  {item.label}

                  {active && (
                    <span className="absolute inset-x-4 -bottom-[19px] h-px bg-[#c7a66a]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {itemCount !== null && (
              <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
                <p className="text-xs text-[#777064]">
                  Closet
                </p>

                <p className="text-sm font-semibold text-[#e6d3ae]">
                  {itemCount}{" "}
                  {itemCount === 1
                    ? "piece"
                    : "pieces"}
                </p>
              </div>
            )}

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/[0.1] px-4 py-2 text-sm text-[#b8b0a3] transition hover:border-[#c7a66a]/45 hover:bg-[#c7a66a]/10 hover:text-[#f4efe6]"
              >
                Sign out
              </button>
            </form>
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
        className={`fixed inset-0 z-50 transition lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-white/[0.08] bg-[#11110f] px-6 pb-8 pt-6 shadow-2xl transition duration-300 ${
            menuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <BrandLogo compact />

            <button
              type="button"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] text-xl text-[#b8b0a3]"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-[#c7a66a]/20 bg-[#c7a66a]/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#8d7042]">
              Your wardrobe
            </p>

            {itemCount !== null && (
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[#f4efe6]">
                {itemCount}{" "}
                {itemCount === 1
                  ? "piece"
                  : "pieces"}
              </p>
            )}

            {userEmail && (
              <p className="mt-2 truncate text-xs text-[#777064]">
                {userEmail}
              </p>
            )}
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map(
              (item, index) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(
                        item.href,
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 transition ${
                      active
                        ? "border-[#c7a66a]/30 bg-[#c7a66a]/10 text-[#f4efe6]"
                        : "border-transparent text-[#a59d8e] hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-[#f4efe6]"
                    }`}
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
                  </Link>
                );
              },
            )}
          </nav>

          <div className="mt-auto">
            <div className="mb-5 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-2xl border border-white/[0.1] px-5 py-4 text-left text-sm text-[#a59d8e] transition hover:border-[#c87a72]/30 hover:bg-[#c87a72]/10 hover:text-[#f4efe6]"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}