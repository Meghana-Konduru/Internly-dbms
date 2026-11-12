
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

const emptyForm = {
  skill: "",
  level: "Intermediate",
};

const emptyCert = {
  name: "",
  issuer: "",
  date: "",
};

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skillForm, setSkillForm] = useState(emptyForm);
  const [certForm, setCertForm] = useState(emptyCert);
  const [message, setMessage] = useState("");
  const [latestAllowedDate, setLatestAllowedDate] = useState("");

  useEffect(() => {
    // Calculate the date after hydration.
    // This avoids the unstable new Date() prerender warning.
    setLatestAllowedDate(new Date().toISOString().slice(0, 10));

    try {
      const savedSkills = JSON.parse(
        localStorage.getItem("internly_skills") || "[]"
      );

      const savedCertifications = JSON.parse(
        localStorage.getItem("internly_certifications") || "[]"
      );

      const profile = JSON.parse(
        localStorage.getItem("internly_profile") || "{}"
      );

      const legacySkills =
        typeof profile.skills === "string"
          ? profile.skills
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
          : [];

      setSkills(
        Array.isArray(savedSkills) && savedSkills.length
          ? savedSkills
          : legacySkills.map((name) => ({
              name,
              level: "Intermediate",
            }))
      );

      setCertifications(
        Array.isArray(savedCertifications)
          ? savedCertifications
          : []
      );
    } catch {
      // Start with empty forms if saved data is invalid.
    }
  }, []);

  function persist(nextSkills, nextCerts) {
    localStorage.setItem(
      "internly_skills",
      JSON.stringify(nextSkills)
    );

    localStorage.setItem(
      "internly_certifications",
      JSON.stringify(nextCerts)
    );
  }

  function addSkill(e) {
    e.preventDefault();

    const name = skillForm.skill.trim();

    if (!name) {
      return setMessage("Enter a skill name.");
    }

    if (name.length > 40) {
      return setMessage(
        "Skill name must be 40 characters or fewer."
      );
    }

    if (
      skills.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      return setMessage(
        "This skill is already in your profile."
      );
    }

    const updated = [
      ...skills,
      {
        name,
        level: skillForm.level,
      },
    ];

    setSkills(updated);
    persist(updated, certifications);
    setSkillForm(emptyForm);
    setMessage("Skill saved.");
  }

  function addCertification(e) {
    e.preventDefault();

    const name = certForm.name.trim();
    const issuer = certForm.issuer.trim();

    if (!name || !issuer || !certForm.date) {
      return setMessage(
        "Complete all certification fields."
      );
    }

    if (name.length > 100 || issuer.length > 100) {
      return setMessage(
        "Name and issuer must be 100 characters or fewer."
      );
    }

    const updated = [
      ...certifications,
      {
        id: `${Date.now()}`,
        name,
        issuer,
        date: certForm.date,
      },
    ];

    setCertifications(updated);
    persist(skills, updated);
    setCertForm(emptyCert);
    setMessage("Certification saved.");
  }

  function removeSkill(index) {
    const updated = skills.filter((_, i) => i !== index);

    setSkills(updated);
    persist(updated, certifications);
  }

  function removeCertification(index) {
    const updated = certifications.filter(
      (_, i) => i !== index
    );

    setCertifications(updated);
    persist(skills, updated);
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to profile
        </Link>

        <div className="mt-5 flex items-center gap-3">
          <div className="rounded-xl bg-violet-600 p-3 text-white">
            <UserRound size={24} />
          </div>

          <div>
            <p className="text-sm font-semibold text-violet-600">
              STUDENT PROFILE
            </p>

            <h1 className="text-3xl font-extrabold">
              Skills & Certifications
            </h1>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Keep your skills and credentials updated to get
          more relevant internship matches.
        </p>

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-700"
          >
            {message}
          </p>
        )}

        <div className="mt-7 grid gap-6 md:grid-cols-2">

          {/* Skills Section */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Add a skill
            </h2>

            <form
              onSubmit={addSkill}
              className="mt-4 space-y-3"
            >
              <label className="block text-sm font-semibold">
                Skill name

                <input
                  value={skillForm.skill}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      skill: e.target.value,
                    })
                  }
                  maxLength={40}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-violet-500"
                  placeholder="e.g. Python"
                />
              </label>

              <label className="block text-sm font-semibold">
                Proficiency

                <select
                  value={skillForm.level}
                  onChange={(e) =>
                    setSkillForm({
                      ...skillForm,
                      level: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700">
                <Plus size={17} />
                Add skill
              </button>
            </form>

            <div className="mt-6 space-y-2">
              {skills.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className="flex items-center justify-between rounded-xl bg-violet-50 px-3 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {s.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {s.level || "Intermediate"}
                    </p>
                  </div>

                  <button
                    onClick={() => removeSkill(i)}
                    aria-label={`Remove ${s.name}`}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!skills.length && (
                <p className="text-sm text-gray-400">
                  No skills added yet.
                </p>
              )}
            </div>
          </section>

          {/* Certifications Section */}
          <section className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Add a certification
            </h2>

            <form
              onSubmit={addCertification}
              className="mt-4 space-y-3"
            >
              <label className="block text-sm font-semibold">
                Certification name

                <input
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm({
                      ...certForm,
                      name: e.target.value,
                    })
                  }
                  maxLength={100}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-violet-500"
                  placeholder="e.g. AWS Cloud Practitioner"
                />
              </label>

              <label className="block text-sm font-semibold">
                Issuing organization

                <input
                  value={certForm.issuer}
                  onChange={(e) =>
                    setCertForm({
                      ...certForm,
                      issuer: e.target.value,
                    })
                  }
                  maxLength={100}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-violet-500"
                  placeholder="e.g. Amazon Web Services"
                />
              </label>

              <label className="block text-sm font-semibold">
                Issue date

                <input
                  type="date"
                  value={certForm.date}
                  max={latestAllowedDate || undefined}
                  onChange={(e) =>
                    setCertForm({
                      ...certForm,
                      date: e.target.value,
                    })
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal"
                />
              </label>

              <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700">
                <Plus size={17} />
                Add certification
              </button>
            </form>

            <div className="mt-6 space-y-2">
              {certifications.map((c, i) => (
                <div
                  key={c.id || `${c.name}-${i}`}
                  className="flex items-start justify-between rounded-xl bg-violet-50 px-3 py-3"
                >
                  <div className="flex gap-2">
                    <Award
                      className="mt-1 text-violet-600"
                      size={18}
                    />

                    <div>
                      <p className="font-semibold">
                        {c.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {c.issuer} · {c.date}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeCertification(i)}
                    aria-label={`Remove ${c.name}`}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              {!certifications.length && (
                <p className="text-sm text-gray-400">
                  No certifications added yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <p className="mt-5 text-xs text-gray-400">
          Demo note: this page currently saves to this
          browser&apos;s local storage. Backend/database
          persistence will be connected separately.
        </p>

      </div>
    </main>
  );
}
