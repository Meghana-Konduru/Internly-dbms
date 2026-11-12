
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, ArrowRight } from "lucide-react";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
    setMessage("");
  }

  async function submit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setMessage("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!/^[\p{L}][\p{L}\s.'-]{1,98}$/u.test(name)) {
      setError("Enter a valid full name (2–99 characters).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 64) {
      setError("Password must contain 8–64 characters.");
      return;
    }

    if (
      !/[A-Za-z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const accounts = JSON.parse(
        localStorage.getItem("internly_demo_accounts") || "[]"
      );

      if (!Array.isArray(accounts)) {
        throw new Error("Invalid account records.");
      }

      if (accounts.some((account) => account.email === email)) {
        setError("An account with this email already exists.");
        return;
      }

      const passwordHash = await hashPassword(form.password);

      const account = {
        id: `demo-${Date.now()}`,
        name,
        email,
        role: form.role,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      if (form.role === "student") {
        const students = JSON.parse(
          localStorage.getItem("internly_students") || "[]"
        );

        if (!Array.isArray(students)) {
          throw new Error("Invalid student records.");
        }

        const student = {
          id: account.id,
          profile: {
            name,
            email,
            phone: "",
            college: "",
            degree: "",
            graduationYear: "",
            location: "",
            skills: "",
            about: "",
          },
          skills: [],
          certifications: [],
          resumeName: "",
        };

        localStorage.setItem(
          "internly_students",
          JSON.stringify([...students, student])
        );
      }

      localStorage.setItem(
        "internly_demo_accounts",
        JSON.stringify([...accounts, account])
      );

      setMessage("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push(
          form.role === "student" ? "/login" : "/recruiter/login"
        );
      }, 1000);

    } catch (err) {
      console.error("Signup error:", err);
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-5 py-10 text-[#211b35]">
      <div className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-100/60">

        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={24} />
          </div>

          <span className="text-2xl font-extrabold">
            internly.
          </span>
        </Link>

        <h1 className="text-center text-3xl font-extrabold">
          Create your account
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Join INTERNLY and discover exciting opportunities.
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

        <form onSubmit={submit} className="mt-8 space-y-5">

          <label className="block text-sm font-semibold text-gray-800">
            Full name

            <input
              type="text"
              required
              maxLength={99}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter your full name"
              className={`${inputClass} mt-2`}
            />
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Email address

            <input
              type="email"
              required
              maxLength={254}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className={`${inputClass} mt-2`}
            />
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            I am registering as

            <select
              required
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Password

            <input
              type="password"
              required
              minLength={8}
              maxLength={64}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters"
              className={`${inputClass} mt-2`}
            />
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Confirm password

            <input
              type="password"
              required
              maxLength={64}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) =>
                update("confirmPassword", e.target.value)
              }
              placeholder="Re-enter your password"
              className={`${inputClass} mt-2`}
            />
          </label>

          <p className="text-xs text-gray-400">
            Password must contain at least one letter and one number.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-violet-600"
          >
            Log in
          </Link>
        </p>

        <Link
          href="/"
          className="mt-5 block text-center text-sm text-gray-500 hover:text-violet-600"
        >
          Back to Internly
        </Link>

        <p className="mt-5 text-center text-xs text-gray-400">
          Demo registration only. Real authentication and secure password storage require backend integration.
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
