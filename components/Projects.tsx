import Link from "next/link";
import { projects } from "@/data/projects";

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/20 to-blue-200/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full filter blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Featured Projects
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4"></div>
          <p className="text-xl text-gray-600 max-w-3xl">
            Explore my work in machine learning, computer vision, and deep learning
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-fr">
          {projects.map((project, index) => {
            const isLarge = index === 0;
            const isMedium = index === 1 || index === 2;
            
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`group relative bg-white rounded-3xl hover-lift overflow-hidden border border-gray-200 shadow-xl hover:shadow-2xl transition-all ${
                  isLarge ? 'md:col-span-4 md:row-span-2' : 
                  isMedium ? 'md:col-span-3' : 
                  'md:col-span-2'
                }`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition-all duration-500"></div>
                
                <div className={`relative h-full flex flex-col ${isLarge ? 'p-10' : 'p-8'}`}>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, isLarge ? 4 : 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Title */}
                  <h3 className={`${isLarge ? 'text-4xl mb-5' : isMedium ? 'text-2xl mb-4' : 'text-xl mb-3'} font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight`}>
                    {project.title}
                  </h3>
                  
                  {/* Summary */}
                  <p className={`text-gray-600 leading-relaxed mb-6 flex-grow ${isLarge ? 'text-lg line-clamp-4' : 'text-sm line-clamp-3'}`}>
                    {project.summary}
                  </p>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(project.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-blue-600 font-bold text-sm group-hover:gap-2 transition-all">
                      <span>View Project</span>
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
