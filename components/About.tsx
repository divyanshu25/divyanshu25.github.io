import { profile } from "@/data/profile";

export default function About() {
  return (
    <section id="about" className="relative py-32 bg-white overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/20 to-violet-100/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/20 to-blue-100/20 rounded-full filter blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            About Me
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Education Card - Prominent */}
          <div className="lg:col-span-8">
            <div className="relative group bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-3xl hover-lift shadow-2xl overflow-hidden h-full">
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <span className="text-sm font-semibold text-white uppercase tracking-wide">Education</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                  {profile.degree}
                </h3>
                <p className="text-xl text-blue-100">
                  {profile.institution}
                </p>
                <p className="text-lg text-blue-200 mt-2">
                  {profile.specialization}
                </p>
              </div>
            </div>
          </div>

          {/* Languages Card */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-8 rounded-3xl border border-gray-200 shadow-xl hover-lift h-full">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                  Languages
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profile.skills.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2.5 bg-white text-gray-800 rounded-xl text-sm font-bold hover-lift button-press shadow-md border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900">
              Areas of Expertise
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.expertise.map((area, index) => (
              <div
                key={area}
                className="group relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl hover-lift button-press border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
                
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full group-hover:scale-150 transition-transform"></div>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tools & Frameworks */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900">
              Tools & Frameworks
            </h3>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 p-10 rounded-3xl border border-gray-200 shadow-xl">
            <div className="flex flex-wrap gap-3">
              {profile.skills.tools.map((tool, index) => (
                <span
                  key={tool}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold hover-lift button-press shadow-md hover:shadow-lg transition-all ${
                    index % 4 === 0
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : index % 4 === 1
                      ? 'bg-white text-gray-800 border border-gray-300'
                      : index % 4 === 2
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'
                      : 'bg-gradient-to-r from-slate-100 to-gray-100 text-gray-800 border border-gray-300'
                  }`}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
