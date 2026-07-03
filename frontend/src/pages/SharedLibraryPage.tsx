import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useResearchStore } from '../store/researchStore';
import { useSEO } from '../hooks/useSEO';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { JournalCard } from '../components/shared/JournalCard';
import { SaveToLibraryModal } from '../components/shared/SaveToLibraryModal';
import { loadPublicLibrary, type Library } from '../lib/firestore';
import type { AcademicSource } from '../types/research';
import { getFormattedCitation, type CitationStyle, CITATION_STYLES } from '../utils/citationFormatter';
import { generateBibTeX, generateRIS } from '../utils/citationExporter';
import { Dropdown, DropdownItem } from '../components/shared/Dropdown';
import { Globe, Lock, BookOpen, Download, Copy, Check, ChevronDown, Search } from 'lucide-react';
import { en } from '../locales/en';
import { id } from '../locales/id';

export function SharedLibraryPage() {
  const { hostUserId, libraryId } = useParams<{ hostUserId: string; libraryId: string }>();
  const navigate = useNavigate();
  
  const user = useAuthStore((state) => state.user);
  const { language } = useUiStore();
  const isLanguageId = language === 'id';
  const t = isLanguageId ? id.library : en.library;
  const tCit = isLanguageId ? id.citations : en.citations;

  const { isBookmarkedInAnyLibrary } = useResearchStore();

  const [library, setLibrary] = useState<Library | null>(null);
  const [bookmarks, setBookmarks] = useState<AcademicSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const contentTypeFilter = 'All';
  const sort: string = 'relevance';
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [copiedAll, setCopiedAll] = useState(false);
  const [bookmarkModalSource, setBookmarkModalSource] = useState<AcademicSource | null>(null);

  useSEO({
    canonical: window.location.href,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, navigate]);

  // Load shared library — only after user is confirmed authenticated
  useEffect(() => {
    if (!hostUserId || !libraryId || !user) return;
    setLoading(true);
    setError(null);

    loadPublicLibrary(hostUserId, libraryId)
      .then(({ library, bookmarks }) => {
        setLibrary(library);
        setBookmarks(bookmarks);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat pustaka.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hostUserId, libraryId, user]);

  // Filter and Sort Pipeline
  const filteredBookmarks = bookmarks
    .filter((s) => {
      if (contentTypeFilter !== 'All') {
        const ct = s.content_type?.toLowerCase() || '';
        switch (contentTypeFilter) {
          case 'Articles': return ct === 'article' || ct === 'journal-article';
          case 'Journals': return ct === 'journal' || ct === 'journal-article';
          case 'Books': return ct === 'book' || ct === 'book-chapter';
        }
      }
      return true;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(query) ||
        s.authors.join(' ').toLowerCase().includes(query) ||
        (s.publisher && s.publisher.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sort === 'newest') return b.year - a.year;
      if (sort === 'oldest') return a.year - b.year;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0; // Relevance is default / unsorted
    });

  // Copy Actions

  const handleCopyAll = () => {
    const allCitations = filteredBookmarks
      .map((s) => getFormattedCitation(s, selectedStyle))
      .join('\n\n');
    navigator.clipboard.writeText(allCitations).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const handleDownloadBibTeX = () => {
    const bibtex = generateBibTeX(filteredBookmarks);
    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citations_${library?.name || 'shared'}.bib`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRIS = () => {
    const ris = generateRIS(filteredBookmarks);
    const blob = new Blob([ris], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citations_${library?.name || 'shared'}.ris`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans">
        <Navbar mode="playground" />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-fuenzer-teal border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans">
        <Navbar mode="playground" />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink-black dark:text-paper-white font-serif">
            {isLanguageId ? 'Akses Ditolak / Tidak Ditemukan' : 'Access Denied / Not Found'}
          </h2>
          <p className="text-xs text-slate-gray max-w-sm">
            {error || (isLanguageId ? 'Pustaka ini bersifat privat atau tidak tersedia.' : 'This library is private or unavailable.')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-fuenzer-teal text-white rounded-xl text-xs font-bold hover:bg-fuenzer-teal-dark transition-colors cursor-pointer"
          >
            {isLanguageId ? 'Kembali ke Beranda' : 'Back to Home'}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-sans transition-colors duration-200">
      <Navbar mode="playground" />

      {/* Hero Header */}
      <section className="bg-paper-white dark:bg-ink-black border-b border-cloud-canvas dark:border-stone-gray py-12 px-6 md:px-8 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fuenzer-teal">
              <Globe className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">{isLanguageId ? 'Pustaka Bersama' : 'Shared Library'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink-black dark:text-paper-white leading-tight font-serif">
              {library.name}
            </h1>
            <p className="text-xs text-slate-gray dark:text-silver-mist">
              {isLanguageId ? 'Dibagikan oleh peneliti lain. Anda dapat melihat referensi, sitasi, atau menyimpannya.' : 'Shared by another researcher. You can view references, citations, or save them.'}
            </p>
          </div>

          {/* Export / Citation controls */}
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap font-sans shrink-0">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuenzer-teal text-white text-xs font-bold hover:bg-fuenzer-teal-dark shadow-md transition-all cursor-pointer"
              >
                {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedAll ? tCit.copiedAll : tCit.copyAll}
              </button>
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cloud-canvas dark:border-stone-gray bg-paper-white dark:bg-ink-black text-slate-gray dark:text-cloud-canvas text-xs font-bold hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-all cursor-pointer">
                    <Download className="w-4 h-4 text-silver-mist" />
                    Export
                    <ChevronDown className="w-3.5 h-3.5 text-silver-mist" />
                  </button>
                }
              >
                <DropdownItem label={tCit.exportBibtex} onClick={handleDownloadBibTeX} />
                <DropdownItem label={tCit.exportRis} onClick={handleDownloadRIS} />
              </Dropdown>
            </div>
          )}
        </div>
      </section>

      {/* Main content grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Citations */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-cloud-canvas dark:border-stone-gray pb-4">
            {/* Search Input */}
            <div className="flex items-center border border-cloud-canvas dark:border-stone-gray rounded-xl px-3.5 h-10 bg-cloud-canvas/30 dark:bg-stone-gray/30 transition-colors w-full max-w-xs">
              <Search className="w-4 h-4 text-silver-mist shrink-0 mr-2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs outline-none bg-transparent dark:text-cloud-canvas placeholder:text-silver-mist min-w-0"
              />
            </div>
            
            <span className="text-[10px] font-bold text-slate-gray uppercase tracking-wider">
              {filteredBookmarks.length} {isLanguageId ? 'referensi' : 'references'}
            </span>
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 text-silver-mist text-xs bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray shadow-sm">
              {isLanguageId ? 'Tidak ada referensi ditemukan.' : 'No references found.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((source) => (
                <JournalCard
                  key={source.id}
                  source={source}
                  isBookmarked={isBookmarkedInAnyLibrary(source.id)}
                  onToggleBookmark={() => setBookmarkModalSource(source)}
                  citationStyle={selectedStyle}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Citations Generator Widget */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-paper-white font-serif flex items-center gap-2 border-b border-cloud-canvas/80 dark:border-stone-gray/40 pb-3">
              <BookOpen className="w-4 h-4 text-fuenzer-teal" />
              {isLanguageId ? 'Format Daftar Pustaka' : 'Bibliography Formatter'}
            </h3>

            {/* Citation Style Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-gray">
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CITATION_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      selectedStyle === style
                        ? 'bg-fuenzer-teal/10 border-fuenzer-teal text-fuenzer-teal font-bold'
                        : 'border-cloud-canvas dark:border-stone-gray/40 text-slate-gray hover:bg-cloud-canvas/30'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Citation list copy preview */}
            <div className="pt-2">
              <p className="text-[10px] text-slate-gray leading-relaxed">
                {isLanguageId ? 'Pilih sitasi di sebelah kiri untuk menyalin satu per satu, atau klik salin semua di kanan atas untuk menyalin seluruh daftar pustaka.' : 'Select citations on the left to copy one-by-one, or click copy all on the top right to copy the entire bibliography.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <SaveToLibraryModal
        isOpen={bookmarkModalSource !== null}
        onClose={() => setBookmarkModalSource(null)}
        source={bookmarkModalSource}
      />

      <Footer />
    </div>
  );
}
