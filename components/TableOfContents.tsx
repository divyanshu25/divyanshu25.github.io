"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      // Trigger when a heading is in the top ~30% of the viewport (below the fixed nav).
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav>
      <p className="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase mb-3">
        Contents
      </p>
      <ul className="space-y-0.5 border-l border-[var(--border)]">
        {items.map((item) => {
          const active = item.id === activeId;
          const pad =
            item.level === 2 ? "pl-3" : item.level === 3 ? "pl-6" : "pl-9";
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`-ml-px block border-l-2 py-1 ${pad} leading-snug transition-colors ${
                  active
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent hover:text-[var(--text)] hover:border-[var(--text-tertiary)]"
                } ${
                  item.level === 2
                    ? "text-[13px] font-medium"
                    : item.level === 3
                    ? "text-[13px]"
                    : "text-xs"
                } ${!active && item.level === 2 ? "text-[var(--text)]" : ""} ${
                  !active && item.level === 3 ? "text-[var(--text-secondary)]" : ""
                } ${!active && item.level === 4 ? "text-[var(--text-tertiary)]" : ""}`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
