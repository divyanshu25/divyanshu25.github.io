import { profile } from "@/data/profile";

export default function Publications() {
  return (
    <section id="publications" className="relative py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/20 to-violet-100/20 rounded-full filter blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <div className="mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Publications
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        <div className="relative">
          {/* Apple-style Timeline Design - Clean & Minimal */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0">
            {/* Single clean vertical line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-gray-200"></div>
          </div>
          
          <div className="space-y-12">
          {profile.publications.map((pub, index) => (
            <div key={index} className="relative">
              {/* Clean timeline node */}
              <div className="hidden md:flex absolute left-0 top-6 items-center">
                {/* Simple solid circle */}
                <div className="relative z-10 w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-sm"></div>
                
                {/* Minimal connector line */}
                <div className="w-6 h-[1px] bg-gray-200 ml-[-1px]"></div>
              </div>

              {/* Publication card with offset for timeline */}
              <div className="md:ml-14">
                <div className="group relative bg-white p-8 sm:p-10 rounded-3xl hover-lift shadow-xl hover:shadow-2xl border border-gray-200 hover:border-blue-300 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300"></div>
                  
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {pub.year}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {pub.venue}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {pub.title}
                    </h3>

                    <p className="text-base text-gray-600 mb-4 font-medium">
                      {pub.authors}
                    </p>

                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      {pub.abstract}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>

                      <div className="flex flex-wrap gap-2">
                        {pub.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
