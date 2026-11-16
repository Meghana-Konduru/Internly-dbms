
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  Users,
  LogOut,
  Building2,
  Bookmark,
  Pencil,
  Pause,
  Play,
  XCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updatingJob, setUpdatingJob] = useState(null);
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    const [dashboardData, companyData, jobsData] =
      await Promise.all([
        apiRequest("/api/recruiters/me/dashboard"),
        apiRequest("/api/recruiters/me/company"),
        apiRequest("/api/recruiters/me/jobs"),
      ]);

    setDashboard(dashboardData);
    setCompany(companyData.company);
    setJobs(jobsData.jobs || []);
  }

  useEffect(() => {
    async function initialize() {
      try {
        const token = sessionStorage.getItem(
          "internly_access_token"
        );

        if (!token) {
          window.location.href = "/recruiter/login";
          return;
        }

        await loadDashboard();
      } catch (err) {
        setError(err.message || "Unable to load dashboard.");

        if (
          err.message?.toLowerCase().includes("token") ||
          err.message?.toLowerCase().includes("credentials")
        ) {
          sessionStorage.removeItem("internly_access_token");
          sessionStorage.removeItem("internly_user");
          sessionStorage.removeItem("internly_role");
          window.location.href = "/recruiter/login";
        }
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  function logout() {
    sessionStorage.removeItem("internly_access_token");
    sessionStorage.removeItem("internly_user");
    sessionStorage.removeItem("internly_role");
    window.location.href = "/recruiter/login";
  }

  function startEditing(job) {
    setMessage("");
    setEditingJob({
      job_id: job.job_id,
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      deadline: job.deadline
        ? String(job.deadline).slice(0, 10)
        : "",
    });
  }

  async function saveJob(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      await apiRequest(
        `/api/recruiters/me/jobs/${editingJob.job_id}`,
        {
          method: "PATCH",
          body: {
            title: editingJob.title.trim(),
            description: editingJob.description,
            location: editingJob.location,
            deadline: editingJob.deadline,
          },
        }
      );

      setEditingJob(null);
      setMessage("Internship updated successfully.");
      await loadDashboard();
    } catch (err) {
      setMessage(err.message || "Could not update internship.");
    } finally {
      setSaving(false);
    }
  }

  async function changeJobStatus(job, status) {
    const action = {
      open: "reopen",
      paused: "pause",
      closed: "close",
    }[status];

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${job.title}"?`
      )
    ) {
      return;
    }

    try {
      setUpdatingJob(job.job_id);
      setMessage("");

      await apiRequest(
        `/api/recruiters/me/jobs/${job.job_id}/status`,
        {
          method: "PATCH",
          body: { status },
        }
      );

      setMessage(`Internship ${action}d successfully.`);
      await loadDashboard();
    } catch (err) {
      setMessage(err.message || "Could not update internship status.");
    } finally {
      setUpdatingJob(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc]">
        <p className="font-semibold text-violet-700">
          Loading recruiter dashboard...
        </p>
      </main>
    );
  }

  if (error && !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc] p-5">
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="font-semibold text-red-600">{error}</p>
          <button
            onClick={logout}
            className="mt-4 rounded-xl bg-violet-600 px-5 py-2 text-white"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  const jobStats = dashboard?.jobs || {};
  const applicationStats = dashboard?.applications || {};

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-violet-600">
              INTERNLY RECRUITER PORTAL
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Welcome, {company?.recruiter_name || "Recruiter"}.
              Manage your internship opportunities.
            </p>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-violet-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </header>

        <section className="mt-7 rounded-2xl border border-violet-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <Building2 className="text-violet-600" size={28} />
            <div>
              <h2 className="font-bold">
                {company?.company_name}
              </h2>
              <p className="text-sm text-gray-500">
                {company?.industry || "Industry not specified"}
                {company?.location ? ` · ${company.location}` : ""}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<BriefcaseBusiness />}
            label="Internships posted"
            value={jobStats.total_jobs ?? 0}
          />
          <Stat
            icon={<Users />}
            label="Applications"
            value={applicationStats.total_applications ?? 0}
          />
          <Stat
            icon={<FileText />}
            label="Open positions"
            value={jobStats.open_jobs ?? 0}
          />
        </div>

        <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="text-xl font-bold">
            Application overview
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MiniStat label="Pending" value={applicationStats.pending_applications} />
            <MiniStat label="Shortlisted" value={applicationStats.shortlisted_applications} />
            <MiniStat label="Accepted" value={applicationStats.accepted_applications} />
            <MiniStat label="Rejected" value={applicationStats.rejected_applications} />
            <MiniStat label="Withdrawn" value={applicationStats.withdrawn_applications} />
          </div>
        </section>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/recruiter/shortlist"
            className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:bg-violet-50"
          >
            <Bookmark size={28} className="text-violet-600" />
            <div>
              <h2 className="text-xl font-bold">
                Shortlisted Candidates
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review candidates shortlisted for your internships.
              </p>
            </div>
          </Link>

          <Link
            href="/recruiter/applicants"
            className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:bg-violet-50"
          >
            <Users size={28} className="text-violet-600" />
            <div>
              <h2 className="text-xl font-bold">
                Applicants
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage internship applications.
              </p>
            </div>
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-violet-100 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Your internships
            </h2>

            <Link
              href="/recruiter/jobs/new"
              className="text-sm font-bold text-violet-700"
            >
              + Add new
            </Link>
          </div>

          {message && (
            <p className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-800">
              {message}
            </p>
          )}

          {jobs.length ? (
            jobs.map((job) => (
              <div
                key={job.job_id}
                className="mt-4 rounded-xl bg-violet-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{job.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {job.location || "Location not specified"} · {job.status}
                    </p>
                    <p className="mt-1 text-sm text-violet-700">
                      {job.applicant_count} applicants
                    </p>
                    {job.deadline && (
                      <p className="mt-1 text-xs text-gray-500">
                        Deadline: {String(job.deadline).slice(0, 10)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEditing(job)}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-700"
                    >
                      <Pencil size={15} /> Edit
                    </button>

                    {job.status === "open" && (
                      <>
                        <button
                          disabled={updatingJob === job.job_id}
                          onClick={() => changeJobStatus(job, "paused")}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 disabled:opacity-50"
                        >
                          <Pause size={15} /> Pause
                        </button>

                        <button
                          disabled={updatingJob === job.job_id}
                          onClick={() => changeJobStatus(job, "closed")}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                        >
                          <XCircle size={15} /> Close
                        </button>
                      </>
                    )}

                    {job.status === "paused" && (
                      <>
                        <button
                          disabled={updatingJob === job.job_id}
                          onClick={() => changeJobStatus(job, "open")}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 disabled:opacity-50"
                        >
                          <Play size={15} /> Reopen
                        </button>
                        <button
                          disabled={updatingJob === job.job_id}
                          onClick={() => changeJobStatus(job, "closed")}
                          className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                        >
                          Close
                        </button>
                      </>
                    )}

                    {job.status === "closed" && (
                      <button
                        disabled={updatingJob === job.job_id}
                        onClick={() => changeJobStatus(job, "open")}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 disabled:opacity-50"
                      >
                        <Play size={15} /> Reopen
                      </button>
                    )}
                  </div>
                </div>

                {editingJob?.job_id === job.job_id && (
                  <form
                    onSubmit={saveJob}
                    className="mt-5 space-y-3 rounded-xl border border-violet-200 bg-white p-4"
                  >
                    <h3 className="font-bold">Edit internship</h3>

                    <label className="block text-sm font-semibold">
                      Internship title
                      <input
                        required
                        minLength={2}
                        value={editingJob.title}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border p-2 font-normal"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      Description
                      <textarea
                        rows={3}
                        value={editingJob.description}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border p-2 font-normal"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      Location
                      <input
                        value={editingJob.location}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            location: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border p-2 font-normal"
                      />
                    </label>

                    <label className="block text-sm font-semibold">
                      Application deadline
                      <input
                        type="date"
                        required
                        value={editingJob.deadline}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            deadline: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border p-2 font-normal"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingJob(null)}
                        className="rounded-lg border px-4 py-2 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No internships posted yet.
            </p>
          )}
        </section>

        <p className="mt-5 text-xs text-gray-400">
          Dashboard information is retrieved from PostgreSQL through the backend API.
        </p>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="text-violet-600">{icon}</div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-violet-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
}
