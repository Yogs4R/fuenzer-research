import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useResearchStore } from '../store/researchStore';
import { NarrativeSkeletonLoader } from '../components/shared/NarrativeSkeletonLoader';
import { JournalCard } from '../components/shared/JournalCard';
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
  Moon,
  Bell,
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
    <div className="h-screen flex flex-col bg-cloud-canvas font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="w-full h-16 flex items-center justify-between px-6 bg-paper-white border-b border-cloud-canvas shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 bg-fuenzer-teal flex items-center justify-center text-paper-white font-bold text-sm rounded">
            F
          </div>
          <span className="text-lg font-bold text-fuenzer-teal-dark hidden md:block">
            Fuenzer Research
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8 h-full">
          {['Recent', 'Library', 'Citations', 'Workspace'].map((link) => (
            <div
              key={link}
              className={`h-full flex items-center text-sm font-semibold cursor-pointer border-b-2 px-1 transition-colors ${
                link === 'Workspace'
                  ? 'border-fuenzer-teal text-fuenzer-teal-dark'
                  : 'border-transparent text-slate-gray hover:text-ink-black'
              }`}
            >
              {link}
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-gray cursor-pointer hover:text-ink-black">
            EN <ChevronDown className="w-4 h-4" />
          </div>
          <Moon className="w-4 h-4 text-slate-gray cursor-pointer hover:text-ink-black hidden md:block" />
          <div className="relative cursor-pointer hidden md:block">
             <Bell className="w-4 h-4 text-slate-gray hover:text-ink-black" />
             <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-paper-white"></span>
          </div>
          <div className="hidden md:block h-6 w-px bg-cloud-canvas mx-2"></div>
          <button className="text-sm font-semibold text-fuenzer-teal-dark hover:text-fuenzer-teal hidden md:block">
            Log In
          </button>
          <button className="px-4 py-1.5 rounded-lg bg-fuenzer-teal text-white text-sm font-bold hover:bg-fuenzer-teal-dark transition-all">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main content: split-screen */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-cloud-canvas gap-px">
        {/* Left Panel: AI Assistant */}
        <section className="w-full md:w-[45%] flex flex-col bg-paper-white relative">
          <div className="p-6 border-b border-cloud-canvas flex justify-between items-start shrink-0">
            <div>
              <h2 className="text-sm font-bold text-ink-black flex items-center gap-2">
                Synthesis: {query.length > 30 ? query.substring(0, 30) + '...' : query || 'New Topic'}
                <Edit2 className="w-3 h-3 text-silver-mist cursor-pointer hover:text-ink-black" />
              </h2>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-between items-center shrink-0">
             <h1 className="text-xl font-bold text-ink-black">AI Assistant</h1>
             <MoreVertical className="w-5 h-5 text-slate-gray cursor-pointer" />
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 pb-32">
            {/* User Prompt Bubble */}
            {query && (
              <div className="self-start max-w-[85%] bg-cloud-canvas rounded-2xl rounded-tl-sm p-4 text-sm text-ink-black leading-relaxed">
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
              <div className="p-4 rounded-lg bg-red-50 text-red-800 text-sm border-l-4 border-red-500">
                {error || 'Terjadi kesalahan. Silakan coba lagi.'}
              </div>
            )}

            {loadingPhase === 'complete' && response && (
              <div className="border-l-4 border-fuenzer-teal pl-4 ml-2">
                <h3 className="font-bold text-lg mb-3 text-ink-black">
                   Synthesis: {query}
                </h3>
                <div
                  className="prose prose-sm prose-slate max-w-none text-stone-gray leading-relaxed"
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
            <div className="bg-paper-white border border-cloud-canvas shadow-xl rounded-xl p-2 flex items-center gap-2">
               <button className="p-2 text-slate-gray hover:text-ink-black rounded-lg hover:bg-cloud-canvas">
                 <Paperclip className="w-5 h-5" />
               </button>
               <input
                  type="text"
                  placeholder="Ask Fuenzer AI or prompt a specific analysis..."
                  className="flex-1 h-10 px-2 bg-transparent text-sm outline-none text-ink-black placeholder:text-silver-mist"
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
        <section className="w-full md:w-[55%] flex flex-col bg-paper-white relative">
          <div className="p-6 border-b border-cloud-canvas flex flex-col gap-4 shrink-0">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <h2 className="text-2xl font-bold text-ink-black">References</h2>
                   <div className="flex bg-cloud-canvas/50 rounded-lg p-1 border border-cloud-canvas sm:flex">
                     <button className="px-4 py-1.5 text-sm font-medium bg-paper-white text-ink-black shadow-sm rounded-md">
                       All
                     </button>
                     <button className="px-4 py-1.5 text-sm font-medium text-slate-gray hover:text-ink-black rounded-md">
                       Bookmarked
                     </button>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-gray md:flex">
                   Citation Style: 
                   <div className="flex items-center gap-1 border border-cloud-canvas px-3 py-1 rounded-lg text-ink-black cursor-pointer hover:bg-cloud-canvas/50">
                      APA <ChevronDown className="w-4 h-4" />
                   </div>
                </div>
             </div>

             {/* Filters Row */}
             <div className="flex items-center gap-3">
                <div className="flex-1 relative flex items-center border border-cloud-canvas rounded-lg px-3 h-10 hover:border-silver-mist focus-within:border-fuenzer-teal transition-colors">
                   <Search className="w-4 h-4 text-silver-mist" />
                   <input type="text" placeholder="Search references..." className="flex-1 h-full px-3 text-sm outline-none bg-transparent" />
                </div>
                <button className="flex items-center gap-2 h-10 px-4 border border-cloud-canvas rounded-lg text-sm font-medium text-slate-gray hover:bg-cloud-canvas/50 transition-colors">
                   <Filter className="w-4 h-4" /> Sort by Relevance <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 h-10 px-4 border border-cloud-canvas rounded-lg text-sm font-medium text-slate-gray hover:bg-cloud-canvas/50 transition-colors">
                   <Filter className="w-4 h-4" /> Filters
                </button>
                <button className="flex items-center gap-2 h-10 px-4 bg-fuenzer-teal/10 text-fuenzer-teal-dark rounded-lg text-sm font-medium hover:bg-fuenzer-teal/20 transition-colors ml-auto">
                   <Download className="w-4 h-4" /> Export
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-cloud-canvas/30">
            {/* Reference cards */}
            {loadingPhase === 'complete' && response && (
              <div className="space-y-4 max-w-4xl mx-auto">
                {response.references.length === 0 ? (
                  <div className="text-center py-16 text-silver-mist text-sm bg-paper-white rounded-xl border border-cloud-canvas shadow-subtle">
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
                    className="bg-paper-white rounded-xl p-6 shadow-subtle border border-cloud-canvas animate-pulse"
                  >
                    <div className="h-5 bg-cloud-canvas rounded w-3/4 mb-3" />
                    <div className="h-3 bg-cloud-canvas rounded w-1/2 mb-5" />
                    <div className="h-3 bg-cloud-canvas rounded w-1/4" />
                  </div>
                ))}
              </div>
            )}

            {/* Idle */}
            {loadingPhase === 'idle' && !response && (
              <div className="flex flex-col items-center justify-center py-32 text-center text-silver-mist">
                <BookOpen className="w-10 h-10 mb-4 text-cloud-canvas" strokeWidth={1.5} />
                <p className="text-sm font-medium">No references to display yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
