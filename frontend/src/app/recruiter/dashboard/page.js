
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  FileText,
  PlusCircle,
  Users,
  LogOut,
  Building2,
  UserRound,
  Bookmark,
} from "lucide-react";

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recruiter, setRecruiter] = useState(null);
  const [company, setCompany] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);

  useEffect(() => {
    try {
      setJobs(JSON.parse(localStorage.getItem("internly_jobs") || "[]"));
      setApplications(
        JSON.parse(localStorage.getItem("internly_applications") || "[]")
      );
      setRecruiter(
        JSON.parse(localStorage.getItem("internly_recruiter") || "null")
      );
      setCompany(
        JSON.parse(localStorage.getItem("internly_company_profile") || "null")
      );
      setShortlisted(
        JSON.parse(localStorage.getItem("internly_candidate_shortlist") || "[]")
  );
    } catch {
      setJobs([]);
      setApplications([]);
    }
  }, []);

  function logout() {
    localStorage.removeItem("internly_recruiter");
    window.location.href = "/recruiter/login";
  }

  const openJobs = jobs.filter((job) => job.status !== "Closed").length;

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
              Welcome{company?.companyName
                ? `, ${company.companyName}`
                : recruiter?.email
                  ? `, ${recruiter.email}`
                  : ""}.
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

        {!company?.companyName && (
          <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-amber-900">
              Complete your company profile
            </h2>
            <p className="mt-1 text-sm text-amber-800">
              Add your company details so students can learn about your organization.
            </p>
            <Link
              href="/recruiter/company-profile"
              className="mt-3 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700"
            >
              Create company profile
            </Link>
          </section>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<BriefcaseBusiness />}
            label="Internships posted"
            value={jobs.length}
          />

          <Stat
            icon={<Users />}
            label="Applications"
            value={applications.length}
          />

          <Stat
            icon={<FileText />}
            label="Open positions"
            value={openJobs}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/recruiter/shortlist"
            className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm hover:bg-violet-50"
      >
            <Bookmark size={28} className="text-violet-600" />
            <h2 className="mt-4 text-xl font-bold">
            Shortlisted Candidates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
            Manage your {shortlisted.length} shortlisted candidates.
            </p>
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

          {jobs.length ? (
            jobs.map((job) => (
              <div
                key={job.id}
                className="mt-4 rounded-xl bg-violet-50 p-4"
              >
                <p className="font-bold">{job.role}</p>
                <p className="text-sm text-gray-500">
                  {job.company} · {job.location} · {job.status || "Open"}
                </p>
              </div>
            ))
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No internships posted yet.
            </p>
          )}
        </section>

        <p className="mt-5 text-xs text-gray-400">
          Demo portal: records are stored in browser local storage.
          Real recruiter accounts and shared applicant data require backend APIs.
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
