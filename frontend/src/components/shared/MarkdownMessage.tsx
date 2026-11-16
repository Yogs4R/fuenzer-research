import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({
  content,
  className = 'prose prose-xs prose-slate dark:prose-invert max-w-none text-ink-black dark:text-slate-100 leading-relaxed text-xs [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>ul>li]:mb-1 [&>ol>li]:mb-1',
}: MarkdownMessageProps) {
  const html = DOMPurify.sanitize(marked.parse(content, { async: false }) as string);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
