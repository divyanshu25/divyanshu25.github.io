import Link from "next/link";
import { posts } from "@/data/posts";

export default function Blog() {
  return (
    <section id="blog" className="relative py-20 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/20 to-violet-200/20 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full filter blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Blog
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3"></div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Technical insights, tutorials, and deep dives into machine learning and software engineering
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => {
            const isFeatured = index === 0;
            
            return (
              <Link
                key={post.id}
                href={post.url || `/blog/${post.id}`}
                target={post.url ? "_blank" : undefined}
                rel={post.url ? "noopener noreferrer" : undefined}
                className={`group relative bg-white rounded-3xl hover-lift overflow-hidden border border-gray-200 shadow-xl hover:shadow-2xl transition-all ${
                  isFeatured ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-violet-600/0 group-hover:from-blue-600/5 group-hover:to-violet-600/5 transition-all duration-500"></div>
                
                <div className={`relative h-full flex flex-col ${isFeatured ? 'p-8' : 'p-6'}`}>
                  {/* Date badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-blue-700">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`${isFeatured ? 'text-3xl mb-4' : 'text-xl mb-3'} font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3`}>
                    {post.title}
                  </h3>
                  
                  {/* Summary */}
                  <p className={`text-gray-600 leading-relaxed mb-4 flex-grow ${isFeatured ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'}`}>
                    {post.summary}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, isFeatured ? 4 : 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Read more link */}
                  <div className="flex items-center text-blue-600 font-bold pt-3 border-t border-gray-100">
                    <span>Read Article</span>
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
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
