import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { login, signup } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-[#f4efe6]">
      <div className="absolute left-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#c7a66a]/10 blur-[120px]" />

      <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-white/[0.03] blur-[130px]" />

      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-[#151410] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-10">
        <div className="flex items-center justify-between">
          <BrandLogo href="/" compact />

          <Link
            href="/"
            className="text-sm text-[#a59d8e] hover:text-[#f4efe6]"
          >
            ← Back home
          </Link>
        </div>

        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
          Access your closet
        </h1>

        <p className="mt-3 leading-6 text-[#a59d8e]">
          Sign in or create an account to start building your virtual
          wardrobe.
        </p>

        {params.error && (
          <div className="mt-6 rounded-xl border border-[#c87a72]/30 bg-[#c87a72]/10 p-4 text-sm text-[#e6b7b1]">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mt-6 rounded-xl border border-[#8fa98a]/30 bg-[#8fa98a]/10 p-4 text-sm text-[#c7dbc2]">
            {params.message}
          </div>
        )}

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#e8e1d6]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#e8e1d6]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-white/[0.12] bg-[#0f0f0d] px-4 py-3 outline-none focus:border-[#c7a66a]/50"
            />
          </div>

          <button
            formAction={login}
            className="w-full rounded-xl bg-[#e6d3ae] px-5 py-3 font-semibold text-[#17130d] hover:bg-[#f4e5c8]"
          >
            Sign in
          </button>

          <button
            formAction={signup}
            className="w-full rounded-xl border border-white/[0.15] px-5 py-3 font-semibold text-[#e8e1d6] hover:bg-white/[0.05]"
          >
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}
