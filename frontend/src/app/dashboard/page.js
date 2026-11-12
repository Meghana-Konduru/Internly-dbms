
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  UserRound,
  Sparkles,
  Search,
  Heart,
  BriefcaseBusiness,
  FileText,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState({
    name: "Student",
    email: "",
  });

  useEffect(() => {
    const current = JSON.parse(
      localStorage.getItem("internly_current_student") || "null"
    );

    if (current) {
      setStudent({
        name: current.name || "Student",
        email: current.email || "",
      });
    }
  }, []);

  const features = [
    {
      title: "My Profile",
      description: "Build and update your professional profile.",
      href: "/profile",
      icon: UserRound,
    },
    {
      title: "My Skills",
      description: "Add your skills and certifications.",
      href: "/skills",
      icon: Sparkles,
    },
    {
      title: "Discover Internships",
      description: "Explore internship opportunities.",
      href: "/discover",
      icon: Search,
    },
    {
      title: "My Matches",
      description: "Explore internships matching your skills.",
      href: "/matches",
      icon: BriefcaseBusiness,
    },
    {
      title: "Applications",
      description: "Track your internship applications.",
      href: "/applications",
      icon: FileText,
    },
    {
      title: "Shortlist",
      description: "View your saved internship opportunities.",
      href: "/shortlist",
      icon: Heart,
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf8ff] px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-extrabold text-violet-700">
            Internly.
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem("internly_current_student");
              window.location.href = "/login";
            }}
            className="rounded-xl border border-violet-200 px-5 py-2.5 font-semibold text-violet-700 hover:bg-violet-50"
          >
            Log out
          </button>
        </div>

        <section className="mb-10 rounded-3xl bg-gradient-to-r from-violet-700 to-purple-500 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <GraduationCap size={34} />
            <span className="font-semibold tracking-wide">
              STUDENT DASHBOARD
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold">
            Welcome back, {student.name}!
          </h1>

          <p className="mt-3 text-lg text-purple-100">
            Your career journey starts here. Discover opportunities,
            build your profile and find your perfect internship.
          </p>

          {student.email && (
            <p className="mt-3 text-sm text-purple-100">
              {student.email}
            </p>
          )}
        </section>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Explore Internly
          </h2>
          <p className="mt-1 text-gray-500">
            Choose what you would like to work on today.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon size={25} />
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 font-semibold text-violet-700">
                  Explore <ArrowRight size={17} />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}
