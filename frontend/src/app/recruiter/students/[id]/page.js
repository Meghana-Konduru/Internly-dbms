
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, UserRound, GraduationCap, Mail,
  Phone, MapPin, Award, FileText, Bookmark
} from "lucide-react";

export default function StudentDetailsPage() {
  const params = useParams();
  const [student, setStudent] = useState(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const students = JSON.parse(
        localStorage.getItem("internly_students") || "[]"
      );

      const found = students.find(
        s => String(s.id) === String(params.id)
      );

      setStudent(found || null);

      const shortlist = JSON.parse(
        localStorage.getItem("internly_candidate_shortlist") || "[]"
      );

      setShortlisted(
        shortlist.some(s => String(s.id) === String(params.id))
      );
    } catch {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  function toggleShortlist() {
    if (!student) return;

    const current = JSON.parse(
      localStorage.getItem("internly_candidate_shortlist") || "[]"
    );

    const exists = current.some(
      s => String(s.id) === String(student.id)
    );

    const updated = exists
      ? current.filter(s => String(s.id) !== String(student.id))
      : [...current, {
          id: student.id,
          name: student.profile?.name || "Student",
          shortlistedAt: new Date().toISOString()
        }];

    localStorage.setItem(
      "internly_candidate_shortlist",
      JSON.stringify(updated)
    );

    setShortlisted(!exists);
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f8f7fc] p-10 text-[#211b35]">Loading profile...</main>;
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-[#f8f7fc] p-10 text-[#211b35]">
        <Link href="/recruiter/students" className="text-violet-700">← Back to students</Link>
        <h1 className="mt-8 text-2xl font-bold">Student profile not found</h1>
        <p className="mt-2 text-gray-500">This student record is not available in this browser.</p>
      </main>
    );
  }

  const p = student.profile || {};
  const skills = [
    ...(Array.isArray(student.skills) ? student.skills : []),
    ...(typeof p.skills === "string"
      ? p.skills.split(",").filter(Boolean).map(name => ({ name: name.trim(), level: "Not specified" }))
      : [])
  ];
  const certifications = Array.isArray(student.certifications)
    ? student.certifications
    : [];

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/recruiter/students" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
          <ArrowLeft size={17} /> Back to students
        </Link>

        <section className="mt-6 rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-extrabold text-violet-700">
                {(p.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-violet-100">STUDENT PROFILE</p>
                <h1 className="mt-1 text-2xl font-extrabold">{p.name || "Student"}</h1>
                <p className="mt-1 text-violet-100">{p.degree || "Degree not specified"}</p>
              </div>
            </div>

            <button
              onClick={toggleShortlist}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
                shortlisted ? "bg-white text-violet-700" : "bg-violet-950/30 text-white hover:bg-violet-950/50"
              }`}
            >
              <Bookmark size={18} />
              {shortlisted ? "Remove from shortlist" : "Shortlist candidate"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="text-lg font-bold">Personal information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 text-sm">
            <Info icon={<Mail />} label="Email" value={p.email} />
            <Info icon={<Phone />} label="Phone" value={p.phone} />
            <Info icon={<GraduationCap />} label="College" value={p.college} />
            <Info icon={<GraduationCap />} label="Graduation" value={p.graduationYear} />
            <Info icon={<MapPin />} label="Location" value={p.location} />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="text-lg font-bold">About</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
            {p.about || "No introduction provided."}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="text-lg font-bold">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {skills.map((s, i) => (
              <span key={`${s.name}-${i}`} className="rounded-xl bg-violet-50 px-4 py-3 text-sm">
                <strong className="text-violet-800">{s.name}</strong>
                <span className="ml-2 text-gray-500">{s.level || "Not specified"}</span>
              </span>
            ))}
            {!skills.length && <p className="text-sm text-gray-400">No skills added.</p>}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Award className="text-violet-600" /> Certifications
          </h2>
          <div className="mt-4 space-y-3">
            {certifications.map((c, i) => (
              <div key={c.id || i} className="rounded-xl bg-violet-50 p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="mt-1 text-sm text-gray-500">{c.issuer} · {c.date}</p>
              </div>
            ))}
            {!certifications.length && <p className="text-sm text-gray-400">No certifications added.</p>}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FileText className="text-violet-600" /> Resume
          </h2>
          <p className="mt-3 text-sm text-gray-600">
            {student.resumeName || "Resume filename is not available."}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Actual resume viewing/downloading requires secure backend file storage.
          </p>
        </section>
      </div>
    </main>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-violet-600">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-1 font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );
}
