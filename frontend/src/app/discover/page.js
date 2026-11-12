"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness, LayoutDashboard, Search, Heart, FileText, User,
  MapPin, Clock, X, Bookmark, Sparkles, RotateCcw, CheckCircle2,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap
} from "lucide-react";

const sampleJobs = [
  {
    id: 1, company: "Google", role: "Software Engineering Intern",
    category: "Technology", location: "Bangalore, India", duration: "3 Months",
    type: "Hybrid", stipend: "₹25,000/month",
    description: "Work with experienced engineers to build scalable applications, solve technical problems and develop your software engineering skills.",
    skills: ["Python", "Java", "DSA", "Problem Solving"], logo: "G",
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: 2, company: "Microsoft", role: "Frontend Developer Intern",
    category: "Development", location: "Hyderabad, India", duration: "6 Months",
    type: "Remote", stipend: "₹30,000/month",
    description: "Build modern user interfaces, collaborate with designers and develop engaging web applications using modern frontend technologies.",
    skills: ["React", "JavaScript", "CSS", "HTML"], logo: "M",
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: 3, company: "Adobe", role: "UI/UX Design Intern",
    category: "Design", location: "Remote", duration: "3 Months",
    type: "Remote", stipend: "₹20,000/month",
    description: "Create intuitive user experiences, design interfaces and collaborate with product teams to improve digital experiences.",
    skills: ["Figma", "UI Design", "Prototyping"], logo: "A",
    color: "bg-red-100 text-red-700"
  },
  {
    id: 4, company: "Amazon", role: "Data Analyst Intern",
    category: "Analytics", location: "Bangalore, India", duration: "4 Months",
    type: "Hybrid", stipend: "₹22,000/month",
    description: "Analyze business data, create meaningful reports and help teams make data-driven decisions.",
    skills: ["SQL", "Python", "Excel", "Analytics"], logo: "A",
    color: "bg-yellow-100 text-yellow-700"
  }
];

const readArray = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

