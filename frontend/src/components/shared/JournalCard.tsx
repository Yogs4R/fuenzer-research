import type { AcademicSource } from '../../types/research';
import { ExternalLink, BookOpen, Users, Calendar } from 'lucide-react';

interface JournalCardProps {
  source: AcademicSource;
}

export function JournalCard({ source }: JournalCardProps) {
  const sintaIndex = source.indexes?.find((idx) => idx.provider === 'sinta');
  const garudaIndex = source.indexes?.find((idx) => idx.provider === 'garuda');
  const displayTier = sintaIndex?.tier || garudaIndex?.tier;

  const getTierColor = (tier: string | undefined): string => {
    if (!tier) return 'bg-slate-100 text-slate-600';
    if (tier.includes('SINTA 1')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (tier.includes('SINTA 2')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (tier.includes('SINTA 3')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (tier.includes('SINTA 4')) return 'bg-orange-50 text-orange-700 border border-orange-200';
    if (tier.includes('Garuda')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  return (
    <div className="group bg-white rounded-lg border border-slate-200 p-5 hover:shadow-card hover:border-t-2 hover:border-t-cyan-500 transition-all duration-300">
      {/* Title */}
      <h3 className="font-serif text-[#0F172A] font-semibold text-base leading-snug mb-2 line-clamp-2">
        {source.title}
      </h3>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B] mb-3">
        {/* Authors */}
        {source.authors.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="truncate max-w-[200px]">
              {source.authors.slice(0, 2).join(', ')}
              {source.authors.length > 2 && ` +${source.authors.length - 2}`}
            </span>
          </span>
        )}

        {/* Year */}
        {source.year > 0 && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            {source.year}
          </span>
        )}

        {/* Publisher */}
        {source.publisher && (
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="truncate max-w-[180px]">{source.publisher}</span>
          </span>
        )}
      </div>

      {/* Footer: badges and link */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* SINTA / Garuda badge */}
          {displayTier && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getTierColor(displayTier)}`}
            >
              {displayTier}
            </span>
          )}
        </div>

        {/* External link */}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[#64748B] hover:text-cyan-600 transition-colors border border-slate-200 rounded-md px-2.5 py-1 hover:border-slate-300 hover:bg-cyan-50/50"
          >
            <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            Open
          </a>
        )}
      </div>
    </div>
  );
}
