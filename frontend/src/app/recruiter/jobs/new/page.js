
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { apiRequest } from "@/lib/api";

const blank = {
  company: "",
  role: "",
  category: "Technology",
  location: "",
  duration: "",
  type: "Remote",
  stipend: "",
  deadline: "",
  description: "",
  skills: "",
};

export default function NewInternship() {
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    const skills = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (
      !form.role.trim() ||
      !form.location.trim() ||
      !form.deadline ||
      !form.description.trim() ||
      !skills.length
    ) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (!sessionStorage.getItem("internly_access_token")) {
      setMessage("Please log in as a recruiter first.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest("/api/recruiters/me/jobs", {
        method: "POST",
        body: {
          title: form.role.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          deadline: form.deadline,
        },
      });

      setMessage(
        `${result.message}. Internship ID: ${result.job.job_id}`
      );
      setForm(blank);
    } catch (err) {
      setMessage(err.message || "Could not create internship.");
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, placeholder, type = "text", required = true) => (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-violet-500"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <BriefcaseBusiness className="text-violet-600" />
          <h1 className="text-3xl font-extrabold">Post an internship</h1>
        </div>

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-700"
          >
            {message}
          </p>
        )}

        <form
          onSubmit={submit}
          className="mt-7 grid gap-4 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          {field("Company name (display only)", "company", "Company name", "text", false)}
          {field("Internship role", "role", "e.g. Backend Developer Intern")}

          <label className="block text-sm font-semibold">
            Category (display only)
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            >
              <option>Technology</option>
              <option>Development</option>
              <option>Design</option>
              <option>Analytics</option>
              <option>Marketing</option>
              <option>Finance</option>
              <option>Other</option>
            </select>
          </label>

          {field("Location", "location", "City or Remote")}
          {field("Duration (display only)", "duration", "e.g. 3 months", "text", false)}

          <label className="block text-sm font-semibold">
            Work type (display only)
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            >
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </label>

          {field("Stipend (display only)", "stipend", "e.g. ₹15,000/month", "text", false)}
          {field("Application deadline", "deadline", "", "date")}

          <label className="block text-sm font-semibold sm:col-span-2">
            Description
            <textarea
              required
              maxLength={1500}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border p-3 font-normal"
              placeholder="Describe responsibilities and requirements"
            />
          </label>

          <label className="block text-sm font-semibold sm:col-span-2">
            Required skills (display only; not saved yet)
            <input
              required
              value={form.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="React, JavaScript, CSS"
              className="mt-1 w-full rounded-xl border p-3 font-normal"
            />
          </label>

          <p className="text-xs text-gray-500 sm:col-span-2">
            Currently, PostgreSQL stores the role, description, location and
            deadline. Other fields are collected for display but are not saved.
          </p>

          <button
            disabled={saving}
            className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-60 sm:col-span-2"
          >
            {saving ? "Publishing..." : "Publish internship"}
          </button>
        </form>
      </div>
    </main>
  );
}
