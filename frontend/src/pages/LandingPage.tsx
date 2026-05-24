import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import {
  BookOpen,
  ArrowRight,
  Globe,
  Zap,
  Layers,
  Network,
  Moon,
  Bell,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { query, setQuery, executeSearch } = useResearchStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    await executeSearch();
    navigate('/search');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const navLinks = ['ABOUT', 'FEATURES', 'WORKFLOW', 'FAQ'];

  return (
    <div className="min-h-screen bg-cloud-canvas text-ink-black font-sans">
      {/* Navbar */}
      <nav className="w-full h-20 flex items-center justify-between px-8 bg-paper-white border-b border-cloud-canvas">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-fuenzer-teal flex items-center justify-center text-paper-white font-bold text-lg rounded">
            F
          </div>
          <span className="text-xl font-bold text-fuenzer-teal-dark">
            Fuenzer Research
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-gray">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-ink-black transition-colors">
              {link}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-gray cursor-pointer hover:text-ink-black">
            EN <ChevronDown className="w-4 h-4" />
          </div>
          <Moon className="w-4 h-4 text-slate-gray cursor-pointer hover:text-ink-black" />
          <div className="relative cursor-pointer">
             <Bell className="w-4 h-4 text-slate-gray hover:text-ink-black" />
             <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <div className="h-6 w-px bg-cloud-canvas"></div>
          <button className="text-sm font-semibold text-fuenzer-teal-dark hover:text-fuenzer-teal">
            Log In
          </button>
          <button className="px-5 py-2 rounded-lg bg-fuenzer-teal text-white text-sm font-bold tracking-wide hover:bg-fuenzer-teal-dark transition-all">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-ink-black leading-tight mb-6">
          Accelerate Your Academic Research
        </h1>
        <p className="text-lg text-slate-gray max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Access a high-density information environment powered by AI. Seamlessly search global databases and SINTA-indexed journals with unparalleled efficiency.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-3xl mx-auto relative group">
          <div className="relative flex items-center bg-paper-white rounded-xl shadow-xl p-2 group-focus-within:ring-2 group-focus-within:ring-fuenzer-teal/50 transition-all border border-cloud-canvas">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything, search topics, or enter a DOI ..."
              className="flex-1 h-14 px-6 bg-transparent text-ink-black placeholder:text-silver-mist outline-none text-lg"
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
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {['Type: All', 'Location: Global', 'Accreditation: Any'].map((filter) => (
            <span key={filter} className="px-4 py-1.5 rounded-full bg-paper-white text-stone-gray text-xs font-medium border border-cloud-canvas shadow-subtle cursor-pointer hover:border-silver-mist">
              {filter}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-silver-mist">
          Popular: Machine Learning, Climate Science, Economic Policy
        </p>
      </section>

      {/* Stats & Logos */}
      <section className="max-w-5xl mx-auto px-6 pb-20 pt-10 text-center border-b border-cloud-canvas">
        <div className="grid grid-cols-3 gap-8 mb-16">
          <div>
            <p className="text-3xl font-bold">50M+</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray mt-2">ARTICLES PARSED</p>
          </div>
          <div>
            <p className="text-3xl font-bold">S1 - S6</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray mt-2">SINTA ACCREDITED</p>
          </div>
          <div>
            <p className="text-3xl font-bold">&lt;100MS</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray mt-2">AVG QUERY TIME</p>
          </div>
        </div>
        
        <p className="text-[10px] uppercase tracking-widest text-silver-mist mb-8">ACCREDITED SOURCES</p>
        <div className="flex flex-wrap justify-center items-center gap-16 opacity-50">
          <span className="text-2xl font-bold tracking-wide">SINTA</span>
          <span className="text-2xl font-bold tracking-wide">GARUDA</span>
          <span className="text-2xl font-bold tracking-wide">ARJUNA</span>
          <span className="text-xl font-bold tracking-wide leading-tight text-left">Global<br/>Indexing</span>
        </div>
      </section>

      {/* The Future of Academic Inquiry */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="bg-paper-white p-12 rounded-2xl shadow-xl border border-cloud-canvas">
          <h2 className="text-3xl font-bold mb-6">The Future of Academic Inquiry</h2>
          <p className="text-stone-gray leading-relaxed">
            Fuenzer Research is on a mission to bridge the gap between advanced artificial intelligence and traditional academic research. We provide scholars with the tools to navigate massive datasets effortlessly, extract meaningful insights, and synthesize knowledge faster than ever before.
          </p>
        </div>
      </section>

      {/* Why Choose */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-12">Why Choose Fuenzer Research?</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { icon: <BookOpen className="w-5 h-5 text-fuenzer-teal" />, title: 'SINTA-Ready Data', desc: 'Direct integration with recognized national databases ensuring your sources meet institutional standards.' },
            { icon: <Zap className="w-5 h-5 text-fuenzer-teal" />, title: 'AI Synthesis', desc: 'Beyond search: our AI models help connect dots across disparate papers, summarizing findings rapidly.' },
            { icon: <Globe className="w-5 h-5 text-fuenzer-teal" />, title: 'Global Reach', desc: 'Access millions of open-access articles worldwide, seamlessly integrated with local contexts.' },
            { icon: <Bell className="w-5 h-5 text-fuenzer-teal" />, title: 'Real-time Updates', desc: 'Stay ahead with continuous indexing of the latest publications and preprint servers.' },
            { icon: <Network className="w-5 h-5 text-fuenzer-teal" />, title: 'Cross-disciplinary Links', desc: 'Discover hidden connections between different fields of study through AI-driven semantic mapping.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white p-6 rounded-2xl shadow-subtle border border-cloud-canvas hover:shadow-xl transition-all flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-fuenzer-teal/10 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm mb-3">{item.title}</h3>
              <p className="text-[11px] text-slate-gray leading-relaxed text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Precision Tools */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-12">Precision Tools for Modern Scholars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Sparkles className="w-5 h-5 text-fuenzer-teal" />, title: 'AI-Powered Simplification', desc: 'Translating complex academic jargon into accessible insights.' },
            { icon: <Layers className="w-5 h-5 text-fuenzer-teal" />, title: 'SINTA and Garuda Integration', desc: 'Direct access and one-click filtering for accredited Indonesian journals.' },
            { icon: <Network className="w-5 h-5 text-fuenzer-teal" />, title: 'Literature Review Builder', desc: 'Automatically summarize multiple papers into a cohesive synthesis.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white p-8 rounded-2xl shadow-subtle border border-cloud-canvas hover:shadow-xl transition-all text-left">
              <div className="w-10 h-10 rounded-full bg-fuenzer-teal/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-slate-gray leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-16">From Query to Synthesis</h2>
        <div className="relative flex flex-col md:flex-row justify-between items-center">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-6 left-16 right-16 h-px bg-cloud-canvas -z-10" />
          
          {[
            { step: '1', title: 'Search Topic', desc: 'Query global and local databases simultaneously.' },
            { step: '2', title: 'Analyze with AI', desc: 'Use Fuenzer AI to extract key findings and data.' },
            { step: '3', title: 'Export Synthesis', desc: 'Generate structured literature reviews or summaries.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center bg-cloud-canvas px-4 mb-8 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-fuenzer-teal/20 text-fuenzer-teal-dark font-bold text-xl flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-xs text-slate-gray">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is SINTA integration?', a: "SINTA integration allows you to directly search and filter articles from Indonesia's Science and Technology Index, ensuring you find accredited local research easily." },
            { q: 'How does the AI simplify jargon?', a: 'Our models process complex academic texts and generate accessible summaries, highlighting key methodologies and findings without the dense terminology.' },
            { q: 'Is my data secure?', a: 'Yes, all your queries and generated reviews are private. We use industry-standard encryption and do not train our public models on your personal data.' },
            { q: 'Can I export to LaTeX?', a: 'Currently, we support exporting synthesis and citations in Word, PDF, and standard BibTeX formats, which can be easily integrated into LaTeX workflows.' },
            { q: 'What databases are indexed?', a: 'We index major global open-access repositories like arXiv, PubMed Central, DOAJ, along with specific integrations for SINTA and Garuda in Indonesia.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white rounded-xl shadow-subtle border border-cloud-canvas overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-cloud-canvas/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full border border-fuenzer-teal text-fuenzer-teal flex items-center justify-center shrink-0">
                  <span className="italic font-bold text-xs">i</span>
                </div>
                <span className="font-bold text-sm flex-1">{item.q}</span>
              </button>
              {openFaq === i && (
                <div className="px-16 pb-6 text-sm text-stone-gray leading-relaxed animate-in slide-in-from-top-2">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper-white border-t border-cloud-canvas text-stone-gray py-12 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-fuenzer-teal flex items-center justify-center text-paper-white font-bold rounded-sm">
              F
            </div>
            <span className="text-lg font-bold text-fuenzer-teal-dark">
              Fuenzer Research
            </span>
          </div>
          <div className="flex items-center gap-6 uppercase tracking-widest font-semibold">
            <a href="#" className="hover:text-ink-black transition-colors">GITHUB</a>
            <a href="#" className="hover:text-ink-black transition-colors">CONTACT</a>
            <a href="#" className="hover:text-ink-black transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-ink-black transition-colors">PRIVACY POLICY</a>
          </div>
        </div>
        <div className="text-center mt-12 text-silver-mist">
          © 2026 Fuenzer Research. Built for modern scholars.
        </div>
      </footer>
    </div>
  );
}
