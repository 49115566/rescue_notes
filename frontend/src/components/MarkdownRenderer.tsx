import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './markdown.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Configure marked for GitHub-flavored markdown and sensible defaults
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const html = React.useMemo(() => {
    const raw = marked.parse(content ?? '');
    // Sanitize to prevent XSS since notes are user-provided
    const clean = DOMPurify.sanitize(raw as string, { USE_PROFILES: { html: true } });
    return clean;
  }, [content]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const anchors = Array.from(el.querySelectorAll('a')) as HTMLAnchorElement[];
    anchors.forEach(a => {
      try {
        const url = new URL(a.getAttribute('href') ?? '', window.location.href);
        const isExternal = url.origin !== window.location.origin;
        if (isExternal) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      } catch {
        // Ignore invalid URLs
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}