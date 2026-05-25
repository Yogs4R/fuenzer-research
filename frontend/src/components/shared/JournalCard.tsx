import type { AcademicSource } from '../../types/research';

interface JournalCardProps {
  source: AcademicSource;
}

export function JournalCard({ source }: JournalCardProps) {
  const sintaIndex = source.indexes?.find((idx) => idx.provider === 'sinta');
  const garudaIndex = source.indexes?.find((idx) => idx.provider === 'garuda');
  const displayTier = sintaIndex?.tier || garudaIndex?.tier;

  const getTierBadge = (tier: string | undefined) => {
    if (!tier) return null;
    let text = 'IDX';
    if (tier.includes('SINTA 1')) text = 'S1';
    else if (tier.includes('SINTA 2')) text = 'S2';
    else if (tier.includes('SINTA 3')) text = 'S3';
    else if (tier.includes('SINTA 4')) text = 'S4';
    else if (tier.includes('Garuda')) text = 'GARUDA';
    
    return (
       <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-fuenzer-teal text-white tracking-wide">
         {text}
       </span>
    );
  };

  return (
    <div className="group bg-paper-white dark:bg-ink-black rounded-xl p-5 shadow-sm hover:shadow-xl dark:hover:shadow-2xl border border-cloud-canvas dark:border-stone-gray transition-all">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="text-lg font-bold text-ink-black dark:text-paper-white leading-snug line-clamp-2 font-serif">
          {source.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {getTierBadge(displayTier)}
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-cloud-canvas dark:bg-stone-gray text-slate-gray dark:text-cloud-canvas tracking-wide">
             Global
          </span>
        </div>
      </div>

      <div className="text-xs text-stone-gray dark:text-silver-mist mb-1 flex flex-wrap gap-1 items-center font-sans">
         <span className="font-medium text-ink-black dark:text-cloud-canvas">
           {source.authors.slice(0, 3).join(', ')}
           {source.authors.length > 3 && ` et al.`}
         </span>
         <span className="text-silver-mist mx-1">•</span>
         <span>{source.publisher || 'Unknown Journal'}</span>
         <span className="text-silver-mist mx-1">•</span>
         <span>{source.year > 0 ? source.year : 'N/A'}</span>
      </div>

      {source.url && (
        <div className="mt-2 font-sans">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-fuenzer-teal dark:text-fuenzer-teal hover:text-fuenzer-teal-dark dark:hover:text-code-blue hover:underline"
          >
            DOI: {source.url.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}
          </a>
        </div>
      )}
    </div>
  );
}
