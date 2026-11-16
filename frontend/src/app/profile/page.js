"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import {
  BriefcaseBusiness, LayoutDashboard, Search, Heart,
  FileText, User, Mail, Phone, GraduationCap,
  Calendar, MapPin, Edit3, Save, Upload,
  Sparkles, CheckCircle, Plus, Trash2, Award,
} from "lucide-react";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  college: "",
  department: "",
  degree: "",
  graduationYear: "",
  location: "",
  about: "",
};

const courses = [
  "B.Tech", "B.E.", "B.Com", "BBA", "BCA", "B.Sc",
  "B.A.", "B.Des", "B.Arch", "B.Pharm", "LLB",
  "M.Tech", "M.E.", "M.Com", "MBA", "MCA",
  "M.Sc", "M.A.", "Other",
];

function getStorageKey(prefix, email) {
  return `${prefix}_${(email || "").toLowerCase().trim()}`;
}

export default function Profile() {
  const { user, loading: authLoading, apiRequest } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(initialProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  // PostgreSQL Skills Manager state
  const [availableSkills, setAvailableSkills] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [newSkillId, setNewSkillId] = useState("");
  const [newProficiency, setNewProficiency] = useState("Beginner");
  const [skillBusy, setSkillBusy] = useState(false);

// PostgreSQL Certifications Manager state
const [certifications, setCertifications] = useState([]);
const [certDate, setCertDate] = useState("");
const [certMessage, setCertMessage] = useState("");
const [selectedCertificationId, setSelectedCertificationId] = useState("");
const [availableCertifications, setAvailableCertifications] = useState([]);
const [certificationBusy, setCertificationBusy] = useState(false);

  const proficiencyLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
  ];

  // Load profile from PostgreSQL and local storage
  useEffect(() => {
    if (authLoading) return;

    let active = true;

    async function loadProfile() {
      try {
        if (!user) {
          throw new Error("Please log in to view your profile.");
        }

        const response = await apiRequest("/api/students/me");
        const student = response.profile;

        const storageKey = getStorageKey(
          "internly_profile",
          student.email
        );

        const resumeKey = getStorageKey(
          "internly_resume_name",
          student.email
        );

        const stored = JSON.parse(
          localStorage.getItem(storageKey) || "{}"
        );

        const storedResume = localStorage.getItem(resumeKey) || "";
        const certResponse = await apiRequest(
          "/api/students/me/certifications"
        );

        const availableCertResponse = await apiRequest(
          "/api/certifications"
        );

if (active) {
  setCertifications(certResponse.certifications || []);
  setAvailableCertifications(
    availableCertResponse.certifications || []
  );
}
      
        if (!active) return;
        setCertifications(certResponse.certifications || []);

        setAvailableCertifications(
          availableCertResponse.certifications || []
        );

        setProfile({
          ...initialProfile,
          ...stored,
          name: student.name || "",
          email: student.email || "",
          department: student.department || "",
          graduationYear: student.graduation_year
            ? String(student.graduation_year)
            : "",
        });

        setResumeName(storedResume);
        setLoadError("");
      } catch (error) {
        console.error("Could not load profile:", error);

        if (active) {
          setLoadError(
            error.message || "Could not load your profile."
          );
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [authLoading, user, apiRequest]);

  // Load available skills and the student's saved skills
  async function loadStudentSkills() {
    setSkillsLoading(true);
    setSkillsError("");

    try {
      const [availableResponse, studentResponse] = await Promise.all([
        apiRequest("/api/skills"),
        apiRequest("/api/students/me/skills"),
      ]);

      setAvailableSkills(availableResponse.skills || []);
      setStudentSkills(studentResponse.skills || []);
    } catch (error) {
      console.error("Could not load skills:", error);
      setSkillsError(error.message || "Could not load skills.");
    } finally {
      setSkillsLoading(false);
    }
  }
  // Automatically load skills when the profile is ready
useEffect(() => {
  if (authLoading) return;

  if (!user) {
    setSkillsLoading(false);
    setSkillsError("Please log in to load your skills.");
    return;
  }

  loadStudentSkills();
}, [authLoading, user]);

  // Add a skill
  async function handleAddSkill() {
    if (!newSkillId) {
      setSkillsError("Please select a skill.");
      return;
    }

    setSkillBusy(true);
    setSkillsError("");

    try {
      await apiRequest("/api/students/me/skills", {
        method: "POST",
        body: {
          skill_id: Number(newSkillId),
          proficiency: newProficiency,
        },
      });

      setNewSkillId("");
      setNewProficiency("Beginner");
      await loadStudentSkills();
    } catch (error) {
      console.error("Add skill error:", error);
      setSkillsError(error.message || "Could not add this skill.");
    } finally {
      setSkillBusy(false);
    }
  }

  // Update skill proficiency
  async function handleUpdateProficiency(skillId, proficiency) {
    setSkillBusy(true);
    setSkillsError("");

    try {
      await apiRequest(`/api/students/me/skills/${skillId}`, {
        method: "PUT",
        body: { proficiency },
      });

      await loadStudentSkills();
    } catch (error) {
      console.error("Update skill error:", error);
      setSkillsError(error.message || "Could not update proficiency.");
    } finally {
      setSkillBusy(false);
    }
  }

  // Remove a skill
  async function handleDeleteSkill(skillId) {
    const confirmed = window.confirm(
      "Remove this skill from your profile?"
    );

    if (!confirmed) return;

    setSkillBusy(true);
    setSkillsError("");

    try {
      await apiRequest(`/api/students/me/skills/${skillId}`, {
        method: "DELETE",
      });

      await loadStudentSkills();
    } catch (error) {
      console.error("Delete skill error:", error);
      setSkillsError(error.message || "Could not remove this skill.");
    } finally {
      setSkillBusy(false);
    }
  }
// Add certification
async function handleAddCertification() {
  if (!selectedCertificationId || !certDate) {
    setCertMessage("Please select a certification and issue date.");
    return;
  }

  if (certDate > new Date().toISOString().slice(0, 10)) {
    setCertMessage("Issue date cannot be in the future.");
    return;
  }

  setCertificationBusy(true);
  setCertMessage("");

  try {
    await apiRequest("/api/students/me/certifications", {
      method: "POST",
      body: {
        certification_id: Number(selectedCertificationId),
        issue_date: certDate,
        expiry_date: null,
      },
    });

    const response = await apiRequest(
      "/api/students/me/certifications"
    );

    setCertifications(response.certifications || []);
    setSelectedCertificationId("");
    setCertDate("");
    setCertMessage("Certification added successfully!");
  } catch (error) {
    console.error("Add certification error:", error);
    setCertMessage(
      error.message || "Could not add certification."
    );
  } finally {
    setCertificationBusy(false);
  }
}


// Delete certification
async function handleDeleteCertification(certificationId) {
  const confirmed = window.confirm(
    "Remove this certification from your profile?"
  );

  if (!confirmed) return;

  setCertificationBusy(true);
  setCertMessage("");

  try {
    await apiRequest(
      `/api/students/me/certifications/${certificationId}`,
      {
        method: "DELETE",
      }
    );

    const response = await apiRequest(
      "/api/students/me/certifications"
    );

    setCertifications(response.certifications || []);
    setCertMessage("Certification removed successfully.");
  } catch (error) {
    setCertMessage(
      error.message || "Could not remove certification."
    );
  } finally {
    setCertificationBusy(false);
  }
}

// Handle profile input changes
function handleChange(e) {
  const { name, value } = e.target;
  let newValue = value;

  if (name === "phone") {
    newValue = value.replace(/\D/g, "").slice(0, 10);
  }

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
  setSaveError("");
}

  function validateProfile() {
    const newErrors = {};

    if (!profile.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (
      !/^[\p{L}][\p{L}\s.'-]*$/u.test(profile.name.trim())
    ) {
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

  async function handleSave(e) {
    e.preventDefault();

    const validationErrors = validateProfile();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaved(false);
      return;
    }

    try {
      setSaveError("");
      setSaved(false);

      const response = await apiRequest("/api/students/me", {
        method: "PUT",
        body: {
          name: profile.name.trim(),
          department: profile.department.trim() || null,
          graduation_year: Number(profile.graduationYear),
        },
      });

      const student = response.profile;

      const storageKey = getStorageKey(
        "internly_profile",
        student.email
      );

      const localProfile = {
        phone: profile.phone,
        college: profile.college,
        degree: profile.degree,
        location: profile.location,
        about: profile.about,
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(localProfile)
      );

      setProfile((previous) => ({
        ...previous,
        name: student.name || "",
        email: student.email || "",
        department: student.department || "",
        graduationYear: student.graduation_year
          ? String(student.graduation_year)
          : "",
      }));

      setEditing(false);
      setSaved(true);
    } catch (error) {
      console.error("Profile save error:", error);
      setSaveError(
        error.message || "Could not save your profile. Please try again."
      );
    }
  }

  
async function handleResume(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedExtensions = /\.(pdf|doc|docx)$/i;

  if (!allowedExtensions.test(file.name)) {
    alert("Please upload only PDF, DOC or DOCX files.");
    e.target.value = "";
    return;
  }

  if (file.size === 0) {
    alert("The selected file is empty.");
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Resume size must not exceed 5 MB.");
    e.target.value = "";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiRequest("/api/students/me/resume", {
      method: "POST",
      body: formData,
    });

    setResumeName(response.filename || file.name);

    alert("Resume uploaded successfully!");

  } catch (error) {
    console.error("Resume upload error:", error);
    alert(error.message || "Could not upload resume.");
  } finally {
    e.target.value = "";
  }
}

  const fields = [
    {
      label: "Full Name",
      name: "name",
      icon: User,
      placeholder: "Enter your full name",
      maxLength: 100,
    },
    {
      label: "Email Address",
      name: "email",
      icon: Mail,
      placeholder: "Your registered email",
      type: "email",
      maxLength: 254,
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      placeholder: "10-digit mobile number",
      type: "tel",
      maxLength: 10,
    },
    {
      label: "College / University",
      name: "college",
      icon: GraduationCap,
      placeholder: "Enter your college name",
      maxLength: 150,
    },
    {
      label: "Department",
      name: "department",
      icon: GraduationCap,
      placeholder: "e.g. Computer Science",
      maxLength: 100,
    },
    {
      label: "Graduation Year",
      name: "graduationYear",
      icon: Calendar,
      placeholder: "e.g. 2027",
      maxLength: 4,
    },
    {
      label: "Location",
      name: "location",
      icon: MapPin,
      placeholder: "e.g. Bengaluru, India",
      maxLength: 100,
    },
  ];

  function renderError(name) {
    return errors[name] ? (
      <p className="mt-1 text-xs font-medium text-red-600">
        {errors[name]}
      </p>
    ) : null;
  }

  if (authLoading || profileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc]">
        <p className="font-semibold text-violet-700">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7fc] p-6">
        <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-red-600">
            Could not load your profile
          </h1>
          <p className="mt-3 text-gray-600">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
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
              type="button"
              onClick={() => {
                setEditing(true);
                setSaved(false);
                setSaveError("");
              }}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          ) : (
            <button
              type="button"
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

        {saveError && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Personal Information */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Personal Information</h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {fields.map((field) => {
                const Icon = field.icon;
                const isEmail = field.name === "email";

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
                        disabled={!editing || isEmail}
                        required={field.name !== "department"}
                        maxLength={field.maxLength}
                        inputMode={
                          ["phone", "graduationYear"].includes(field.name)
                            ? "numeric"
                            : undefined
                        }
                        placeholder={field.placeholder}
                        className={`w-full rounded-xl border ${errors[field.name] ? "border-red-400" : "border-gray-200"} bg-white py-3 pl-11 pr-4 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-gray-50 disabled:text-gray-600`}
                      />
                    </div>

                    {isEmail && (
                      <p className="mt-1 text-xs text-gray-400">
                        Your registered email address cannot be changed here.
                      </p>
                    )}

                    {renderError(field.name)}
                  </div>
                );
              })}

              {/* Degree Dropdown */}
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

          {/* PostgreSQL Skills Manager */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Skills</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add skills from Internly's database and select your proficiency level.
            </p>

            {skillsError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                {skillsError}
              </div>
            )}

            {skillsLoading ? (
              <p className="mt-5 text-sm text-gray-500">
                Loading skills...
              </p>
            ) : (
              <>
                {/* Add Skill */}
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <select
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    disabled={skillBusy}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
                  >
                    <option value="">Select a skill</option>

                    {availableSkills
                      .filter(
                        (skill) =>
                          !studentSkills.some(
                            (item) => item.skill_id === skill.skill_id
                          )
                      )
                      .map((skill) => (
                        <option key={skill.skill_id} value={skill.skill_id}>
                          {skill.skill_name}
                        </option>
                      ))}
                  </select>

                  <select
                    value={newProficiency}
                    onChange={(e) => setNewProficiency(e.target.value)}
                    disabled={skillBusy}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
                  >
                    {proficiencyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={skillBusy || !newSkillId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Plus size={18} /> Add Skill
                  </button>
                </div>

                {/* Saved Student Skills */}
                <div className="mt-6 space-y-3">
                  {studentSkills.length === 0 ? (
                    <p className="rounded-xl bg-violet-50 p-4 text-sm text-violet-700">
                      You haven't added any skills yet.
                    </p>
                  ) : (
                    studentSkills.map((skill) => (
                      <div
                        key={skill.skill_id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-4"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {skill.skill_name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Skill ID: {skill.skill_id}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={skill.proficiency}
                            onChange={(e) =>
                              handleUpdateProficiency(
                                skill.skill_id,
                                e.target.value
                              )
                            }
                            disabled={skillBusy}
                            aria-label={`Proficiency for ${skill.skill_name}`}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 disabled:opacity-50"
                          >
                            {proficiencyLevels.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.skill_id)}
                            disabled={skillBusy}
                            aria-label={`Remove ${skill.skill_name}`}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>


          {/* Certifications */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Certifications</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showcase your professional certifications and achievements.
            </p>

            {certMessage && (
              <div className="mt-4 rounded-xl bg-violet-50 p-3 text-sm font-medium text-violet-700">
                {certMessage}
              </div>
            )}
            
            {/* Add Certification */}
<div className="mt-5 grid gap-4 md:grid-cols-2">

  {/* Certification Dropdown */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Certification name
    </label>

    <select
      value={selectedCertificationId}
      onChange={(e) => setSelectedCertificationId(e.target.value)}
      disabled={certificationBusy}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
    >
      <option value="">Select a certification</option>

      {availableCertifications
        .filter(
          (cert) =>
            !certifications.some(
              (item) =>
                Number(item.certification_id) ===
                Number(cert.certification_id)
            )
        )
        .map((cert) => (
          <option
            key={cert.certification_id}
            value={cert.certification_id}
          >
            {cert.certification_name} — {cert.issuing_organization}
          </option>
        ))}
    </select>
  </div>

  {/* Issue Date */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Issue date
    </label>

    <input
      type="date"
      value={certDate}
      max={new Date().toISOString().slice(0, 10)}
      onChange={(e) => setCertDate(e.target.value)}
      disabled={certificationBusy}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
    />
  </div>
</div>

<button
  type="button"
  onClick={handleAddCertification}
  disabled={certificationBusy || !selectedCertificationId || !certDate}
  className="mt-4 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  <Plus size={18} /> Add Certification
</button>

{/* Saved Certifications */}
<div className="mt-6 space-y-3">
  {certifications.length === 0 ? (
    <p className="rounded-xl bg-violet-50 p-4 text-sm text-gray-500">
      No certifications added yet.
    </p>
  ) : (
    certifications.map((cert) => (
      <div
        key={cert.certification_id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-violet-50 p-4"
      >
        <div className="flex items-center gap-3">
          <Award className="text-violet-600" size={22} />

          <div>
            <p className="font-semibold">
              {cert.certification_name}
            </p>

            <p className="text-sm text-gray-500">
              {cert.issuing_organization} · {cert.issue_date}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            handleDeleteCertification(cert.certification_id)
          }
          disabled={certificationBusy}
          className="rounded-lg p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
          aria-label={`Remove ${cert.certification_name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    ))
  )}
</div>
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
              <Save size={18} /> Save Profile
            </button>
          )}
        </form>

        <div className="mt-8 rounded-2xl bg-violet-50 p-5 text-sm text-violet-800">
          <Sparkles className="mr-2 inline" size={18} />
          Keep your profile updated to make a great impression on recruiters!
        </div>
      </section>
    </main>
  );
}
