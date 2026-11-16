"use client";

import { apiRequest } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  Search,
  Heart,
  FileText,
  User,
  MapPin,
  CalendarDays,
  Clock,
  ArrowRight,
  ClipboardList,
  Bookmark,
} from "lucide-react";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest(
          "/api/students/me/applications"
        );

        setApplications(
          (response.applications || []).map((app) => {
            const statusMap = {
              pending: "Applied",
              applied: "Applied",
              shortlisted: "Shortlisted",
              under_review: "Under Review",
              rejected: "Rejected",
              withdrawn: "Withdrawn",
            };

            const rawStatus = String(
              app.application_status || app.status || ""
            ).toLowerCase().trim();

            return {
              id: app.application_id,
              company: app.company_name,
              role: app.job_title,
              location: app.location || "Not specified",
              appliedAt: app.applied_at,
              status: statusMap[rawStatus] || "Unknown",
              duration: "Not specified",
              stipend: "",
              logo: (app.company_name || "I").charAt(0),
            };
          })
        );
      } catch (err) {
        setError(err.message || "Could not load your applications.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  async function withdrawApplication(applicationId) {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) return;

    try {
      setWithdrawingId(applicationId);

      await apiRequest(
        `/api/students/me/applications/${applicationId}/withdraw`,
        { method: "PATCH" }
      );

      setApplications((previous) =>
        previous.map((app) =>
          app.id === applicationId
            ? { ...app, status: "Withdrawn" }
            : app
        )
      );
    } catch (err) {
      setError(err.message || "Could not withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  }

  const statusStyles = {
    Applied: "bg-blue-50 text-blue-700",
    "Under Review": "bg-yellow-50 text-yellow-700",
    Shortlisted: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
    Withdrawn: "bg-gray-100 text-gray-600",
    Unknown: "bg-gray-100 text-gray-600",
  };

  const summaryCards = [
    {
      name: "Applied",
      count: applications.filter((app) => app.status === "Applied").length,
      color: "text-blue-600",
    },
    {
      name: "Under Review",
      count: applications.filter((app) => app.status === "Under Review").length,
      color: "text-yellow-600",
    },
    {
      name: "Shortlisted",
      count: applications.filter((app) => app.status === "Shortlisted").length,
      color: "text-green-600",
    },
    {
      name: "Rejected",
      count: applications.filter((app) => app.status === "Rejected").length,
      color: "text-red-600",
    },
    {
      name: "Withdrawn",
      count: applications.filter((app) => app.status === "Withdrawn").length,
      color: "text-gray-600",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7fc] text-[#211b35] md:flex">
      {/* Sidebar */}
      <aside className="border-r border-violet-100 bg-white p-6 md:min-h-screen md:w-64">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={23} />
          </div>
          <span className="text-2xl font-extrabold">internly.</span>
        </Link>

        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
          Main menu
        </p>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <LayoutDashboard size={19} /> Dashboard
          </Link>

          <Link href="/discover" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Search size={19} /> Discover
          </Link>

          <Link href="/matches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Heart size={19} /> Matches
          </Link>

          <Link href="/applications" className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700">
            <FileText size={19} /> Applications
          </Link>

          <Link href="/shortlist" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Bookmark size={19} /> Shortlist
          </Link>

          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <User size={19} /> My Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1 p-6 md:p-10">
        <p className="text-sm font-semibold text-violet-600">
          TRACK YOUR PROGRESS
        </p>

        <h1 className="mt-2 text-3xl font-extrabold">
          My Applications
        </h1>

        <p className="mt-2 text-gray-500">
          Keep track of all your internship applications in one place.
        </p>

        {/* Total Applications */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-100">
                TOTAL APPLICATIONS
              </p>
              <h2 className="mt-2 text-4xl font-extrabold">
                {applications.length}
              </h2>
              <p className="mt-2 text-sm text-violet-100">
                Your career journey, all in one place.
              </p>
            </div>

            <ClipboardList size={52} />
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {summaryCards.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.name}</p>
              <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>
                {item.count}
              </p>
            </div>
          ))}
        </div>

        {/* Application List */}
        <div className="mt-9">
          <h2 className="text-xl font-bold">
            Your applications
          </h2>

          {loading ? (
            <p className="mt-8 text-center text-violet-700">
              Loading your applications...
            </p>
          ) : error ? (
            <p className="mt-8 text-center text-red-600">{error}</p>
          ) : applications.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center">
              <FileText size={42} className="mx-auto text-violet-400" />

              <h3 className="mt-5 text-xl font-bold">
                No applications yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Visit your matches and apply to internships to see them here.
              </p>

              <Link
                href="/matches"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white"
              >
                View matches <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-xl font-extrabold text-violet-700">
                        {app.logo}
                      </div>

                      <div>
                        <p className="font-semibold text-violet-600">
                          {app.company}
                        </p>
                        <h3 className="mt-1 text-lg font-bold">
                          {app.role}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`rounded-full px-4 py-2 text-xs font-bold ${statusStyles[app.status] || statusStyles.Unknown}`}>
                        {app.status}
                      </span>

                      {(app.status === "Applied" || app.status === "Shortlisted") && (
                        <button
                          onClick={() => withdrawApplication(app.id)}
                          disabled={withdrawingId === app.id}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {withdrawingId === app.id
                            ? "Withdrawing..."
                            : "Withdraw"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-5 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span>
                      <MapPin size={15} className="mr-1 inline" />
                      {app.location}
                    </span>

                    <span>
                      <Clock size={15} className="mr-1 inline" />
                      {app.duration}
                    </span>

                    <span>
                      <CalendarDays size={15} className="mr-1 inline" />
                      Applied: {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </div>

                  {app.stipend && (
                    <p className="mt-4 font-bold text-green-600">
                      {app.stipend}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}