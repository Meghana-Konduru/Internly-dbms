
import Link from "next/link";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export default function Signup() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-5 py-10 text-[#211b35]">
      <div className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-100/60">

        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-2xl font-extrabold">internly.</span>
        </Link>

        <h1 className="text-center text-3xl font-extrabold">
          Create your account
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Join INTERNLY and discover exciting opportunities.
        </p>

        <form className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Full name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

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
              I am registering as
            </label>
            <select
              required
              defaultValue="student"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-violet-500"
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white transition hover:bg-violet-700"
          >
            Create account <ArrowRight size={18} />
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-violet-600">
            Log in
          </Link>
        </p>

        <Link href="/" className="mt-5 block text-center text-sm text-gray-500 hover:text-violet-600">
          ← Back to home
        </Link>

      </div>
    </main>
  );
}
