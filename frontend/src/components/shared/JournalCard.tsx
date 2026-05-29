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
  const authorsArr = source.authors || [];
  const authors = authorsArr.length > 0 ? authorsArr.join(', ') : 'Penulis tidak tersedia';
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
  const isSinta = !!sintaIndex;
  const isGaruda = !!garudaIndex;

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
            {source.content_type === 'journal-article' ? (source.publisher || 'Unknown Journal') : source.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {isSinta && (
               <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 tracking-wide border border-blue-200/50 dark:border-blue-800/40">
                 {sintaIndex.tier ? `SINTA ${sintaIndex.tier}` : 'SINTA'}
               </span>
            )}
            {isGaruda && (
               <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 tracking-wide border border-red-200/50 dark:border-red-800/40">
                 GARUDA
               </span>
            )}
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-cloud-canvas dark:bg-stone-gray text-slate-gray dark:text-cloud-canvas tracking-wide">
               Global
             </span>
          </div>
        </div>

        <div className="text-xs text-stone-gray dark:text-silver-mist mb-3 flex flex-wrap gap-1 items-center font-sans">
          {source.content_type === 'journal-article' ? (
            <span>Year: {source.year > 0 ? source.year : 'N/A'}</span>
          ) : (
            <>
              <span className="font-medium text-ink-black dark:text-cloud-canvas">
                {(source.authors || []).length > 0 
                  ? `${(source.authors || []).slice(0, 3).join(', ')}${(source.authors || []).length > 3 ? ' et al.' : ''}`
                  : 'Penulis tidak tersedia'}
              </span>
              <span className="text-silver-mist mx-1">•</span>
              <span>{source.publisher || 'Unknown Journal'}</span>
              <span className="text-silver-mist mx-1">•</span>
              <span>{source.year > 0 ? source.year : 'N/A'}</span>
            </>
          )}
        </div>

        {/* Citation text */}
        {source.content_type !== 'journal-article' && (
          <div className="text-[11px] text-slate-gray dark:text-silver-mist/80 bg-cloud-canvas/30 dark:bg-stone-gray/30 p-2.5 rounded-lg mb-4 font-sans leading-relaxed border border-cloud-canvas/50 dark:border-stone-gray/50">
            <span className="font-semibold text-ink-black dark:text-cloud-canvas mb-1 block">{citationStyle} Citation:</span>
            {getCitation(source, citationStyle)}
          </div>
        )}

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
