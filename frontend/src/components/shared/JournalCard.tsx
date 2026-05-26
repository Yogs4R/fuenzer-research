import type { AcademicSource } from '../../types/research';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface JournalCardProps {
  source: AcademicSource;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  citationStyle?: string;
}

// Basic citation generator
function getCitation(source: AcademicSource, style: string) {
  const authors = source.authors.join(', ');
  const year = source.year > 0 ? source.year : 'n.d.';
  const title = source.title;
  const pub = source.publisher || 'Unknown Publisher';
  
  switch(style) {
    case 'APA':
      return `${authors} (${year}). ${title}. ${pub}.`;
    case 'Harvard':
      return `${authors}, ${year}. ${title}. ${pub}.`;
    case 'MLA':
      return `${authors}. "${title}." ${pub}, ${year}.`;
    case 'Chicago':
      return `${authors}. "${title}." ${pub} (${year}).`;
    case 'Vancouver':
      return `${authors}. ${title}. ${pub}. ${year};`;
    default:
      return `${authors} (${year}). ${title}. ${pub}.`;
  }
}

export function JournalCard({ 
  source, 
  isSelected = false, 
  onToggleSelect,
  isBookmarked = false,
  onToggleBookmark,
  citationStyle = 'APA'
}: JournalCardProps) {
  const sintaIndex = source.indexes?.find((idx) => idx.provider.toLowerCase() === 'sinta');
  const garudaIndex = source.indexes?.find((idx) => idx.provider.toLowerCase() === 'garuda');
  const displayTier = sintaIndex?.tier || garudaIndex?.tier;
  const isSinta = !!sintaIndex;

  const getTierBadge = (tier: string | undefined) => {
    if (!tier) return null;
    let text = 'IDX';
    if (tier.includes('SINTA 1')) text = 'S1';
    else if (tier.includes('SINTA 2')) text = 'S2';
    else if (tier.includes('SINTA 3')) text = 'S3';
    else if (tier.includes('SINTA 4')) text = 'S4';
    else if (tier.includes('SINTA 5')) text = 'S5';
    else if (tier.includes('SINTA 6')) text = 'S6';
    else if (tier.includes('Garuda')) text = 'GARUDA';
    else if (tier === '1') text = 'S1';
    else if (tier === '2') text = 'S2';
    else if (tier === '3') text = 'S3';
    else if (tier === '4') text = 'S4';
    else if (tier === '5') text = 'S5';
    else if (tier === '6') text = 'S6';
    
    return (
       <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-fuenzer-teal text-white tracking-wide">
         {text}
       </span>
    );
  };

  return (
    <div className={`group flex bg-paper-white dark:bg-ink-black rounded-xl shadow-sm hover:shadow-xl dark:hover:shadow-2xl border transition-all ${isSelected ? 'border-fuenzer-teal ring-1 ring-fuenzer-teal' : 'border-cloud-canvas dark:border-stone-gray'}`}>
      
      {/* Checkbox column */}
      {onToggleSelect && (
        <div className="pt-6 pl-4 pr-1 flex flex-col items-center">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-cloud-canvas text-fuenzer-teal focus:ring-fuenzer-teal focus:ring-offset-0 cursor-pointer"
          />
        </div>
      )}

      {/* Main Content */}
      <div className={`p-5 flex-1 flex flex-col min-w-0 ${onToggleSelect ? 'pl-3' : ''}`}>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-ink-black dark:text-paper-white leading-snug line-clamp-2 font-serif">
            {source.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {isSinta && (
               <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF9800]/10 text-[#F57C00] tracking-wide border border-[#FF9800]/20">
                 SINTA
               </span>
            )}
            {getTierBadge(displayTier)}
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-cloud-canvas dark:bg-stone-gray text-slate-gray dark:text-cloud-canvas tracking-wide">
               Global
            </span>
          </div>
        </div>

        <div className="text-xs text-stone-gray dark:text-silver-mist mb-3 flex flex-wrap gap-1 items-center font-sans">
           <span className="font-medium text-ink-black dark:text-cloud-canvas">
             {source.authors.slice(0, 3).join(', ')}
             {source.authors.length > 3 && ` et al.`}
           </span>
           <span className="text-silver-mist mx-1">•</span>
           <span>{source.publisher || 'Unknown Journal'}</span>
           <span className="text-silver-mist mx-1">•</span>
           <span>{source.year > 0 ? source.year : 'N/A'}</span>
        </div>

        {/* Citation text */}
        <div className="text-[11px] text-slate-gray dark:text-silver-mist/80 bg-cloud-canvas/30 dark:bg-stone-gray/30 p-2.5 rounded-lg mb-4 font-sans leading-relaxed border border-cloud-canvas/50 dark:border-stone-gray/50">
          <span className="font-semibold text-ink-black dark:text-cloud-canvas mb-1 block">{citationStyle} Citation:</span>
          {getCitation(source, citationStyle)}
        </div>

        <div className="mt-auto flex justify-between items-end font-sans">
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-fuenzer-teal dark:text-fuenzer-teal hover:text-fuenzer-teal-dark dark:hover:text-code-blue hover:underline truncate max-w-[250px]"
            >
              DOI: {source.url.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}
            </a>
          ) : (
            <div />
          )}

          {/* Bookmark Button moved to bottom right */}
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold border ${
                isBookmarked
                  ? 'text-fuenzer-teal bg-fuenzer-teal/10 border-fuenzer-teal/20'
                  : 'text-slate-gray dark:text-silver-mist hover:text-fuenzer-teal hover:bg-fuenzer-teal/10 border-cloud-canvas dark:border-stone-gray hover:border-fuenzer-teal/20'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
