
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Heart,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9ff] text-[#211b35]">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <BriefcaseBusiness size={23} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            internly<span className="text-violet-600">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-sm font-medium text-gray-600 md:flex">
          <a href="#how-it-works" className="hover:text-violet-600">
            How it works
          </a>
          <a href="#features" className="hover:text-violet-600">
            Features
          </a>
          <a href="#about" className="hover:text-violet-600">
            About us
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold hover:text-violet-600 sm:block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles size={16} />
            Your career journey starts here
          </div>

          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Find your
            <span className="block text-violet-600">perfect</span>
            internship.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-8 text-gray-500">
            Stop endlessly searching. Discover opportunities that match your
            skills, explore exciting companies and take the first step towards
            your dream career.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-3 rounded-xl bg-violet-600 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              Explore internships
              <ArrowRight size={19} />
            </Link>

            <a
              href="#how-it-works"
              className="rounded-xl border border-gray-200 bg-white px-7 py-4 font-semibold transition hover:border-violet-300"
            >
              Learn more
            </a>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {["A", "M", "S", "R"].map((letter, index) => (
                <div
                  key={letter}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-violet-100 font-bold text-violet-700"
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <strong className="text-gray-800">Your next opportunity</strong>
              <br />
              is just a swipe away.
            </p>
          </div>
        </div>

        {/* Illustration card */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-200/60 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-200/60 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white bg-white p-6 shadow-2xl shadow-violet-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Discover opportunities</p>
                <h2 className="mt-1 text-xl font-bold">Made for you ✨</h2>
              </div>
              <div className="rounded-full bg-violet-50 p-3 text-violet-600">
                <Search size={22} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-7 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                  Featured opportunity
                </span>
                <Heart size={22} />
              </div>
              <div className="mt-12">
                <p className="text-sm text-violet-100">Technology</p>
                <h3 className="mt-2 text-3xl font-bold">
                  UI/UX Design Intern
                </h3>
                <p className="mt-2 text-violet-100">Creative Studio</p>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-white/20 pt-5">
                <span className="text-sm">Remote · 3 months</span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-700">
                  View role
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-violet-50 p-4">
                <GraduationCap className="text-violet-600" size={25} />
                <p className="mt-3 font-bold">Student first</p>
                <p className="mt-1 text-xs text-gray-500">
                  Opportunities for your growth
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4">
                <Zap className="text-violet-600" size={25} />
                <p className="mt-3 font-bold">Smart matching</p>
                <p className="mt-1 text-xs text-gray-500">
                  Find roles that fit you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-violet-100 bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 text-center md:grid-cols-3">
          <div>
            <Search className="mx-auto text-violet-600" size={30} />
            <h3 className="mt-4 text-lg font-bold">Discover</h3>
            <p className="mt-2 text-sm text-gray-500">
              Explore internships based on your interests and skills.
            </p>
          </div>
          <div>
            <Heart className="mx-auto text-violet-600" size={30} />
            <h3 className="mt-4 text-lg font-bold">Match</h3>
            <p className="mt-2 text-sm text-gray-500">
              Swipe through opportunities and find your perfect fit.
            </p>
          </div>
          <div>
            <Users className="mx-auto text-violet-600" size={30} />
            <h3 className="mt-4 text-lg font-bold">Connect</h3>
            <p className="mt-2 text-sm text-gray-500">
              Connect with recruiters and move towards your career goals.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="font-semibold text-violet-600">SIMPLE. SMART. EFFECTIVE.</p>
        <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
          Your journey in three steps
        </h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            ["01", "Create your profile", "Tell us about your education, interests and skills."],
            ["02", "Discover and swipe", "Explore internships that suit your career goals."],
            ["03", "Get matched", "Connect with recruiters and track your applications."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-3xl border border-violet-100 bg-white p-8 text-left">
              <span className="text-4xl font-extrabold text-violet-200">{number}</span>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-6 mb-16 rounded-[2rem] bg-violet-700 px-6 py-16 text-center text-white md:mx-auto md:max-w-7xl">
        <h2 className="text-3xl font-extrabold md:text-4xl">
          Ready to find your next opportunity?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-violet-100">
          Take control of your career journey. Your next big opportunity could
          be waiting for you.
        </p>
        <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-violet-700 hover:bg-violet-50">
          Get started <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-100 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 INTERNLY. Built for the next generation of professionals.
      </footer>
    </main>
  );
}
