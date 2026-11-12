
"use client";

import { useState } from "react";
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
  X,
  Bookmark,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const initialJobs = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineering Intern",
    category: "Technology",
    location: "Bangalore, India",
    duration: "3 Months",
    type: "Hybrid",
    stipend: "₹25,000/month",
    description:
      "Work with experienced engineers to build scalable applications, solve technical problems and develop your software engineering skills.",
    skills: ["Python", "Java", "DSA", "Problem Solving"],
    logo: "G",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    company: "Microsoft",
    role: "Frontend Developer Intern",
    category: "Development",
    location: "Hyderabad, India",
    duration: "6 Months",
    type: "Remote",
    stipend: "₹30,000/month",
    description:
      "Build modern user interfaces, collaborate with designers and develop engaging web applications using modern frontend technologies.",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    logo: "M",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: 3,
    company: "Adobe",
    role: "UI/UX Design Intern",
    category: "Design",
    location: "Remote",
    duration: "3 Months",
    type: "Remote",
    stipend: "₹20,000/month",
    description:
      "Create intuitive user experiences, design interfaces and collaborate with product teams to improve digital experiences.",
    skills: ["Figma", "UI Design", "Prototyping"],
    logo: "A",
    color: "bg-red-100 text-red-700",
  },
  {
    id: 4,
    company: "Amazon",
    role: "Data Analyst Intern",
    category: "Analytics",
    location: "Bangalore, India",
    duration: "4 Months",
    type: "Hybrid",
    stipend: "₹22,000/month",
    description:
      "Analyze business data, create meaningful reports and help teams make data-driven decisions.",
    skills: ["SQL", "Python", "Excel", "Analytics"],
    logo: "A",
    color: "bg-yellow-100 text-yellow-700",
  },
];

export default function Discover() {
  const [jobs, setJobs] = useState(initialJobs);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const [passed, setPassed] = useState([]);

  const currentJob = jobs[0];

  function handlePass() {
    if (!currentJob) return;
    setPassed((prev) => [...prev, currentJob]);
    setJobs((prev) => prev.slice(1));
  }

  function handleLike() {
  if (!currentJob) return;

  const updatedLikes = [...liked, currentJob];

  setLiked(updatedLikes);
  localStorage.setItem(
    "internly_liked_jobs",
    JSON.stringify(updatedLikes)
  );

  setJobs((prev) => prev.slice(1));
}
  function handleSave() {
    if (!currentJob) return;

    setSaved((prev) =>
      prev.some((job) => job.id === currentJob.id)
        ? prev.filter((job) => job.id !== currentJob.id)
        : [...prev, currentJob]
    );
  }

  function restartDiscovery() {
    setJobs(initialJobs);
    setLiked([]);
    setPassed([]);
  }

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

          <Link href="/discover" className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700">
            <Search size={19} /> Discover
          </Link>

          <Link href="/matches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Heart size={19} /> Matches
          </Link>

          <Link href="/applications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <FileText size={19} /> Applications
          </Link>

          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <User size={19} /> My Profile
          </Link>
        </nav>
      </aside>

      {/* Main Section */}
      <section className="min-w-0 flex-1 px-5 py-8 md:px-10">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-600">
              FIND YOUR PERFECT FIT
            </p>
            <h1 className="mt-2 text-3xl font-extrabold">
              Discover Internships
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Swipe through opportunities and find your next big thing.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
              <span className="font-bold text-violet-600">{liked.length}</span>
              <span className="ml-2 text-gray-500">Liked</span>
            </div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
              <span className="font-bold text-violet-600">{saved.length}</span>
              <span className="ml-2 text-gray-500">Saved</span>
            </div>
          </div>
        </header>

        {/* Discovery Area */}
        <div className="mx-auto mt-9 max-w-2xl">

          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">
              Opportunities waiting for you
            </span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              {jobs.length} remaining
            </span>
          </div>

          {currentJob ? (
            <>
              {/* Internship Card */}
              <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/50">

                <div className="bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold">
                      <Sparkles size={13} className="mr-1 inline" />
                      Recommended for you
                    </span>

                    <button
                      onClick={handleSave}
                      aria-label="Save internship"
                      className={`rounded-xl p-3 transition ${
                        saved.some((job) => job.id === currentJob.id)
                          ? "bg-white text-violet-700"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      <Bookmark size={21} fill={saved.some((job) => job.id === currentJob.id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-extrabold ${currentJob.color}`}>
                      {currentJob.logo}
                    </div>

                    <div>
                      <p className="text-sm text-violet-200">
                        {currentJob.company}
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold">
                        {currentJob.role}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-6 text-sm text-violet-100">
                    {currentJob.category} Internship
                  </p>
                </div>

                <div className="p-7">
                  <h3 className="text-lg font-bold">About this opportunity</h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {currentJob.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-violet-50 p-4">
                      <MapPin size={19} className="text-violet-600" />
                      <p className="mt-2 text-xs text-gray-500">Location</p>
                      <p className="mt-1 text-sm font-semibold">{currentJob.location}</p>
                    </div>

                    <div className="rounded-xl bg-violet-50 p-4">
                      <Clock size={19} className="text-violet-600" />
                      <p className="mt-2 text-xs text-gray-500">Duration</p>
                      <p className="mt-1 text-sm font-semibold">{currentJob.duration}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-bold">Stipend</p>
                    <p className="mt-1 text-lg font-extrabold text-green-600">
                      {currentJob.stipend}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-bold">Required skills</p>
                    <div className="flex flex-wrap gap-2">
                      {currentJob.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
                      {currentJob.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Swipe Buttons */}
              <div className="mt-7 flex items-center justify-center gap-6">
                <button
                  onClick={handlePass}
                  aria-label="Pass internship"
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-100 bg-white text-red-500 shadow-md transition hover:scale-110 hover:bg-red-50"
                >
                  <X size={30} />
                </button>

                <button
                  onClick={handleLike}
                  aria-label="Like internship"
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-200 transition hover:scale-110 hover:bg-violet-700"
                >
                  <Heart size={34} />
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                <X size={13} className="mr-1 inline" /> Pass
                <span className="mx-3">·</span>
                <Heart size={13} className="mr-1 inline" /> Like
              </p>
            </>
          ) : (
            <div className="rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <BriefcaseBusiness size={35} />
              </div>

              <h2 className="mt-6 text-2xl font-extrabold">
                You're all caught up!
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                You've explored all the available sample internships. Come back
                for more opportunities.
              </p>

              <button
                onClick={restartDiscovery}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700"
              >
                <RotateCcw size={17} /> Start again
              </button>
            </div>
          )}

          <div className="mt-7 rounded-2xl bg-violet-50 p-5 text-center">
            <p className="text-sm font-semibold text-violet-800">
              <Heart size={16} className="mr-2 inline" />
              Your next opportunity could be one swipe away!
            </p>
            <p className="mt-1 text-xs text-violet-600">
              Liked: {liked.length} · Passed: {passed.length} · Saved: {saved.length}
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
