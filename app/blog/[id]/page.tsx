import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { readFileSync } from "fs";
import { join } from "path";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { posts } from "@/data/posts";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TableOfContents from "@/components/TableOfContents";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

export async function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id,
  }));
}

// Build a table of contents from the h2/h3 headings, generating anchor slugs that
// match what rehype-slug produces (both use github-slugger over the heading text).
function buildToc(markdown: string): { level: number; text: string; id: string }[] {
  const slugger = new GithubSlugger();
  const toc: { level: number; text: string; id: string }[] = [];
  let inCode = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const m = line.match(/^(#{2,4})\s+(.*)$/);
    if (!m) continue;

    // Strip markdown emphasis/code markers so the text matches the parsed heading.
    const text = m[2].trim().replace(/[*_`]/g, "");
    toc.push({ level: m[1].length, text, id: slugger.slug(text) });
  }
  return toc;
}

// remark-math wants block `$$` delimiters on their own lines. The source markdown
// often has math inline with the delimiters (single-line `$$...$$`, multi-line
// blocks, and blocks inside blockquotes). Normalize all of them to isolated
// fence lines while preserving any blockquote `>` prefix, and skip code fences.
function normalizeBlockMath(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Toggle on fenced code blocks (``` or ~~~), and pass their contents through verbatim.
    if (/^\s*(?:>\s*)*(?:```|~~~)/.test(line)) {
      inCode = !inCode;
      out.push(line);
      continue;
    }
    if (inCode) {
      out.push(line);
      continue;
    }

    const prefix = line.match(/^(\s*(?:>\s*)+)/)?.[1] ?? "";
    const body = line.slice(prefix.length);

    // Single-line full block: `$$ ... $$` occupying the whole (possibly quoted) line.
    const single = body.match(/^\$\$(.+)\$\$\s*$/);
    if (single) {
      out.push(`${prefix}$$`);
      out.push(`${prefix}${single[1].trim()}`);
      out.push(`${prefix}$$`);
      continue;
    }

    // Opening of a multi-line block: line begins with `$$` and doesn't close on itself.
    if (body.startsWith("$$") && !body.slice(2).includes("$$")) {
      out.push(`${prefix}$$`);
      const firstInner = body.slice(2).trim();
      if (firstInner) out.push(`${prefix}${firstInner}`);
      i++;
      while (i < lines.length) {
        const l = lines[i];
        const p2 = l.match(/^(\s*(?:>\s*)+)/)?.[1] ?? "";
        const c2 = l.slice(p2.length);
        if (c2.trimEnd().endsWith("$$")) {
          const lastInner = c2.trimEnd().slice(0, -2).trim();
          if (lastInner) out.push(`${prefix}${lastInner}`);
          out.push(`${prefix}$$`);
          break;
        }
        out.push(`${prefix}${c2.trim()}`);
        i++;
      }
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

export default async function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const raw = post.contentFile
    ? readFileSync(join(process.cwd(), post.contentFile), "utf-8")
    : post.content;

  const content = normalizeBlockMath(raw);
  const toc = buildToc(raw);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navigation />

      <main className="flex-grow pt-20 sm:pt-24 pb-12 sm:pb-16">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/#blog"
            className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent-hover)] mb-8 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[var(--bg-warm)] text-[var(--text-secondary)] text-sm font-medium rounded-full border border-[var(--border)]">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)] mb-6">
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              {post.authors.length > 0 && (
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.authors.join(", ")}
                </div>
              )}
            </div>

            {post.heroImage && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)] mb-6">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover"
                />
              </div>
            )}

            <div className="bg-[var(--accent-bg)] p-5 rounded-xl border border-[var(--accent-border)]">
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">{post.summary}</p>
            </div>
          </div>

          {toc.length > 2 ? (
            <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
              {/* Sticky sidebar TOC (becomes a top block on mobile) */}
              <aside className="mb-10 lg:mb-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <TableOfContents items={toc} />
              </aside>

              {/* Body */}
              <div className="blog-content min-w-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeSlug, rehypeKatex, rehypeHighlight]}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="blog-content max-w-3xl">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeKatex, rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
