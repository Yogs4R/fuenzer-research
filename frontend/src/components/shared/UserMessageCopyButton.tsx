import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface UserMessageCopyButtonProps {
  text: string;
}

export function UserMessageCopyButton({ text }: UserMessageCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-[9px] font-sans text-slate-gray/70 dark:text-silver-mist/50 hover:text-ink-black dark:hover:text-paper-white transition-colors flex items-center gap-1 select-none pr-1 mt-0.5 cursor-pointer animate-in fade-in"
      title="Copy message"
    >
      {copied ? (
        <>
          <Check className="w-2.5 h-2.5 text-emerald-500" />
          <span className="text-emerald-500 font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-2.5 h-2.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
