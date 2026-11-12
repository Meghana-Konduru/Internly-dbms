"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, MapPin, Trash2 } from "lucide-react";

export default function ShortlistPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("internly_shortlist") || "[]")); } catch {} }, []);
  function remove(id) {
    const updated = items.filter(item => item.id !== id);
    setItems(updated); localStorage.setItem("internly_shortlist", JSON.stringify(updated));
  }
  return <main className="min-h-screen bg-[#f8f7fc] px-5 py-8 text-[#211b35] md:px-10"><div className="mx-auto max-w-4xl">
    <Link href="/discover" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft size={17}/>Back to Discover</Link>
    <h1 className="mt-5 text-3xl font-extrabold">My Shortlist</h1><p className="mt-2 text-sm text-gray-500">Internships you saved to consider later.</p>
    <div className="mt-7 space-y-4">{items.map(job=><article key={job.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><div><p className="font-bold">{job.role}</p><p className="mt-1 text-sm text-violet-700">{job.company}</p><p className="mt-2 text-xs text-gray-500"><MapPin size={13} className="mr-1 inline"/>{job.location} · {job.stipend}</p></div><button onClick={()=>remove(job.id)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={16}/>Remove</button></article>)}
    {!items.length && <div className="rounded-2xl bg-white p-12 text-center text-gray-500"><Bookmark size={30} className="mx-auto mb-3 text-violet-500"/>Your shortlist is empty.</div>}</div>
  </div></main>;
}
