import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
import type { AcademicSource } from '../types/research';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import {
  FileText,
  Copy,
  Check,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type CitationStyle = 'APA' | 'Harvard' | 'MLA' | 'Chicago' | 'Vancouver';
const CITATION_STYLES: CitationStyle[] = ['APA', 'Harvard', 'MLA', 'Chicago', 'Vancouver'];

// Citation formatter
function getFormattedCitation(source: AcademicSource, style: CitationStyle) {
  const authors = source.authors.join(', ');
  const year = source.year > 0 ? source.year : 'n.d.';
  const title = source.title;
  const pub = source.publisher || 'Unknown Publisher';

  switch (style) {
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

// BibTeX generator helper
function generateBibTeX(sources: AcademicSource[]): string {
  return sources
    .map((s, idx) => {
      const citeKey = `source_${idx + 1}`;
      const authors = s.authors.join(' and ');
      return `@article{${citeKey},\n  author = {${authors}},\n  title = {${s.title}},\n  journal = {${s.publisher || 'Unknown Journal'}},\n  year = {${s.year > 0 ? s.year : 'n.d.'}}\n}`;
    })
    .join('\n\n');
}

export function CitationsPage() {
  const navigate = useNavigate();
  const { bookmarkedSources } = useResearchStore();
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { language } = useUiStore();
  const t = language === 'en' ? en.citations : id.citations;

  // Copy single citation to clipboard
  const handleCopySingle = async (source: AcademicSource) => {
    const text = getFormattedCitation(source, selectedStyle);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(source.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Copy all citations to clipboard
  const handleCopyAll = async () => {
    if (bookmarkedSources.length === 0) return;
    const allText = bookmarkedSources
      .map((s) => getFormattedCitation(s, selectedStyle))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Download BibTeX file
  const handleDownloadBibTeX = () => {
    if (bookmarkedSources.length === 0) return;
    const bibText = generateBibTeX(bookmarkedSources);
    const blob = new Blob([bibText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fuenzer_citations.bib';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Hero header */}
      <section className="bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray py-12 px-6 md:px-8 transition-colors shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fuenzer-teal">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase font-sans">{t.badge}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink-black dark:text-paper-white leading-tight">
              {t.title}
            </h1>
            <p className="text-sm font-sans text-slate-gray dark:text-silver-mist max-w-xl">
              {t.desc}
            </p>
          </div>

          {/* Action buttons */}
          {bookmarkedSources.length > 0 && (
            <div className="flex items-center gap-3 font-sans shrink-0">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? t.copiedAll : t.copyAll}
              </button>
              <button
                onClick={handleDownloadBibTeX}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black text-slate-gray dark:text-cloud-canvas text-xs font-bold hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-silver-mist" />
                {t.exportBibtex}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-10 font-sans flex flex-col">
        {bookmarkedSources.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-fuenzer-teal/10 flex items-center justify-center shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-fuenzer-teal/20 to-transparent scale-0 group-hover:scale-100 transition-transform duration-500 rounded-3xl" />
              <FileText className="w-10 h-10 text-fuenzer-teal relative z-10" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-ink-black dark:text-paper-white">
                {t.emptyTitle}
              </h2>
              <p className="text-xs text-slate-gray dark:text-silver-mist leading-relaxed font-sans">
                {t.emptyDesc}
              </p>
            </div>
            <button
              onClick={() => navigate('/playground')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer font-sans"
            >
              {t.searchButton}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Citations formatter area */
          <div className="space-y-8 flex-1">
            {/* Style switcher row */}
            <div className="flex items-center justify-between pb-3 border-b border-cloud-canvas dark:border-stone-gray">
              <div className="flex items-center gap-2 flex-wrap">
                {CITATION_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedStyle === style
                        ? 'bg-fuenzer-teal/10 text-fuenzer-teal border-fuenzer-teal/30 shadow-xs'
                        : 'border-transparent text-slate-gray dark:text-silver-mist hover:text-fuenzer-teal hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50'
                    }`}
                  >
                    {style} Format
                  </button>
                ))}
              </div>
            </div>

            {/* List of generated citations */}
            <div className="space-y-4">
              {bookmarkedSources.map((source) => {
                const text = getFormattedCitation(source, selectedStyle);
                const isCopied = copiedId === source.id;
                return (
                  <div
                    key={source.id}
                    className="p-5 bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray hover:border-silver-mist/50 dark:hover:border-stone-gray/70 rounded-2xl shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <p className="text-xs font-bold text-fuenzer-teal-dark dark:text-fuenzer-teal uppercase tracking-wider font-sans">
                        {source.title}
                      </p>
                      <p className="text-[13px] text-ink-black dark:text-cloud-canvas leading-relaxed select-all">
                        {text}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopySingle(source)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ml-auto border cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                          : 'bg-cloud-canvas/30 hover:bg-cloud-canvas/70 dark:bg-stone-gray/20 dark:hover:bg-stone-gray/40 border-cloud-canvas dark:border-stone-gray text-slate-gray dark:text-silver-mist'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? t.copiedSingle : t.copySingle}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
