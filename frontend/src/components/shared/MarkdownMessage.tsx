import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { toSafeHttpUrl } from '../../utils/validation';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('/')) {
      const safeHref = toSafeHttpUrl(href);
      if (safeHref) {
        node.setAttribute('href', safeHref);
      } else {
        node.removeAttribute('href');
      }
    }
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({
  content,
  className = 'prose prose-xs prose-slate dark:prose-invert max-w-none text-ink-black dark:text-slate-100 leading-relaxed text-xs [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2 [&>ul>li]:mb-1 [&>ol>li]:mb-1',
}: MarkdownMessageProps) {
  const rawHtml = marked.parse(content, { async: false }) as string;
  const html = DOMPurify.sanitize(rawHtml, {
    ALLOWED_URI_REGEXP: /^(?:https?:\/\/|\/|#)/i,
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
