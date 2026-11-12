
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness, LayoutDashboard, Search, Heart,
  FileText, User, Mail, Phone, GraduationCap,
  Calendar, MapPin, Edit3, Save, Upload,
  Sparkles, CheckCircle,
} from "lucide-react";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  college: "",
  degree: "",
  graduationYear: "",
  location: "",
  skills: "",
  about: "",
};

const courses = [
  "B.Tech",
  "B.E.",
  "B.Com",
  "BBA",
  "BCA",
  "B.Sc",
  "B.A.",
  "B.Des",
  "B.Arch",
  "B.Pharm",
  "LLB",
  "M.Tech",
  "M.E.",
  "M.Com",
  "MBA",
  "MCA",
  "M.Sc",
  "M.A.",
  "Other",
];

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("internly_profile");
      if (stored) {
        setProfile({ ...initialProfile, ...JSON.parse(stored) });
      }

      const storedResume = localStorage.getItem("internly_resume_name");
      if (storedResume) setResumeName(storedResume);
    } catch (error) {
      console.error("Could not load profile:", error);
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    let newValue = value;

    // Phone: numbers only, maximum 10 digits
    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Graduation year: numbers only, maximum 4 digits
    if (name === "graduationYear") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setProfile((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSaved(false);
  }

  function validateProfile() {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(profile.name.trim())) {
      newErrors.name = "Enter a valid name using letters only.";
    }

    if (!profile.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(profile.email.trim())
    ) {
      newErrors.email = "Enter a valid Gmail address ending in @gmail.com.";
    }

    if (!profile.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(profile.phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits.";
    }

    if (!profile.college.trim()) {
      newErrors.college = "College or university is required.";
    }

    if (!profile.degree) {
      newErrors.degree = "Please select your course.";
    }

    if (!/^[0-9]{4}$/.test(profile.graduationYear)) {
      newErrors.graduationYear = "Enter a valid 4-digit graduation year.";
    }

    if (!profile.location.trim()) {
      newErrors.location = "Location is required.";
    }

    return newErrors;
  }

  function handleSave(e) {
    e.preventDefault();

    const validationErrors = validateProfile();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaved(false);
      return;
    }

    try {
      localStorage.setItem("internly_profile", JSON.stringify(profile));
      setEditing(false);
      setSaved(true);
    } catch (error) {
      alert("Could not save your profile. Please try again.");
    }
  }

  function handleResume(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.test(file.name)
    ) {
      alert("Only PDF, DOC and DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Resume size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setResumeName(file.name);
    localStorage.setItem("internly_resume_name", file.name);
  }

  const fields = [
    { label: "Full Name", name: "name", icon: User, placeholder: "Enter your full name" },
    { label: "Email Address", name: "email", icon: Mail, placeholder: "you@gmail.com", type: "email" },
    { label: "Phone Number", name: "phone", icon: Phone, placeholder: "10-digit mobile number", type: "tel" },
    { label: "College / University", name: "college", icon: GraduationCap, placeholder: "Enter your college name" },
    { label: "Graduation Year", name: "graduationYear", icon: Calendar, placeholder: "e.g. 2027" },
    { label: "Location", name: "location", icon: MapPin, placeholder: "e.g. Bengaluru, India" },
  ];

  function renderError(name) {
    return errors[name] ? (
      <p className="mt-1 text-xs font-medium text-red-600">
        {errors[name]}
      </p>
    ) : null;
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

          <Link href="/discover" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Search size={19} /> Discover
          </Link>

          <Link href="/matches" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <Heart size={19} /> Matches
          </Link>

          <Link href="/applications" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-violet-50">
            <FileText size={19} /> Applications
          </Link>

          <Link href="/profile" className="flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 font-semibold text-violet-700">
            <User size={19} /> My Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1 p-6 md:p-10">

        <p className="text-sm font-semibold text-violet-600">
          YOUR PERSONAL SPACE
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">My Profile</h1>
            <p className="mt-2 text-gray-500">
              Manage your information and showcase your skills.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setSaved(false);
              }}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
            >
              <Save size={18} /> Save Profile
            </button>
          )}
        </div>

        {/* Profile Banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-extrabold text-violet-700">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold">
                {profile.name || "Your Name"}
              </h2>
              <p className="mt-1 text-violet-100">
                {profile.degree || "Student"}
              </p>
              <p className="mt-1 text-sm text-violet-100">
                {profile.college || "Your College"}
              </p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
            <CheckCircle size={18} />
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave}>

          {/* Personal Information */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Personal Information</h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {fields.map((field) => {
                const Icon = field.icon;

                return (
                  <div key={field.name}>
                    <label className="mb-2 block text-sm font-semibold">
                      {field.label}
                    </label>

                    <div className="relative">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />

                      <input
                        name={field.name}
                        type={field.type || "text"}
                        value={profile[field.name]}
                        onChange={handleChange}
                        disabled={!editing}
                        required
                        maxLength={
                          field.name === "phone" ? 10 :
                          field.name === "graduationYear" ? 4 :
                          undefined
                        }
                        inputMode={
                          ["phone", "graduationYear"].includes(field.name)
                            ? "numeric"
                            : undefined
                        }
                        placeholder={field.placeholder}
                        className={`w-full rounded-xl border ${errors[field.name] ? "border-red-400" : "border-gray-200"} bg-white py-3 pl-11 pr-4 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50 disabled:text-gray-600`}
                      />
                    </div>

                    {renderError(field.name)}
                  </div>
                );
              })}

              {/* Course Dropdown */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Degree / Course
                </label>

                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" size={18} />

                  <select
                    name="degree"
                    value={profile.degree}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                    className={`w-full appearance-none rounded-xl border ${errors.degree ? "border-red-400" : "border-gray-200"} bg-white py-3 pl-11 pr-4 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50`}
                  >
                    <option value="">Select your course</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                {renderError("degree")}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Skills</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add your technical and professional skills, separated by commas.
            </p>

            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              disabled={!editing}
              rows={3}
              maxLength={500}
              placeholder="e.g. Python, Java, React, SQL, Communication"
              className="mt-5 w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50"
            />

            {profile.skills && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.split(",").filter((skill) => skill.trim()).map((skill, index) => (
                  <span key={index} className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* About Me */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">About Me</h2>

            <textarea
              name="about"
              value={profile.about}
              onChange={handleChange}
              disabled={!editing}
              rows={4}
              maxLength={1000}
              placeholder="Tell companies about yourself, your interests and career goals..."
              className="mt-5 w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50"
            />
          </div>

          {/* Resume */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Resume</h2>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-violet-300 bg-violet-50 p-5">
              <div className="flex items-center gap-3">
                <FileText className="text-violet-600" size={30} />

                <div>
                  <p className="font-semibold">
                    {resumeName || "Upload your resume"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC or DOCX · Maximum 5 MB
                  </p>
                </div>
              </div>

              <label className={`flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-white ${editing ? "cursor-pointer bg-violet-600 hover:bg-violet-700" : "cursor-not-allowed bg-gray-400"}`}>
                <Upload size={18} />
                Upload Resume

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={!editing}
                  onChange={handleResume}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          {editing && (
            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 font-bold text-white hover:bg-violet-700 md:w-auto md:px-10"
            >
              <Save size={18} />
              Save Profile
            </button>
          )}

        </form>

        {/* Bottom Message */}
        <div className="mt-8 rounded-2xl bg-violet-50 p-5 text-sm text-violet-800">
          <Sparkles className="mr-2 inline" size={18} />
          Keep your profile updated to make a great impression on recruiters!
        </div>

      </section>
    </main>
  );
}
