
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Trash2,
  Users,
  UserRound,
  GraduationCap,
} from "lucide-react";

export default function RecruiterShortlistPage() {
  const [candidates, setCandidates] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    try {
      const savedCandidates = JSON.parse(
        localStorage.getItem("internly_candidate_shortlist") || "[]"
      );
      const savedStudents = JSON.parse(
        localStorage.getItem("internly_students") || "[]"
      );

      setCandidates(Array.isArray(savedCandidates) ? savedCandidates : []);
      setStudents(Array.isArray(savedStudents) ? savedStudents : []);
    } catch {
      setCandidates([]);
      setStudents([]);
    }
  }, []);

  function removeCandidate(id) {
    const updated = candidates.filter(
      (candidate) => String(candidate.id) !== String(id)
    );

    localStorage.setItem(
      "internly_candidate_shortlist",
      JSON.stringify(updated)
    );

    setCandidates(updated);
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Bookmark size={25} />
          </div>

          <div>
            <p className="text-sm font-bold text-violet-600">
              RECRUITER PORTAL
            </p>
            <h1 className="text-3xl font-extrabold">
              Shortlisted Candidates
            </h1>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Manage students you have shortlisted for potential internship opportunities.
        </p>

        <div className="mt-7 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total shortlisted candidates</p>
          <p className="mt-1 text-3xl font-extrabold">{candidates.length}</p>
        </div>

        {candidates.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => {
              const student = students.find(
                (s) => String(s.id) === String(candidate.id)
              );

              const profile = student?.profile || {};

              return (
                <article
                  key={candidate.id}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <UserRound size={23} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate font-bold">
                        {profile.name || candidate.name || "Student"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Shortlisted candidate
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <GraduationCap size={17} className="text-violet-600" />
                      {profile.degree || "Degree not available"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {profile.college || "College not available"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Added: {candidate.shortlistedAt
                        ? new Date(candidate.shortlistedAt).toLocaleDateString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/recruiter/students/${encodeURIComponent(candidate.id)}`}
                      className="flex-1 rounded-xl bg-violet-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-violet-700"
                    >
                      View profile
                    </Link>

                    <button
                      onClick={() => removeCandidate(candidate.id)}
                      aria-label={`Remove ${candidate.name} from shortlist`}
                      className="rounded-xl border border-red-200 px-3 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-12 text-center">
            <Users size={38} className="mx-auto text-violet-400" />

            <h2 className="mt-4 text-lg font-bold">
              No shortlisted candidates yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Explore student profiles and use the Shortlist Candidate button to add candidates here.
            </p>

            <Link
              href="/recruiter/students"
              className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
            >
              Explore students
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Demo version: shortlisted candidates are stored in this browser.
          Shared recruiter shortlists require backend integration.
        </p>
      </div>
    </main>
  );
}
