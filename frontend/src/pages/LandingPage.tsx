import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
import { Navbar } from '../components/shared/Navbar';
import {
  BookOpen,
  ArrowRight,
  Globe,
  Zap,
  Network,
  Bell,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { query, setQuery, executeSearch } = useResearchStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const { language } = useUiStore();
  const t = language === 'en' ? en : id;

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    await executeSearch();
    navigate('/search');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-cloud-canvas dark:bg-[#121212] text-ink-black dark:text-cloud-canvas font-serif transition-colors duration-200">
      <Navbar mode="landing" />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 dark:text-paper-white">
          {t.hero.title}
        </h1>
        <p className="text-lg text-slate-gray dark:text-silver-mist max-w-2xl mx-auto mb-10 leading-relaxed font-light font-sans">
          {t.hero.subtitle}
        </p>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto relative group font-sans">
          <div className="relative flex items-center bg-paper-white dark:bg-ink-black rounded-xl shadow-xl p-2 group-focus-within:ring-2 group-focus-within:ring-fuenzer-teal/50 transition-all border border-cloud-canvas dark:border-stone-gray">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.hero.searchPlaceholder}
              className="flex-1 h-14 px-6 bg-transparent text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray outline-none text-lg"
              maxLength={200}
            />
            <button
              onClick={handleSearch}
              disabled={query.trim().length < 3}
              className="w-14 h-14 flex items-center justify-center rounded-lg bg-fuenzer-teal text-white hover:bg-fuenzer-teal-dark transition-colors disabled:opacity-50"
            >
              <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 font-sans">
          {['Type: All', 'Location: Global', 'Accreditation: Any'].map((filter) => (
            <span key={filter} className="px-4 py-1.5 rounded-full bg-paper-white dark:bg-ink-black text-stone-gray dark:text-silver-mist text-xs font-medium border border-cloud-canvas dark:border-stone-gray shadow-sm cursor-pointer hover:border-silver-mist dark:hover:border-slate-gray transition-colors">
              {filter}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-silver-mist font-sans">
          Popular: Machine Learning, Climate Science, Economic Policy
        </p>
      </section>

      {/* Stats & Logos */}
      <section className="max-w-5xl mx-auto px-6 pb-20 pt-10 text-center border-b border-cloud-canvas dark:border-stone-gray">
        <div className="grid grid-cols-3 gap-8 mb-16 font-sans">
          <div>
            <p className="text-3xl font-bold font-serif dark:text-paper-white">50M+</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2">{t.hero.stats.parsed}</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-serif dark:text-paper-white">S1 - S6</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2">{t.hero.stats.sinta}</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-serif dark:text-paper-white">&lt;100MS</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2">{t.hero.stats.time}</p>
          </div>
        </div>
        
        <p className="text-[10px] uppercase tracking-widest text-silver-mist mb-8 font-sans">ACCREDITED SOURCES</p>
        <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 dark:opacity-40">
          <span className="text-2xl font-bold tracking-wide">SINTA</span>
          <span className="text-2xl font-bold tracking-wide">GARUDA</span>
          <span className="text-2xl font-bold tracking-wide">ARJUNA</span>
          <span className="text-xl font-bold tracking-wide leading-tight text-left">Global<br/>Indexing</span>
        </div>
      </section>

      {/* The Future of Academic Inquiry */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="bg-paper-white dark:bg-ink-black p-12 rounded-2xl shadow-xl border border-cloud-canvas dark:border-stone-gray transition-colors">
          <h2 className="text-3xl font-bold mb-6 dark:text-paper-white">The Future of Academic Inquiry</h2>
          <p className="text-stone-gray dark:text-silver-mist leading-relaxed font-sans">
            Fuenzer Research is on a mission to bridge the gap between advanced artificial intelligence and traditional academic research. We provide scholars with the tools to navigate massive datasets effortlessly, extract meaningful insights, and synthesize knowledge faster than ever before.
          </p>
        </div>
      </section>

      {/* Why Choose */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-12 dark:text-paper-white">Why Choose Fuenzer Research?</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { icon: <BookOpen className="w-5 h-5 text-fuenzer-teal" />, title: 'SINTA-Ready Data', desc: 'Direct integration with recognized national databases ensuring your sources meet institutional standards.' },
            { icon: <Zap className="w-5 h-5 text-fuenzer-teal" />, title: 'AI Synthesis', desc: 'Beyond search: our AI models help connect dots across disparate papers, summarizing findings rapidly.' },
            { icon: <Globe className="w-5 h-5 text-fuenzer-teal" />, title: 'Global Reach', desc: 'Access millions of open-access articles worldwide, seamlessly integrated with local contexts.' },
            { icon: <Bell className="w-5 h-5 text-fuenzer-teal" />, title: 'Real-time Updates', desc: 'Stay ahead with continuous indexing of the latest publications and preprint servers.' },
            { icon: <Network className="w-5 h-5 text-fuenzer-teal" />, title: 'Cross-disciplinary Links', desc: 'Discover hidden connections between different fields of study through AI-driven semantic mapping.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white dark:bg-ink-black p-6 rounded-2xl shadow-sm border border-cloud-canvas dark:border-stone-gray hover:shadow-xl transition-all flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-fuenzer-teal/10 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm mb-3 dark:text-paper-white">{item.title}</h3>
              <p className="text-[11px] text-slate-gray dark:text-silver-mist leading-relaxed text-center font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-16 dark:text-paper-white">From Query to Synthesis</h2>
        <div className="relative flex flex-col md:flex-row justify-between items-center">
          <div className="hidden md:block absolute top-6 left-16 right-16 h-px bg-cloud-canvas dark:bg-stone-gray -z-10" />
          {[
            { step: '1', title: 'Search Topic', desc: 'Query global and local databases simultaneously.' },
            { step: '2', title: 'Analyze with AI', desc: 'Use Fuenzer AI to extract key findings and data.' },
            { step: '3', title: 'Export Synthesis', desc: 'Generate structured literature reviews or summaries.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center bg-cloud-canvas dark:bg-[#121212] px-4 mb-8 md:mb-0 transition-colors">
              <div className="w-12 h-12 rounded-full bg-fuenzer-teal/20 text-fuenzer-teal-dark dark:text-fuenzer-teal font-bold text-xl flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2 dark:text-paper-white">{item.title}</h3>
              <p className="text-xs text-slate-gray dark:text-silver-mist font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-paper-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is SINTA integration?', a: "SINTA integration allows you to directly search and filter articles from Indonesia's Science and Technology Index, ensuring you find accredited local research easily." },
            { q: 'How does the AI simplify jargon?', a: 'Our models process complex academic texts and generate accessible summaries, highlighting key methodologies and findings without the dense terminology.' },
            { q: 'Is my data secure?', a: 'Yes, all your queries and generated reviews are private. We use industry-standard encryption and do not train our public models on your personal data.' },
            { q: 'Can I export to LaTeX?', a: 'Currently, we support exporting synthesis and citations in Word, PDF, and standard BibTeX formats, which can be easily integrated into LaTeX workflows.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white dark:bg-ink-black rounded-xl shadow-sm border border-cloud-canvas dark:border-stone-gray overflow-hidden transition-colors">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors font-sans"
              >
                <div className="w-6 h-6 rounded-full border border-fuenzer-teal text-fuenzer-teal flex items-center justify-center shrink-0">
                  <span className="italic font-bold text-xs font-serif">i</span>
                </div>
                <span className="font-bold text-sm flex-1 dark:text-paper-white">{item.q}</span>
              </button>
              {openFaq === i && (
                <div className="px-16 pb-6 text-sm text-stone-gray dark:text-silver-mist leading-relaxed animate-in slide-in-from-top-2 font-sans">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper-white dark:bg-ink-black border-t border-cloud-canvas dark:border-stone-gray text-stone-gray dark:text-silver-mist py-12 text-xs transition-colors">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-fuenzer-teal flex items-center justify-center text-paper-white font-bold rounded-sm">
              F
            </div>
            <span className="text-lg font-bold text-fuenzer-teal-dark dark:text-fuenzer-teal">
              Fuenzer Research
            </span>
          </div>
          <div className="flex items-center gap-6 uppercase tracking-widest font-semibold font-sans">
            <a href="#" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">GITHUB</a>
            <a href="#" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">CONTACT</a>
            <a href="#" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-ink-black dark:hover:text-paper-white transition-colors">PRIVACY POLICY</a>
          </div>
        </div>
        <div className="text-center mt-12 text-silver-mist dark:text-stone-gray font-sans">
          © 2026 Fuenzer Research. Built for modern scholars.
        </div>
      </footer>
    </div>
  );
}
