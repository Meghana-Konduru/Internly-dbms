
import Link from "next/link";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-5 py-12 text-[#211b35]">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-100/60">

        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center justify-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-2xl font-extrabold text-[#211b35]">
            internly.
          </span>
        </Link>

        {/* Heading */}
        <h1 className="text-center text-3xl font-extrabold text-[#211b35]">
          Welcome back!
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Log in to continue your career journey.
        </p>

        {/* Login Form */}
        <form className="mt-9 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Email address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-violet-600 hover:text-violet-800"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white transition hover:bg-violet-700"
          >
            Log in
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-violet-600 hover:text-violet-800"
          >
            Sign up
          </Link>
        </p>

        {/* Back to Home */}
        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-violet-600"
        >
          ← Back to home
        </Link>

      </div>
    </main>
  );
}
