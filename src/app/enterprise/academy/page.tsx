"use client";

const courses = [
  { id: 1, title: "Property Maintenance Fundamentals", level: "Beginner", duration: "4 hours", enrolled: 124 },
  { id: 2, title: "Advanced Landscaping Techniques", level: "Advanced", duration: "8 hours", enrolled: 45 },
  { id: 3, title: "POPIA & Compliance Training", level: "Mandatory", duration: "2 hours", enrolled: 48 },
  { id: 4, title: "Smart Home Installation", level: "Intermediate", duration: "6 hours", enrolled: 28 },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Garlaws Academy</h1>
          <p className="text-xl text-[#45a29e]">Training & certification programs for staff & partners</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">245</div>
            <div className="text-[#45a29e]">Total Enrolled</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">12</div>
            <div className="text-[#45a29e]">Courses Available</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">189</div>
            <div className="text-[#45a29e]">Certificates Issued</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">92%</div>
            <div className="text-[#45a29e]">Completion Rate</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Available Courses</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30 hover:border-[#45a29e] transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{course.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${course.level === "Mandatory" ? "bg-red-900 text-red-400" : course.level === "Advanced" ? "bg-purple-900 text-purple-400" : "bg-blue-900 text-blue-400"}`}>
                  {course.level}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>⏱️ {course.duration}</span>
                <span>👥 {course.enrolled} enrolled</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Certifications</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-bold">Property Care Specialist</div>
              <div className="text-sm text-gray-400">Level 1 Certified</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🔧</div>
              <div className="font-bold">Smart Installer</div>
              <div className="text-sm text-gray-400">IoT Certified</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🌿</div>
              <div className="font-bold">Landscape Professional</div>
              <div className="text-sm text-gray-400">Horticulture Cert</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}