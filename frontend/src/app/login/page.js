
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("internly_demo_accounts") || "[]"
      );

      if (!Array.isArray(accounts)) {
        setError("Unable to read account records. Please try again.");
        return;
      }

      const account = accounts.find(
        (item) => item.email === normalizedEmail
      );

      if (!account) {
        setError("No account found with this email. Please sign up first.");
        return;
      }

      if (!account.passwordHash) {
        setError(
          "This account was created using the older signup version. Please register again with this email after removing its old demo account."
        );
        return;
      }

      const passwordHash = await hashPassword(password);

      if (passwordHash !== account.passwordHash) {
        setError("Incorrect password. Please try again.");
        return;
      }

      if (account.role === "student") {
        localStorage.setItem(
          "internly_current_student",
          JSON.stringify({
            id: account.id,
            name: account.name,
            email: account.email,
            role: "student",
          })
        );

        const students = JSON.parse(
          localStorage.getItem("internly_students") || "[]"
        );

        const student = students.find(
          (item) => String(item.id) === String(account.id)
        );

        if (student?.profile) {
          localStorage.setItem(
            "internly_profile",
            JSON.stringify(student.profile)
          );
        }

        setMessage("Login successful! Opening your dashboard...");

        router.push("/dashboard");
      } else if (account.role === "recruiter") {
        localStorage.setItem(
          "internly_recruiter",
          JSON.stringify({
            id: account.id,
            name: account.name,
            email: account.email,
            loggedIn: true,
          })
        );

        setMessage("Login successful! Opening recruiter dashboard...");

        router.push("/recruiter/dashboard");
      } else {
        setError("Invalid account role. Please contact support.");
      }
    } catch {
      setError("Something went wrong while logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-5 py-12 text-[#211b35]">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-100/60">

        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-2"
        >
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={24} />
          </div>
          <span className="text-2xl font-extrabold text-[#211b35]">
            internly.
          </span>
        </Link>

        <h1 className="text-center text-3xl font-extrabold">
          Welcome back!
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Log in to continue your career journey.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </p>
        )}

        <form onSubmit={submit} className="mt-9 space-y-5">

          <label className="block text-sm font-semibold text-gray-800">
            Email address
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`${inputClass} mt-2`}
            />
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Password
            <input
              type="password"
              required
              maxLength={64}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`${inputClass} mt-2`}
            />
          </label>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-violet-600 hover:text-violet-800"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-violet-600 hover:text-violet-800"
          >
            Sign up
          </Link>
        </p>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 hover:text-violet-600"
        >
          Back to Home
        </Link>

        <p className="mt-5 text-center text-xs text-gray-400">
          Demo authentication only. Real authentication must use the backend.
        </p>
      </div>
    </main>
  );
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
