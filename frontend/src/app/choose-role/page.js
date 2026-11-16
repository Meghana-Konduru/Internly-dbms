
import Link from "next/link";
import { GraduationCap, BriefcaseBusiness, ArrowLeft } from "lucide-react";

export default function ChooseRole() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc] px-5 py-10 text-[#211b35]">
      <section className="w-full max-w-2xl rounded-3xl border border-violet-100 bg-white p-8 shadow-xl">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-violet-700">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-extrabold">Welcome to Internly</h1>
          <p className="mt-2 text-gray-500">Choose how you want to continue.</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-2xl border-2 border-violet-100 p-7 text-center transition hover:border-violet-500 hover:bg-violet-50"
          >
            <GraduationCap size={42} className="mx-auto text-violet-600" />
            <h2 className="mt-4 text-xl font-bold">Student</h2>
            <p className="mt-2 text-sm text-gray-500">
              Discover internships and manage your applications.
            </p>
            <span className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">
              Student Login
            </span>
          </Link>

          <Link
            href="/recruiter/login"
            className="rounded-2xl border-2 border-violet-100 p-7 text-center transition hover:border-violet-500 hover:bg-violet-50"
          >
            <BriefcaseBusiness size={42} className="mx-auto text-violet-600" />
            <h2 className="mt-4 text-xl font-bold">Recruiter</h2>
            <p className="mt-2 text-sm text-gray-500">
              Post internships and manage applicants.
            </p>
            <span className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 font-bold text-white">
              Recruiter Login
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
