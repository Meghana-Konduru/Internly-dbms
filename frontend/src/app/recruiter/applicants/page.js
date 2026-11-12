"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function ApplicantsPage() {
  const [apps,setApps] = useState([]);
  useEffect(()=>{try{setApps(JSON.parse(localStorage.getItem("internly_applications")||"[]"));}catch{}},[]);
  function updateStatus(id,status){
    const updated=apps.map(a=>a.id===id?{...a,status}:a);
    setApps(updated);localStorage.setItem("internly_applications",JSON.stringify(updated));
  }
  return <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10"><div className="mx-auto max-w-5xl"><Link href="/recruiter/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft size={17}/>Dashboard</Link><div className="mt-5 flex items-center gap-3"><Users className="text-violet-600"/><h1 className="text-3xl font-extrabold">Applicants</h1></div><p className="mt-2 text-sm text-gray-500">Review application records in this browser demo.</p>
    <div className="mt-7 space-y-3">{apps.map(app=><article key={app.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><div><p className="font-bold">{app.role}</p><p className="mt-1 text-sm text-violet-700">{app.company}</p><p className="mt-1 text-xs text-gray-500">Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Date unavailable"}</p><p className="mt-1 text-xs text-gray-500">Student ID/name will appear after student authentication and backend integration.</p></div><div className="flex items-center gap-2"><span className="text-xs text-gray-500">Status</span><select value={app.status||"Applied"} onChange={e=>updateStatus(app.id,e.target.value)} className="rounded-lg border p-2 text-sm"><option>Applied</option><option>Under Review</option><option>Shortlisted</option><option>Rejected</option><option>Accepted</option></select></div></article>)}
    {!apps.length&&<div className="rounded-2xl bg-white p-12 text-center text-gray-500">No applications are available in this browser yet.</div>}</div>
    <p className="mt-5 text-xs text-gray-400">Important: browser local storage is device-specific and is not a real shared recruiter applicant database.</p>
  </div></main>;
}
