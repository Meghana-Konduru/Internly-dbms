
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookmarkCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RecruiterShortlistPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadShortlistedCandidates() {
    try {
      setLoading(true);
      setError("");

      const jobsData = await apiRequest("/api/recruiters/me/jobs");
      const shortlisted = [];

      for (const job of jobsData.jobs || []) {
        const result = await apiRequest(
          `/api/recruiters/me/jobs/${job.job_id}/applicants`
        );

        for (const applicant of result.applicants || []) {
          if (applicant.application_status === "shortlisted") {
            shortlisted.push({
              ...applicant,
              job_id: job.job_id,
              job_title: job.title,
            });
          }
        }
      }

      setCandidates(shortlisted);
    } catch (err) {
      setError(err.message || "Could not load shortlisted candidates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShortlistedCandidates();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-violet-700"
        >
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <div className="mt-7 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <BookmarkCheck size={26} />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold">
              Shortlisted Candidates
            </h1>
            <p className="mt-1 text-gray-500">
              Candidates shortlisted for your internships.
            </p>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total shortlisted candidates
          </p>
          <p className="mt-1 text-3xl font-extrabold">
            {candidates.length}
          </p>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-violet-700">
            Loading shortlisted candidates...
          </p>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadShortlistedCandidates}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : candidates.length > 0 ? (
          <div className="mt-6 space-y-5">
            {candidates.map((candidate) => (
              <article
                key={candidate.application_id}
                className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold">
                  {candidate.student_name}
                </h2>

                <p className="mt-1 text-violet-700">
                  {candidate.email}
                </p>

                <p className="mt-3 text-sm text-gray-600">
                  Internship: {candidate.job_title}
                </p>

                <p className="text-sm text-gray-600">
                  Department: {candidate.department || "Not specified"}
                </p>

                <p className="text-sm text-gray-600">
                  Graduation year: {candidate.graduation_year || "Not specified"}
                </p>

                <p className="mt-3 text-sm font-semibold text-green-700">
                  Status: Shortlisted
                </p>

                {candidate.resume_url && (
                  <p className="mt-2 text-sm text-gray-600">
                    Resume: Available in student profile
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-12 text-center">
            <BookmarkCheck
              size={38}
              className="mx-auto text-violet-400"
            />
            <h2 className="mt-4 text-lg font-bold">
              No shortlisted candidates yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Shortlist applicants from the Applicants page to see them here.
            </p>

            <Link
              href="/recruiter/applicants"
              className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
            >
              View Applicants
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
