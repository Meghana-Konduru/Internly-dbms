
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { ArrowLeft, Bookmark, MapPin, Trash2 } from "lucide-react";

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadShortlist() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/api/students/me/shortlist");

      console.log("SHORTLIST API RESPONSE:", response);

      setShortlist(response.shortlist || []);
    } catch (err) {
      setError(err.message || "Could not load your shortlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShortlist();
  }, []);

  async function removeInternship(jobId) {
    try {
      await apiRequest(`/api/students/me/shortlist/${jobId}`, {
        method: "DELETE",
      });

      setShortlist((previous) =>
        previous.filter((item) => item.job_id !== jobId)
      );
    } catch (err) {
      setError(err.message || "Could not remove internship.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/discover"
          className="inline-flex items-center gap-2 font-semibold text-violet-700"
        >
          <ArrowLeft size={18} />
          Back to Discover
        </Link>

        <h1 className="mt-7 text-3xl font-extrabold">My Shortlist</h1>

        <p className="mt-2 text-gray-500">
          Internships you saved to consider later.
        </p>

        <div className="mt-7 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total shortlisted internships
          </p>
          <p className="mt-1 text-3xl font-extrabold">
            {shortlist.length}
          </p>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-violet-700">
            Loading your shortlist...
          </p>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadShortlist}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : shortlist.length > 0 ? (
          <div className="mt-6 space-y-5">
            {shortlist.map((item) => (
              <article
                key={item.shortlist_id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="text-lg font-bold">
                    {item.job_title}
                  </h2>

                  <p className="mt-1 text-violet-600">
                    {item.company_name}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    <MapPin size={16} className="mr-1 inline" />
                    {item.location || "Location not specified"}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {item.description || "No description available."}
                  </p>
                </div>

                <button
                  onClick={() => removeInternship(item.job_id)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={17} />
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-12 text-center">
            <Bookmark size={38} className="mx-auto text-violet-400" />
            <h2 className="mt-4 text-lg font-bold">
              Your shortlist is empty.
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Visit Discover and shortlist internships to see them here.
            </p>
            <Link
              href="/discover"
              className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
            >
              Explore internships
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
