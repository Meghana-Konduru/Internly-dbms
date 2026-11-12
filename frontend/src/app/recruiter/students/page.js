
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, Users, GraduationCap,
  MapPin, BriefcaseBusiness, SlidersHorizontal
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("internly_students") || "[]"
      );

      setStudents(Array.isArray(stored) ? stored : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const colleges = useMemo(
    () => [...new Set(students.map(s => s.profile?.college).filter(Boolean))],
    [students]
  );

  const filteredStudents = students.filter(student => {
    const p = student.profile || {};
    const skills = [
      ...(Array.isArray(student.skills) ? student.skills.map(s => s.name) : []),
      ...(typeof p.skills === "string" ? p.skills.split(",") : [])
    ].join(" ").toLowerCase();

    const matchesSearch =
      `${p.name || ""} ${p.college || ""} ${p.degree || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesSkill =
      !skillFilter || skills.includes(skillFilter.toLowerCase());

    const matchesCollege =
      !collegeFilter || p.college === collegeFilter;

    return matchesSearch && matchesSkill && matchesCollege;
  });

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} /> Dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Users size={25} />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-600">RECRUITER PORTAL</p>
            <h1 className="text-3xl font-extrabold">Explore Students</h1>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Discover students and review their qualifications.
        </p>

        <section className="mt-7 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-semibold md:col-span-1">
              Search students
              <span className="relative block">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  maxLength={100}
                  placeholder="Name, college or degree"
                  className="mt-1 w-full rounded-xl border p-3 pl-10 font-normal outline-none focus:border-violet-500"
                />
              </span>
            </label>

            <label className="block text-sm font-semibold">
              Filter by college
              <select
                value={collegeFilter}
                onChange={e => setCollegeFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white p-3 font-normal"
              >
                <option value="">All colleges</option>
                {colleges.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>

            <label className="block text-sm font-semibold">
              Filter by skill
              <span className="relative block">
                <SlidersHorizontal className="absolute left-3 top-3.5 text-gray-400" size={17} />
                <input
                  value={skillFilter}
                  onChange={e => setSkillFilter(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Python"
                  className="mt-1 w-full rounded-xl border p-3 pl-10 font-normal"
                />
              </span>
            </label>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-xl font-bold">Student profiles</h2>
          <span className="text-sm text-gray-500">
            {filteredStudents.length} students
          </span>
        </div>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading students...</p>
        ) : filteredStudents.length ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map(student => {
              const p = student.profile || {};
              const skills = [
                ...(Array.isArray(student.skills) ? student.skills : []),
                ...(typeof p.skills === "string"
                  ? p.skills.split(",").filter(Boolean).map(name => ({ name: name.trim() }))
                  : [])
              ];

              return (
                <article
                  key={student.id}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-extrabold text-violet-700">
                      {(p.name || "S").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">{p.name || "Student"}</h3>
                      <p className="truncate text-xs text-gray-500">{p.email}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <GraduationCap size={17} className="text-violet-600" />
                      {p.degree || "Degree not specified"}
                    </p>
                    <p className="flex items-center gap-2">
                      <BriefcaseBusiness size={17} className="text-violet-600" />
                      {p.college || "College not specified"}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={17} className="text-violet-600" />
                      {p.location || "Location not specified"}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.slice(0, 4).map((s, i) => (
                      <span key={`${s.name}-${i}`} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                        {s.name}
                      </span>
                    ))}
                    {!skills.length && (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                  </div>

                  <Link
                    href={`/recruiter/students/${encodeURIComponent(student.id)}`}
                    className="mt-5 block rounded-xl bg-violet-600 py-3 text-center text-sm font-bold text-white hover:bg-violet-700"
                  >
                    View student profile
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-12 text-center">
            <Users size={35} className="mx-auto text-violet-400" />
            <h3 className="mt-4 font-bold">No student profiles found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Student records will appear here when they are available through the backend.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Demo directory: reads student records from local storage. Shared student accounts require backend integration.
        </p>
      </div>
    </main>
  );
}
