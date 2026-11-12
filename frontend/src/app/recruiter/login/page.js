
"use client";

import { useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submit(e) {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setMessage("Enter a valid email address.");
    }

    if (password.length < 8) {
      return setMessage(
        "Password must contain at least 8 characters."
      );
    }

    localStorage.setItem(
      "internly_recruiter",
      JSON.stringify({
        email,
        loggedIn: true,
      })
    );

    window.location.href = "/recruiter/dashboard";
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

            <h1
              className="text-2xl font-extrabold"
              style={{ color: "#211b35" }}
            >
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

        <form
          onSubmit={submit}
          className="mt-6 space-y-4"
        >
          <label
            className="block text-sm font-semibold"
            style={{ color: "#211b35" }}
          >
            Work email

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
              style={{
                color: "#211b35",
                backgroundColor: "#ffffff",
              }}
            />
          </label>

          <label
            className="block text-sm font-semibold"
            style={{ color: "#211b35" }}
          >
            Password

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
              style={{
                color: "#211b35",
                backgroundColor: "#ffffff",
              }}
            />
          </label>

          <button className="w-full rounded-xl bg-violet-600 p-3 font-bold text-white hover:bg-violet-700">
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-400">
          Demo-only login; connect real authentication
          through the backend before deployment.
        </p>

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
