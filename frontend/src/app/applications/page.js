
"use client";

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
} from "lucide-react";

export default function Applications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("internly_applications");

    if (stored) {
      setApplications(JSON.parse(stored));
    }
  }, []);

  const statusStyles = {
    Applied: "bg-blue-50 text-blue-700",
    "Under Review": "bg-yellow-50 text-yellow-700",
    Shortlisted: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

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

        {/* Summary */}
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

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { name: "Applied", color: "text-blue-600" },
            { name: "Under Review", color: "text-yellow-600" },
            { name: "Shortlisted", color: "text-green-600" },
            { name: "Rejected", color: "text-red-600" },
          ].map((item) => (
            <div key={item.name} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{item.name}</p>
              <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>
                {applications.filter((app) => app.status === item.name).length}
              </p>
            </div>
          ))}
        </div>

        {/* Application List */}
        <div className="mt-9">
          <h2 className="text-xl font-bold">
            Your applications
          </h2>

          {applications.length === 0 ? (
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

                    <span className={`rounded-full px-4 py-2 text-xs font-bold ${statusStyles[app.status] || "bg-gray-100 text-gray-600"}`}>
                      {app.status}
                    </span>
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
                      Applied: {app.appliedOn}
                    </span>
                  </div>

                  <p className="mt-4 font-bold text-green-600">
                    {app.stipend}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
