import type { LoadingPhase } from '../../types/research';
import { BookOpen, Filter, Sparkles, Loader2 } from 'lucide-react';

interface NarrativeSkeletonLoaderProps {
  phase: LoadingPhase;
}

const phaseConfig: Record<
  string,
  { icon: React.ReactNode; message: string; subtext: string }
> = {
  searching: {
    icon: <BookOpen className="w-6 h-6 text-cyan-500 animate-pulse" />,
    message: 'Mencari di Semantic Scholar...',
    subtext: 'Mengambil referensi akademis terbaru untuk topik Anda',
  },
  filtering: {
    icon: <Filter className="w-6 h-6 text-blue-500 animate-pulse" />,
    message: 'Memfilter dataset jurnal lokal...',
    subtext: 'Memeriksa indeksasi SINTA dan Garuda',
  },
  synthesizing: {
    icon: <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />,
    message: 'Menganalisis abstrak dengan AI...',
    subtext: 'Fuenzer Synthesis Engine sedang merangkum temuan',
  },
};

export function NarrativeSkeletonLoader({ phase }: NarrativeSkeletonLoaderProps) {
  const config = phaseConfig[phase];

  if (!config) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500">
      {/* Animated icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-cyan-400/20 to-blue-500/20 animate-ping" />
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md border border-slate-100">
          {config.icon}
        </div>
      </div>

      {/* Narrative text */}
      <div className="text-center space-y-1">
        <p className="text-[#0F172A] font-medium text-base flex items-center gap-2 justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          {config.message}
        </p>
        <p className="text-[#64748B] text-sm">{config.subtext}</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-600 animate-progress"
          style={{
            width: phase === 'searching' ? '33%' : phase === 'filtering' ? '66%' : '90%',
            transition: 'width 1.5s ease-in-out',
          }}
        />
      </div>

      {/* Skeleton lines */}
      <div className="w-full max-w-sm space-y-3 pt-4">
        <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-full w-4/5 animate-pulse delay-75" />
        <div className="h-3 bg-slate-100 rounded-full w-3/5 animate-pulse delay-150" />
      </div>
    </div>
  );
}
