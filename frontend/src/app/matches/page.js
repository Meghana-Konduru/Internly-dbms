
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
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("internly_liked_jobs");
      if (stored) {
        setMatches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Could not load matches:", error);
    }
  }, []);

  function handleApply(job) {
    try {
      const existing = JSON.parse(
        localStorage.getItem("internly_applications") || "[]"
      );

      const alreadyApplied = existing.some(
        (app) => app.id === job.id
      );

      if (alreadyApplied) {
        alert("You have already applied to this internship!");
        return;
      }

      const newApplication = {
        ...job,
        status: "Applied",
        appliedOn: new Date().toLocaleDateString(),
      };

      const updatedApplications = [
        ...existing,
        newApplication,
      ];

      localStorage.setItem(
        "internly_applications",
        JSON.stringify(updatedApplications)
      );

      alert("Application added successfully!");
    } catch (error) {
      console.error("Application error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] text-[#211b35] md:flex">

      {/* Sidebar */}
      <aside className="border-r border-violet-100 bg-white p-6 md:min-h-screen md:w-64">

        <Link href="/" className="mb-10 flex items-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={23} />
          </div>
          <span className="text-2xl font-extrabold">
            internly.
          </span>
        </Link>

        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
          Main menu
        </p>

        <nav className="flex flex-wrap gap-2 md:flex-col">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            href="/discover"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            <Search size={19} />
            Discover
          </Link>

          <Link
            href="/matches"
            className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700"
          >
            <Heart size={19} />
            Matches
          </Link>

          <Link
            href="/applications"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            <FileText size={19} />
            Applications
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"
          >
            <User size={19} />
            My Profile
          </Link>

        </nav>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1 p-6 md:p-10">

        <p className="text-sm font-semibold text-violet-600">
          YOUR FAVORITES
        </p>

        <h1 className="mt-2 text-3xl font-extrabold">
          Your Matches{" "}
          <Heart
            className="inline text-violet-600"
            size={28}
          />
        </h1>

        <p className="mt-2 text-gray-500">
          All the internship opportunities you've liked.
        </p>

        {/* Collection Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-600 p-6 text-white">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-violet-100">
                YOUR COLLECTION
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                {matches.length} Matches
              </h2>

              <p className="mt-2 text-sm text-violet-100">
                Keep exploring opportunities that fit your goals.
              </p>
            </div>

            <Heart size={48} />

          </div>
        </div>

        {/* Liked Opportunities */}
        <div className="mt-9">

          <h2 className="text-xl font-bold">
            Liked opportunities
          </h2>

          {matches.length === 0 ? (

            <div className="mt-5 rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center">

              <Heart
                size={42}
                className="mx-auto text-violet-400"
              />

              <h3 className="mt-5 text-xl font-bold">
                No matches yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Like internships in Discover and they will appear here.
              </p>

              <Link
                href="/discover"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700"
              >
                Discover internships
                <ArrowRight size={17} />
              </Link>

            </div>

          ) : (

            <div className="mt-5 grid gap-5 lg:grid-cols-2">

              {matches.map((job) => (

                <div
                  key={job.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Company Logo and Status */}
                  <div className="flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-xl font-extrabold text-violet-700">
                      {job.logo}
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                      Liked
                    </span>

                  </div>

                  {/* Internship Details */}
                  <p className="mt-5 text-sm font-semibold text-violet-600">
                    {job.company}
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {job.role}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {job.description}
                  </p>

                  {/* Location and Duration */}
                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">

                    <span>
                      <MapPin
                        className="mr-1 inline"
                        size={14}
                      />
                      {job.location}
                    </span>

                    <span>
                      <Clock
                        className="mr-1 inline"
                        size={14}
                      />
                      {job.duration}
                    </span>

                  </div>

                  {/* Stipend and Apply Button */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">

                    <span className="font-bold text-green-600">
                      {job.stipend}
                    </span>

                    <button
                      onClick={() => handleApply(job)}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      Apply Now
                      <ArrowRight size={17} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Bottom Message */}
        <div className="mt-8 rounded-2xl bg-violet-50 p-5 text-sm text-violet-800">

          <Sparkles
            className="mr-2 inline"
            size={18}
          />

          Keep discovering. Your next career opportunity could be waiting!

        </div>

      </section>
    </main>
  );
}
