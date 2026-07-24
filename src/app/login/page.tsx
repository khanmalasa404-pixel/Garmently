import Link from "next/link";
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
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
        <Link
          href="/"
          className="text-sm text-neutral-400 hover:text-white"
        >
          ← Back home
        </Link>

        <p className="mt-8 text-sm font-medium uppercase tracking-widest text-neutral-400">
          Wardrobe AI
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Access your closet
        </h1>

        <p className="mt-3 text-neutral-400">
          Sign in or create an account to start building your virtual wardrobe.
        </p>

        {params.error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mt-6 rounded-xl border border-green-900 bg-green-950/40 p-4 text-sm text-green-200">
            {params.message}
          </div>
        )}

        <form className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </div>

          <button
            formAction={login}
            className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-neutral-200"
          >
            Sign in
          </button>

          <button
            formAction={signup}
            className="w-full rounded-xl border border-neutral-700 px-5 py-3 font-semibold hover:bg-neutral-800"
          >
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}