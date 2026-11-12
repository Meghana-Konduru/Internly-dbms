
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Save,
  Globe,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const STORAGE_KEY = "internly_company_profile";

const initialForm = {
  companyName: "",
  industry: "",
  website: "",
  location: "",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

export default function CompanyProfile() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) setForm({ ...initialForm, ...saved });
    } catch {
      setError("Unable to load saved company details.");
    }
  }, []);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  }

  function submit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    const cleaned = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    );

    if (
      !cleaned.companyName ||
      !cleaned.industry ||
      !cleaned.location ||
      !cleaned.description ||
      !cleaned.contactName ||
      !cleaned.contactEmail ||
      !cleaned.contactPhone
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      cleaned.website &&
      !/^https?:\/\/.+\..+/i.test(cleaned.website)
    ) {
      setError("Enter a valid website URL starting with https:// or http://.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.contactEmail)) {
      setError("Enter a valid contact email address.");
      return;
    }

    if (!/^\d{10}$/.test(cleaned.contactPhone)) {
      setError("Contact phone must contain exactly 10 digits.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    setForm(cleaned);
    setMessage("Company profile saved successfully!");
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-normal text-[#211b35] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Building2 size={26} />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-600">
              RECRUITER PORTAL
            </p>
            <h1 className="text-3xl font-extrabold">Company Profile</h1>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Add your company information so students can learn more about your organization.
        </p>

        {message && (
          <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form
          onSubmit={submit}
          className="mt-7 space-y-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
        >
          <section>
            <h2 className="mb-4 text-lg font-bold">Company information</h2>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Company name *
                <input
                  required
                  maxLength={100}
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  className={inputClass}
                  placeholder="Enter company name"
                />
              </label>

              <label className="block text-sm font-semibold">
                Industry *
                <select
                  required
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select industry</option>
                  <option>Information Technology</option>
                  <option>Education</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Marketing</option>
                  <option>Manufacturing</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block text-sm font-semibold">
                Company website
                <span className="font-normal text-gray-400"> (optional)</span>
                <span className="relative block">
                  <Globe className="absolute left-3 top-4 text-gray-400" size={17} />
                  <input
                    type="url"
                    maxLength={200}
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="https://www.example.com"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold">
                Company location *
                <span className="relative block">
                  <MapPin className="absolute left-3 top-4 text-gray-400" size={17} />
                  <input
                    required
                    maxLength={150}
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="City, State"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold">
                Company description *
                <textarea
                  required
                  maxLength={1000}
                  rows={5}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={inputClass}
                  placeholder="Tell students about your company..."
                />
                <span className="text-xs font-normal text-gray-400">
                  {form.description.length}/1000 characters
                </span>
              </label>
            </div>
          </section>

          <hr className="border-violet-100" />

          <section>
            <h2 className="mb-4 text-lg font-bold">Contact information</h2>

            <div className="space-y-4">
              <label className="block text-sm font-semibold">
                Contact person *
                <input
                  required
                  maxLength={100}
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                />
              </label>

              <label className="block text-sm font-semibold">
                Contact email *
                <span className="relative block">
                  <Mail className="absolute left-3 top-4 text-gray-400" size={17} />
                  <input
                    required
                    type="email"
                    maxLength={254}
                    value={form.contactEmail}
                    onChange={(e) => update("contactEmail", e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="contact@company.com"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold">
                Contact phone *
                <span className="relative block">
                  <Phone className="absolute left-3 top-4 text-gray-400" size={17} />
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.contactPhone}
                    onChange={(e) =>
                      update("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className={`${inputClass} pl-10`}
                    placeholder="10-digit phone number"
                  />
                </span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700"
          >
            <Save size={18} />
            Save company profile
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          Demo version: company details are saved in this browser. Backend integration is still required for shared company profiles.
        </p>
      </div>
    </main>
  );
}
