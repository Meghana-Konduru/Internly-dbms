
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ApplicantsPage() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  async function loadApplicants() {
    try {
      setLoading(true);
      setError("");

      const jobsData = await apiRequest("/api/recruiters/me/jobs");
      const allApplicants = [];

      for (const job of jobsData.jobs || []) {
        const result = await apiRequest(
          `/api/recruiters/me/jobs/${job.job_id}/applicants`
        );

        for (const applicant of result.applicants || []) {
          allApplicants.push({
            ...applicant,
            job_id: job.job_id,
            job_title: job.title,
          });
        }
      }

      setJobs(jobsData.jobs || []);
      setApplicants(allApplicants);
    } catch (err) {
      setError(err.message || "Could not load applicants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplicants();
  }, []);

  async function updateStatus(applicationId, status) {
    try {
      setUpdating(applicationId);

      await apiRequest(
        `/api/recruiters/me/applications/${applicationId}/status`,
        {
          method: "PATCH",
          body: { status },
        }
      );

      await loadApplicants();
    } catch (err) {
      setError(err.message || "Could not update applicant status.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-violet-700"
        >
          <ArrowLeft size={18} /> Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <Users className="text-violet-600" size={30} />
          <div>
            <h1 className="text-3xl font-extrabold">Applicants</h1>
            <p className="text-sm text-gray-500">
              Applications received for your internships
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-5">
          <p className="text-sm text-gray-500">Your internships</p>
          <p className="text-3xl font-extrabold">{jobs.length}</p>
          <p className="mt-1 text-sm text-gray-500">
            Total applicants: {applicants.length}
          </p>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-violet-700">
            Loading applicants...
          </p>
        ) : error ? (
          <div className="mt-6 rounded-xl bg-white p-5 text-red-600">
            {error}
            <button onClick={loadApplicants} className="ml-3 underline">
              Retry
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="mt-6 rounded-xl bg-white p-10 text-center text-gray-500">
            No applicants have applied to your internships yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applicants.map((app) => (
              <article
                key={app.application_id}
                className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-bold">{app.student_name}</h2>
                <p className="text-sm text-violet-700">{app.email}</p>

                <p className="mt-2 text-sm text-gray-600">
                  Internship: {app.job_title}
                </p>
                <p className="text-sm text-gray-600">
                  Department: {app.department || "Not specified"}
                </p>
                <p className="text-sm text-gray-600">
                  Graduation year: {app.graduation_year || "Not specified"}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Application status: {app.application_status}
                </p>

                {app.resume_url && (
                  <p className="mt-2 text-sm">
                    Resume: Available in student profile
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    disabled={updating === app.application_id}
                    onClick={() => updateStatus(app.application_id, "shortlisted")}
                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Shortlist
                  </button>

                  <button
                    disabled={updating === app.application_id}
                    onClick={() => updateStatus(app.application_id, "accepted")}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Accept
                  </button>

                  <button
                    disabled={updating === app.application_id}
                    onClick={() => updateStatus(app.application_id, "rejected")}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
