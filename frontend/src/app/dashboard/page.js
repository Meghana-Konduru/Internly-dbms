
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Heart,
  FileText,
  User,
  Settings,
  Bell,
  BriefcaseBusiness,
  MapPin,
  Clock,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const internships = [
  {
    company: "Google",
    role: "Software Engineering Intern",
    category: "Technology",
    location: "Bangalore",
    duration: "3 Months",
    type: "Remote",
    color: "bg-blue-100 text-blue-700",
    logo: "G",
  },
  {
    company: "Microsoft",
    role: "Frontend Developer Intern",
    category: "Development",
    location: "Hyderabad",
    duration: "6 Months",
    type: "Hybrid",
    color: "bg-orange-100 text-orange-700",
    logo: "M",
  },
  {
    company: "Adobe",
    role: "UI/UX Design Intern",
    category: "Design",
    location: "Remote",
    duration: "3 Months",
    type: "Remote",
    color: "bg-red-100 text-red-700",
    logo: "A",
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f8f7fc] text-[#211b35] md:flex">

      {/* Sidebar */}
      <aside className="flex w-full flex-col border-r border-violet-100 bg-white p-6 md:min-h-screen md:w-64">
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
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700">
            <LayoutDashboard size={19} /> Dashboard
          </Link>

          <Link href="/discover" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50 hover:text-violet-700">
            <Search size={19} /> Discover
          </Link>

          <Link href="/matches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50 hover:text-violet-700">
            <Heart size={19} /> Matches
          </Link>

          <Link href="/applications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50 hover:text-violet-700">
            <FileText size={19} /> Applications
          </Link>

          <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50 hover:text-violet-700">
            <User size={19} /> My Profile
          </Link>
        </nav>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Settings size={19} /> Settings
          </Link>
        </div>

        <div className="mt-auto hidden rounded-2xl bg-violet-50 p-4 md:block">
          <Sparkles className="text-violet-600" size={24} />
          <p className="mt-3 font-bold">Your career journey</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Discover opportunities and take the next step towards your dream career.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1 p-5 md:p-9">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Student workspace</p>
            <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
              Welcome back! 👋
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Here's what's happening with your career today.
            </p>
          </div>

          <button className="rounded-xl border border-gray-200 bg-white p-3 text-gray-600">
            <Bell size={21} />
          </button>
        </header>

        {/* Profile Banner */}
        <div className="mt-8 flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm text-violet-200">YOUR NEXT OPPORTUNITY STARTS HERE</p>
            <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">
              Find internships that fit you.
            </h2>
            <p className="mt-2 text-sm text-violet-100">
              Explore, swipe and connect with exciting companies.
            </p>
            <Link href="/discover" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50">
              Discover internships <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hidden rounded-3xl bg-white/15 p-7 md:block">
            <BriefcaseBusiness size={75} />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "Applications", value: "08", icon: FileText },
            { title: "Matches", value: "12", icon: Heart },
            { title: "Saved Jobs", value: "05", icon: Bookmark },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <Icon className="text-violet-600" size={21} />
                </div>
                <h3 className="mt-3 text-3xl font-extrabold">{item.value}</h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp size={14} /> Your career is moving forward
                </p>
              </div>
            );
          })}
        </div>

        {/* Recommended Internships */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Recommended for you</h2>
              <p className="mt-1 text-sm text-gray-500">
                Opportunities you might love.
              </p>
            </div>
            <Link href="/discover" className="flex items-center gap-1 text-sm font-bold text-violet-600">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {internships.map((job) => (
              <div key={job.company} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-extrabold ${job.color}`}>
                    {job.logo}
                  </div>
                  <button aria-label="Save internship" className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <Bookmark size={18} />
                  </button>
                </div>

                <p className="mt-5 text-xs font-semibold text-violet-600">
                  {job.category}
                </p>
                <h3 className="mt-2 text-lg font-bold">{job.role}</h3>
                <p className="mt-1 text-sm text-gray-500">{job.company}</p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.duration}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {job.type}
                  </span>
                  <Link href="/discover" className="text-sm font-bold text-violet-600">
                    Explore →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          © 2026 INTERNLY. Your career journey starts here.
        </footer>

      </section>
    </main>
  );
}