export default function Discover() {
  const [jobs, setJobs] = useState(sampleJobs);
  const [shortlist, setShortlist] = useState([]);
  const [applications, setApplications] = useState([]);
  const [passed, setPassed] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setShortlist(readArray("internly_shortlist"));
    setApplications(readArray("internly_applications"));
    const savedSkills = readArray("internly_skills");
    setProfileSkills(savedSkills.map(s => typeof s === "string" ? s : s.name).filter(Boolean));
  }, []);

  const currentJob = jobs[0];
  const matchInfo = useMemo(() => {
    if (!currentJob) return { matched: [], missing: [], percent: 0 };
    const mine = new Set(profileSkills.map(s => s.toLowerCase()));
    const matched = currentJob.skills.filter(s => mine.has(s.toLowerCase()));
    const missing = currentJob.skills.filter(s => !mine.has(s.toLowerCase()));
    return { matched, missing, percent: currentJob.skills.length ? Math.round(matched.length / currentJob.skills.length * 100) : 0 };
  }, [currentJob, profileSkills]);

  const nextJob = useCallback(() => setJobs(prev => prev.slice(1)), []);

  const skipJob = useCallback(() => {
    if (!currentJob) return;
    setPassed(prev => [...prev, currentJob]);
    setNotice(`Skipped ${currentJob.role}`);
    nextJob();
    setShowMatch(false);
  }, [currentJob, nextJob]);

  const applyJob = useCallback(() => {
    if (!currentJob) return;
    const existing = readArray("internly_applications");
    if (existing.some(item => String(item.jobId ?? item.id) === String(currentJob.id))) {
      setNotice("You have already applied to this internship.");
    } else {
      const application = {
        id: `app-${currentJob.id}-${Date.now()}`,
        jobId: currentJob.id,
        company: currentJob.company,
        role: currentJob.role,
        location: currentJob.location,
        stipend: currentJob.stipend,
        appliedAt: new Date().toISOString(),
        status: "Applied"
      };
      const updated = [...existing, application];
      localStorage.setItem("internly_applications", JSON.stringify(updated));
      setApplications(updated);
      setNotice(`Application submitted to ${currentJob.company}!`);
    }
    nextJob();
    setShowMatch(false);
  }, [currentJob, nextJob]);

  const saveJob = useCallback(() => {
    if (!currentJob) return;
    const existing = readArray("internly_shortlist");
    if (existing.some(item => item.id === currentJob.id)) {
      setNotice("This internship is already in your shortlist.");
    } else {
      const updated = [...existing, { ...currentJob, savedAt: new Date().toISOString() }];
      localStorage.setItem("internly_shortlist", JSON.stringify(updated));
      setShortlist(updated);
      setNotice("Internship added to your shortlist.");
    }
    nextJob();
    setShowMatch(false);
  }, [currentJob, nextJob]);

  const toggleMatch = useCallback(() => {
    setShowMatch(prev => !prev);
    setNotice("");
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag) || event.target?.isContentEditable) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); skipJob(); }
      if (event.key === "ArrowRight") { event.preventDefault(); applyJob(); }
      if (event.key === "ArrowUp") { event.preventDefault(); saveJob(); }
      if (event.key === "ArrowDown") { event.preventDefault(); toggleMatch(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [skipJob, applyJob, saveJob, toggleMatch]);

  function restartDiscovery() {
    setJobs(sampleJobs);
    setPassed([]);
    setShowMatch(false);
    setNotice("");
  }

  return (
    <main className="min-h-screen bg-[#f8f7fc] text-[#211b35] md:flex">
      <aside className="border-r border-violet-100 bg-white p-6 md:min-h-screen md:w-64">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white"><BriefcaseBusiness size={23} /></div>
          <span className="text-2xl font-extrabold">internly.</span>
        </Link>
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Main menu</p>
        <nav className="flex flex-wrap gap-2 md:flex-col">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"><LayoutDashboard size={19}/>Dashboard</Link>
          <Link href="/discover" className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700"><Search size={19}/>Discover</Link>
          <Link href="/matches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"><Heart size={19}/>Matches</Link>
          <Link href="/applications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"><FileText size={19}/>Applications</Link>
          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"><User size={19}/>My Profile</Link>
          <Link href="/skills" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50"><Sparkles size={19}/>Skills & Certifications</Link>
        </nav>
      </aside>

      <section className="min-w-0 flex-1 px-5 py-8 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-600">FIND YOUR PERFECT FIT</p>
            <h1 className="mt-2 text-3xl font-extrabold">Discover Internships</h1>
            <p className="mt-2 text-sm text-gray-500">Use your arrow keys or the action buttons to explore opportunities.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm"><span className="font-bold text-violet-600">{applications.length}</span><span className="ml-2 text-gray-500">Applied</span></div>
            <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm"><span className="font-bold text-violet-600">{shortlist.length}</span><span className="ml-2 text-gray-500">Shortlisted</span></div>
          </div>
        </header>

        <div className="mx-auto mt-9 max-w-2xl">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Opportunities waiting for you</span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">{jobs.length} remaining</span>
          </div>

          {notice && <div role="status" className="mb-4 rounded-xl border border-violet-100 bg-white p-3 text-sm font-medium text-violet-700">{notice}</div>}

          {currentJob ? <>
            <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/50">
              <div className="bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold"><Sparkles size={13} className="mr-1 inline"/>Recommended for you</span>
                  <span className="rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold">{currentJob.type}</span>
                </div>
                <div className="mt-10 flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-extrabold ${currentJob.color}`}>{currentJob.logo}</div>
                  <div><p className="text-sm text-violet-200">{currentJob.company}</p><h2 className="mt-1 text-2xl font-extrabold">{currentJob.role}</h2></div>
                </div>
                <p className="mt-6 text-sm text-violet-100">{currentJob.category} Internship</p>
              </div>
              <div className="p-7">
                <h3 className="text-lg font-bold">About this opportunity</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{currentJob.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-violet-50 p-4"><MapPin size={19} className="text-violet-600"/><p className="mt-2 text-xs text-gray-500">Location</p><p className="mt-1 text-sm font-semibold">{currentJob.location}</p></div>
                  <div className="rounded-xl bg-violet-50 p-4"><Clock size={19} className="text-violet-600"/><p className="mt-2 text-xs text-gray-500">Duration</p><p className="mt-1 text-sm font-semibold">{currentJob.duration}</p></div>
                </div>
                <div className="mt-5"><p className="text-sm font-bold">Stipend</p><p className="mt-1 text-lg font-extrabold text-green-600">{currentJob.stipend}</p></div>
                <div className="mt-5"><p className="mb-3 text-sm font-bold">Required skills</p><div className="flex flex-wrap gap-2">{currentJob.skills.map(skill => <span key={skill} className="rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">{skill}</span>)}</div></div>
              </div>
            </div>

            {showMatch && <section className="mt-5 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm" aria-live="polite">
              <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Your skill match</h3><span className="text-2xl font-extrabold text-violet-700">{matchInfo.percent}%</span></div>
              <p className="mt-1 text-sm text-gray-500">Based on the skills saved in your Skills & Certifications section.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-600" style={{width: `${matchInfo.percent}%`}}/></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><p className="mb-2 text-sm font-semibold text-green-700">Matching skills</p>{matchInfo.matched.length ? matchInfo.matched.map(s => <p key={s} className="mb-1 text-sm text-gray-600"><CheckCircle2 size={14} className="mr-2 inline text-green-600"/>{s}</p>) : <p className="text-sm text-gray-400">No matching skills found yet.</p>}</div>
                <div><p className="mb-2 text-sm font-semibold text-amber-700">Skills to develop</p>{matchInfo.missing.length ? matchInfo.missing.map(s => <p key={s} className="mb-1 text-sm text-gray-600">{s}</p>) : <p className="text-sm text-gray-400">You have all listed skills.</p>}</div>
              </div>
            </section>}

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button onClick={skipJob} className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-4 font-bold text-red-600 shadow-sm hover:bg-red-50"><ArrowLeft size={18}/>Skip</button>
              <button onClick={applyJob} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-4 font-bold text-white shadow-md hover:bg-violet-700"><ArrowRight size={18}/>Apply</button>
              <button onClick={saveJob} className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-4 font-bold text-blue-700 shadow-sm hover:bg-blue-50"><ArrowUp size={18}/>Shortlist</button>
              <button onClick={toggleMatch} className="flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-white px-3 py-4 font-bold text-amber-700 shadow-sm hover:bg-amber-50"><ArrowDown size={18}/>Skill match</button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">Keyboard: ← Skip · → Apply · ↑ Shortlist · ↓ Skill match (press again to close)</p>
          </> : <div className="rounded-3xl border border-violet-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600"><BriefcaseBusiness size={35}/></div>
            <h2 className="mt-6 text-2xl font-extrabold">You&apos;re all caught up!</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">You&apos;ve explored all available sample internships.</p>
            <button onClick={restartDiscovery} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700"><RotateCcw size={17}/>Start again</button>
          </div>}

          <div className="mt-7 rounded-2xl bg-violet-50 p-5 text-center">
            <p className="text-sm font-semibold text-violet-800"><Zap size={16} className="mr-2 inline"/>Your next opportunity could be one key away!</p>
            <p className="mt-1 text-xs text-violet-600">Applied: {applications.length} · Passed this session: {passed.length} · Shortlisted: {shortlist.length}</p>
            <p className="mt-3 text-xs text-violet-500"><Link href="/applications" className="underline">View applications</Link> · <Link href="/shortlist" className="underline">View shortlist</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
