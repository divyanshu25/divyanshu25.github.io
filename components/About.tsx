import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="relative py-14 bg-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            About Me
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Education — compact */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Education</h3>
            <div className="space-y-3">
              {profile.education.map((edu, index) => (
                <div key={index} className={index > 0 ? "pt-3 border-t border-gray-100" : ""}>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{edu.degree}</p>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  {edu.specialization && (
                    <p className="text-xs text-gray-500 mt-0.5">{edu.specialization}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expertise — simple tags */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-100"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Languages — merged */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Tools & Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200"
                >
                  {tool}
                </span>
              ))}
              {profile.skills.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
