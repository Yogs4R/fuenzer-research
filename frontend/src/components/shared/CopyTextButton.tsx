import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyTextButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyTextButton({
  text,
  label = 'Copy text',
  className = 'p-1.5 rounded-lg hover:bg-cloud-canvas dark:hover:bg-stone-gray/50 text-slate-gray hover:text-ink-black dark:text-silver-mist dark:hover:text-paper-white transition-all cursor-pointer',
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write unavailable
    }
  };

  return (
    <button type="button" onClick={handleCopy} className={className} title={label} aria-label={label}>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
