import type { LoadingPhase } from '../../types/research';
import { BookOpen, Filter, Sparkles } from 'lucide-react';

interface NarrativeSkeletonLoaderProps {
  phase: LoadingPhase;
}

const phaseConfig: Record<
  string,
  { icon: React.ReactNode; message: string; subtext: string }
> = {
  searching: {
    icon: <BookOpen className="w-5 h-5 text-fuenzer-teal" />,
    message: 'Searching OpenAlex...',
    subtext: 'Retrieving the latest academic references',
  },
  filtering: {
    icon: <Filter className="w-5 h-5 text-fuenzer-teal" />,
    message: 'Filtering localized indices...',
    subtext: 'Verifying SINTA and Garuda accreditation',
  },
  synthesizing: {
    icon: <Sparkles className="w-5 h-5 text-fuenzer-teal" />,
    message: 'Synthesizing via AI...',
    subtext: 'Extracting and summarizing core findings',
  },
};

export function NarrativeSkeletonLoader({ phase }: NarrativeSkeletonLoaderProps) {
  const config = phaseConfig[phase];

  if (!config) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in duration-700">
      {/* Elegant spinning icon */}
      <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cloud-canvas/30 dark:bg-stone-gray/30 shadow-inner">
        <div className="absolute inset-0 rounded-full border-2 border-fuenzer-teal/20 border-t-fuenzer-teal animate-spin" />
        {config.icon}
      </div>

      {/* Narrative text */}
      <div className="text-center space-y-2">
        <p className="font-serif font-bold text-ink-black dark:text-cloud-canvas text-lg flex items-center gap-2 justify-center">
          {config.message}
        </p>
        <p className="text-slate-gray dark:text-silver-mist text-xs tracking-wide uppercase font-semibold">{config.subtext}</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-cloud-canvas/30 dark:bg-stone-gray/30 overflow-hidden mt-4">
        <div
          className="h-full bg-fuenzer-teal animate-progress"
          style={{
            width: phase === 'searching' ? '33%' : phase === 'filtering' ? '66%' : '90%',
            transition: 'width 1.5s ease-in-out',
          }}
        />
      </div>

      {/* Skeleton lines */}
      <div className="w-full max-w-sm space-y-4 pt-8 opacity-50">
        <div className="h-2.5 bg-cloud-canvas dark:bg-stone-gray/40 w-full" />
        <div className="h-2.5 bg-cloud-canvas dark:bg-stone-gray/40 w-4/5 animate-pulse delay-75" />
        <div className="h-2.5 bg-cloud-canvas dark:bg-stone-gray/40 w-3/5 animate-pulse delay-150" />
      </div>
    </div>
  );
}
