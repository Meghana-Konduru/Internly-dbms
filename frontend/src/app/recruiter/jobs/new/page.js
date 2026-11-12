"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

const blank = {company:"",role:"",category:"Technology",location:"",duration:"",type:"Remote",stipend:"",description:"",skills:""};
export default function NewInternship() {
  const [form,setForm] = useState(blank);
  const [message,setMessage] = useState("");
  function update(key,value){setForm(prev=>({...prev,[key]:value}));}
  function submit(e){
    e.preventDefault();
    const skills=form.skills.split(",").map(s=>s.trim()).filter(Boolean);
    if(!form.company.trim()||!form.role.trim()||!form.location.trim()||!form.duration.trim()||!form.description.trim()||!skills.length) return setMessage("Please complete all required fields and add at least one skill.");
    let jobs=[];try{jobs=JSON.parse(localStorage.getItem("internly_jobs")||"[]");}catch{}
    const job={...form,id:`job-${Date.now()}`,skills,status:"Open",createdAt:new Date().toISOString()};
    localStorage.setItem("internly_jobs",JSON.stringify([job,...jobs]));
    setMessage("Internship saved in this browser. It is not yet published to a shared database.");
    setForm(blank);
  }
  const field=(label,key,placeholder,type="text",required=true)=><label className="block text-sm font-semibold">{label}<input type={type} required={required} value={form[key]} onChange={e=>update(key,e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-violet-500"/></label>;
  return <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10"><div className="mx-auto max-w-3xl"><Link href="/recruiter/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft size={17}/>Dashboard</Link><div className="mt-5 flex items-center gap-3"><BriefcaseBusiness className="text-violet-600"/><h1 className="text-3xl font-extrabold">Post an internship</h1></div>
    {message&&<p role="status" className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-700">{message}</p>}
    <form onSubmit={submit} className="mt-7 grid gap-4 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm sm:grid-cols-2">
      {field("Company name","company","Company name")}{field("Internship role","role","e.g. Backend Developer Intern")}
      <label className="block text-sm font-semibold">Category<select value={form.category} onChange={e=>update("category",e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option>Technology</option><option>Development</option><option>Design</option><option>Analytics</option><option>Marketing</option><option>Finance</option><option>Other</option></select></label>
      {field("Location","location","City or Remote")}{field("Duration","duration","e.g. 3 months")}
      <label className="block text-sm font-semibold">Work type<select value={form.type} onChange={e=>update("type",e.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
      {field("Stipend","stipend","e.g. ₹15,000/month", "text",false)}
      <label className="block text-sm font-semibold sm:col-span-2">Description<textarea required maxLength={1500} value={form.description} onChange={e=>update("description",e.target.value)} rows={4} className="mt-1 w-full rounded-xl border p-3 font-normal" placeholder="Describe responsibilities and requirements"/></label>
      <label className="block text-sm font-semibold sm:col-span-2">Required skills (comma separated)<input required value={form.skills} onChange={e=>update("skills",e.target.value)} placeholder="React, JavaScript, CSS" className="mt-1 w-full rounded-xl border p-3 font-normal"/></label>
      <button className="rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 sm:col-span-2">Save internship</button>
    </form>
    <p className="mt-4 text-xs text-gray-400">Demo only: posting saves to local storage. Connect this form to the recruiter/job API before using it with multiple users.</p>
  </div></main>;
}
