
"use client";

import { useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setMessage("Enter a valid email address.");
    }

    if (password.length < 8) {
      return setMessage(
        "Password must contain at least 8 characters."
      );
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/auth/recruiter/login",
        {
          method: "POST",
          body: {
            email: email.trim(),
            password,
          },
        }
      );

      if (data.role !== "recruiter" || !data.access_token) {
        throw new Error("Invalid recruiter login response.");
      }

      sessionStorage.setItem(
        "internly_access_token",
        data.access_token
      );

      sessionStorage.setItem(
        "internly_user",
        JSON.stringify(data.user)
      );

      sessionStorage.setItem("internly_role", "recruiter");

      window.location.href = "/recruiter/dashboard";
    } catch (error) {
      setMessage(error.message || "Recruiter login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f8f7fc] px-5 py-10"
      style={{ color: "#211b35" }}
    >
      <section
        className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-xl"
        style={{ color: "#211b35" }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-3 text-white">
            <BriefcaseBusiness />
          </div>

          <div>
            <p className="text-sm font-bold text-violet-600">
              INTERNLY RECRUITER
            </p>

            <h1 className="text-2xl font-extrabold">
              Recruiter login
            </h1>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Sign in to manage internship listings and applicants.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {message}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Work email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 p-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 block text-center text-sm text-violet-700"
        >
          Back to Internly
        </Link>
      </section>
    </main>
  );
}
