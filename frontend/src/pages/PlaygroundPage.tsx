import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useResearchStore } from '../store/researchStore';
import { NarrativeSkeletonLoader } from '../components/shared/NarrativeSkeletonLoader';
import { JournalCard } from '../components/shared/JournalCard';
import { Navbar } from '../components/shared/Navbar';
import {
  Search,
  ArrowRight,
  Clock,
  BookOpen,
  Edit2,
  MoreVertical,
  Paperclip,
  Download,
  Filter,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function PlaygroundPage() {
  const navigate = useNavigate();
  const {
    query,
    loadingPhase,
    response,
    error,
    setQuery,
    executeSearch,
  } = useResearchStore();

  useEffect(() => {
    if (!query.trim() && loadingPhase === 'idle' && !response) {
      navigate('/');
    }
  }, [query, loadingPhase, response, navigate]);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    await executeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const isLoading =
    loadingPhase === 'searching' ||
    loadingPhase === 'filtering' ||
    loadingPhase === 'synthesizing';

  return (
    <div className="h-screen flex flex-col bg-cloud-canvas dark:bg-[#121212] font-serif overflow-hidden transition-colors">
      <Navbar mode="playground" />

      {/* Main content: split-screen */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-cloud-canvas dark:bg-stone-gray gap-px font-sans">
        {/* Left Panel: AI Assistant */}
        <section className="w-full md:w-[45%] flex flex-col bg-paper-white dark:bg-ink-black relative transition-colors">
          <div className="p-6 border-b border-cloud-canvas dark:border-stone-gray flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-sm font-bold text-ink-black dark:text-cloud-canvas flex items-center gap-2 font-serif">
                Synthesis: {query.length > 30 ? query.substring(0, 30) + '...' : query || 'New Topic'}
                <Edit2 className="w-3 h-3 text-silver-mist cursor-pointer hover:text-ink-black dark:hover:text-paper-white" />
              </h2>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-between items-center shrink-0">
             <h1 className="text-xl font-bold text-ink-black dark:text-paper-white font-serif">AI Assistant</h1>
             <MoreVertical className="w-5 h-5 text-slate-gray cursor-pointer dark:text-silver-mist" />
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-32">
            {/* User Prompt Bubble */}
            {query && (
              <div className="self-start max-w-[85%] bg-cloud-canvas dark:bg-stone-gray rounded-2xl rounded-tl-sm p-4 text-sm text-ink-black dark:text-cloud-canvas leading-relaxed">
                {query}
              </div>
            )}

            {/* Divider */}
            {(isLoading || response) && (
               <div className="flex items-center gap-3">
                 <Sparkles className="w-4 h-4 text-fuenzer-teal" />
                 <span className="text-xs font-bold text-fuenzer-teal tracking-wide">Fuenzer AI</span>
               </div>
            )}

            {/* AI Response Block */}
            {isLoading && <NarrativeSkeletonLoader phase={loadingPhase} />}

            {loadingPhase === 'error' && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-sm border-l-4 border-red-500">
                {error || 'Terjadi kesalahan. Silakan coba lagi.'}
              </div>
            )}

            {loadingPhase === 'complete' && response && (
              <div className="border-l-4 border-fuenzer-teal pl-4 ml-2">
                <h3 className="font-bold text-lg mb-3 text-ink-black dark:text-paper-white font-serif">
                   Synthesis: {query}
                </h3>
                <div
                  className="prose prose-sm prose-slate max-w-none text-stone-gray dark:text-silver-mist leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      response.synthesis.replace(/\n/g, '<br />')
                    ),
                  }}
                />
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-silver-mist pt-4">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  PROCESSED IN {(response.latency_ms / 1000).toFixed(1)} SECONDS
                </div>
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-paper-white dark:bg-ink-black border border-cloud-canvas dark:border-stone-gray shadow-xl rounded-xl p-2 flex items-center gap-2">
               <button className="p-2 text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white rounded-lg hover:bg-cloud-canvas dark:hover:bg-stone-gray">
                 <Paperclip className="w-5 h-5" />
               </button>
               <input
                  type="text"
                  placeholder="Ask Fuenzer AI or prompt a specific analysis..."
                  className="flex-1 h-10 px-2 bg-transparent text-sm outline-none text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
               />
               <button
                  onClick={handleSearch}
                  disabled={query.trim().length < 3 || isLoading}
                  className="w-8 h-8 rounded-full bg-fuenzer-teal text-white flex items-center justify-center hover:bg-fuenzer-teal-dark disabled:opacity-50 transition-colors"
               >
                 <ArrowRight className="w-4 h-4 -rotate-90" strokeWidth={2} />
               </button>
            </div>
          </div>
        </section>

        {/* Right Panel: References */}
        <section className="w-full md:w-[55%] flex flex-col bg-paper-white dark:bg-ink-black relative transition-colors">
          <div className="p-6 border-b border-cloud-canvas dark:border-stone-gray flex flex-col gap-4 shrink-0">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white font-serif">References</h2>
                   <div className="flex bg-cloud-canvas/50 dark:bg-stone-gray/50 rounded-lg p-1 border border-cloud-canvas dark:border-stone-gray sm:flex">
                     <button className="px-4 py-1.5 text-sm font-medium bg-paper-white dark:bg-ink-black text-ink-black dark:text-cloud-canvas shadow-sm rounded-md">
                       All
                     </button>
                     <button className="px-4 py-1.5 text-sm font-medium text-slate-gray dark:text-silver-mist hover:text-ink-black dark:hover:text-paper-white rounded-md">
                       Bookmarked
                     </button>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-gray dark:text-silver-mist md:flex">
                   Citation Style: 
                   <div className="flex items-center gap-1 border border-cloud-canvas dark:border-stone-gray px-3 py-1 rounded-lg text-ink-black dark:text-cloud-canvas cursor-pointer hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50">
                      APA <ChevronDown className="w-4 h-4" />
                   </div>
                </div>
             </div>

             {/* Filters Row */}
             <div className="flex items-center gap-3">
                <div className="flex-1 relative flex items-center border border-cloud-canvas dark:border-stone-gray rounded-lg px-3 h-10 hover:border-silver-mist dark:hover:border-slate-gray focus-within:border-fuenzer-teal dark:focus-within:border-fuenzer-teal transition-colors">
                   <Search className="w-4 h-4 text-silver-mist" />
                   <input type="text" placeholder="Search references..." className="flex-1 h-full px-3 text-sm outline-none bg-transparent dark:text-cloud-canvas" />
                </div>
                <button className="flex items-center gap-2 h-10 px-4 border border-cloud-canvas dark:border-stone-gray rounded-lg text-sm font-medium text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors">
                   <Filter className="w-4 h-4" /> Sort by Relevance <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 h-10 px-4 border border-cloud-canvas dark:border-stone-gray rounded-lg text-sm font-medium text-slate-gray dark:text-silver-mist hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors">
                   <Filter className="w-4 h-4" /> Filters
                </button>
                <button className="flex items-center gap-2 h-10 px-4 bg-fuenzer-teal/10 text-fuenzer-teal-dark dark:text-fuenzer-teal rounded-lg text-sm font-medium hover:bg-fuenzer-teal/20 transition-colors ml-auto">
                   <Download className="w-4 h-4" /> Export
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-cloud-canvas/30 dark:bg-[#121212]/50">
            {/* Reference cards */}
            {loadingPhase === 'complete' && response && (
              <div className="space-y-4 max-w-4xl mx-auto">
                {response.references.length === 0 ? (
                  <div className="text-center py-16 text-silver-mist text-sm bg-paper-white dark:bg-ink-black rounded-xl border border-cloud-canvas dark:border-stone-gray shadow-subtle">
                    No references found for this query.
                  </div>
                ) : (
                  response.references.map((source) => (
                    <JournalCard key={source.id} source={source} />
                  ))
                )}
              </div>
            )}

            {/* Loading skeleton cards */}
            {isLoading && (
              <div className="space-y-4 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-paper-white dark:bg-ink-black rounded-xl p-6 shadow-subtle border border-cloud-canvas dark:border-stone-gray animate-pulse"
                  >
                    <div className="h-5 bg-cloud-canvas dark:bg-stone-gray rounded w-3/4 mb-3" />
                    <div className="h-3 bg-cloud-canvas dark:bg-stone-gray rounded w-1/2 mb-5" />
                    <div className="h-3 bg-cloud-canvas dark:bg-stone-gray rounded w-1/4" />
                  </div>
                ))}
              </div>
            )}

            {/* Idle */}
            {loadingPhase === 'idle' && !response && (
              <div className="flex flex-col items-center justify-center py-32 text-center text-silver-mist">
                <BookOpen className="w-10 h-10 mb-4 text-cloud-canvas dark:text-stone-gray" strokeWidth={1.5} />
                <p className="text-sm font-medium">No references to display yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
