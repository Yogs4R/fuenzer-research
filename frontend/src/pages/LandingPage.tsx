import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';
import { Navbar } from '../components/shared/Navbar';
import { HeroBackground } from '../components/home/HeroBackground';
import { CustomDropdown } from '../components/shared/CustomDropdown';
import { NumberScramble } from '../components/shared/NumberScramble';
import {
  BookOpen,
  ArrowRight,
  Globe,
  Zap,
  Network,
  Bell,
  ChevronDown,
  Search,
  Cpu,
  FileText
} from 'lucide-react';

import sintaLogo from '../assets/logos/sinta.webp';
import garudaLogo from '../assets/logos/garuda.webp';
import googleScholarLogo from '../assets/logos/googlescholar.webp';
import scopusLogo from '../assets/logos/scopus.webp';
import scimagoLogo from '../assets/logos/scimago.webp';
import googleBooksLogo from '../assets/logos/googlebooks.webp';

export function LandingPage() {
  const navigate = useNavigate();
  const { 
    query, setQuery, executeSearch,
    searchType, setSearchType,
    searchLocation, setSearchLocation,
    searchAccreditation, setSearchAccreditation
  } = useResearchStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const rotatingWords = ['Research', 'Journals', 'Articles', 'Books'];
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [rotatingKey, setRotatingKey] = useState(0);

  const accreditedSources = [
    { name: 'SINTA', src: sintaLogo },
    { name: 'GARUDA', src: garudaLogo },
    { name: 'Google Scholar', src: googleScholarLogo },
    { name: 'Scopus', src: scopusLogo },
    { name: 'Scimago', src: scimagoLogo },
    { name: 'Google Books', src: googleBooksLogo },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % rotatingWords.length);
      setRotatingKey((k) => k + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const getAccreditationOptions = () => {
    if (searchLocation === 'Indonesia' && (searchType === 'Journals' || searchType === 'Articles')) {
      return ['Global', 'SINTA', 'GARUDA'];
    }
    if (searchLocation === 'Indonesia' && searchType === 'Books') {
      return ['Global', 'ARJUNA'];
    }
    if (searchLocation === 'Indonesia') {
      return ['Global', 'SINTA', 'GARUDA', 'ARJUNA'];
    }
    return ['Global'];
  };
  const accreditationOptions = getAccreditationOptions();

  // Auto-reset accreditation when type or location changes and current value is no longer valid
  useEffect(() => {
    if (!accreditationOptions.includes(searchAccreditation)) {
      setSearchAccreditation('Global');
    }
  }, [searchType, searchLocation]);
  
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
    <div className="min-h-screen relative bg-cloud-canvas dark:bg-[#121212] text-ink-black dark:text-cloud-canvas font-serif transition-colors duration-200">
      <HeroBackground />
      <Navbar mode="landing" />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center z-10">
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 dark:text-paper-white flex flex-col items-center justify-center">
            <span>Accelerate Your Academic</span>
            <span className="relative overflow-hidden h-[1.3em] flex items-center justify-center text-fuenzer-teal mt-2">
              <span key={rotatingKey} className="word-flip-in whitespace-nowrap">
                {rotatingWords[rotatingIndex]}
              </span>
            </span>
          </h1>
          <p className="text-lg text-slate-gray dark:text-silver-mist max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Navigate millions of scientific papers with Fuenzer AI. Seamlessly search global databases and SINTA-indexed sources with unparalleled precision.
          </p>

          {/* Search Bar Container */}
          <div className="max-w-3xl mx-auto relative group font-sans flex flex-col items-center">
            
            {/* Main Search Input */}
            <div className="w-full relative flex items-center bg-paper-white dark:bg-ink-black rounded-xl shadow-xl p-2 group-focus-within:ring-2 group-focus-within:ring-fuenzer-teal/50 transition-all border border-cloud-canvas dark:border-stone-gray z-10 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.hero.searchPlaceholder}
                className="flex-1 h-14 px-6 bg-transparent text-ink-black dark:text-cloud-canvas placeholder:text-silver-mist dark:placeholder:text-stone-gray outline-none text-lg min-w-[200px]"
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

            {/* Dropdowns Below — relative z-20 so they appear above Popular Searches */}
            <div className="flex flex-wrap justify-center gap-3 relative z-20">
              <CustomDropdown
                value={searchType}
                onChange={setSearchType}
                options={['All', 'Books', 'Journals', 'Articles']}
              />

              <CustomDropdown
                value={searchLocation}
                onChange={setSearchLocation}
                options={['Global', 'Indonesia']}
              />

              <CustomDropdown
                value={searchAccreditation}
                onChange={setSearchAccreditation}
                options={accreditationOptions}
              />
            </div>
          </div>

          {/* Popular Tags Marquee — z-10, mt-16 to clear dropdown panels */}
          <div className="mt-16 flex flex-col items-center gap-4 font-sans w-full max-w-3xl mx-auto relative z-10">
            <span className="text-[10px] font-semibold text-slate-gray dark:text-stone-gray uppercase tracking-widest">
              Popular Searches
            </span>
            <div className="relative flex w-full overflow-hidden" style={{maskImage:'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'}}>
              <div className="marquee-track flex w-max gap-3 whitespace-nowrap">
                {[...['Machine Learning', 'Climate Science', 'Economic Policy', 'Quantum Computing', 'Neuroscience', 'Renewable Energy', 'Bioinformatics', 'Nanotechnology'], ...['Machine Learning', 'Climate Science', 'Economic Policy', 'Quantum Computing', 'Neuroscience', 'Renewable Energy', 'Bioinformatics', 'Nanotechnology']].map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-paper-white text-xs font-bold border border-transparent hover:border-fuenzer-teal transition-all cursor-pointer shadow-sm select-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Logos */}
      <section className="max-w-6xl mx-auto px-6 pb-20 pt-10 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 font-sans">
          <div>
            <p className="text-3xl md:text-4xl font-bold font-serif dark:text-paper-white text-fuenzer-teal">
              <NumberScramble value="150M+" duration={1500} />
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2 font-bold">Global Publications</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold font-serif dark:text-paper-white text-fuenzer-teal">
              <NumberScramble value="S1-S6" duration={1700} />
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2 font-bold">Sinta Accredited</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold font-serif dark:text-paper-white text-fuenzer-teal">
              <NumberScramble value="100%" duration={1900} />
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2 font-bold">AI-Assisted Synthesis</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold font-serif dark:text-paper-white text-fuenzer-teal">
              <NumberScramble value="5+" duration={2100} />
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-gray dark:text-silver-mist mt-2 font-bold">Supported Databases</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 font-sans w-full max-w-4xl mx-auto overflow-hidden">
          <span className="text-[10px] font-semibold text-slate-gray dark:text-stone-gray uppercase tracking-widest">
            Accredited Sources
          </span>
          <div className="relative flex w-full overflow-hidden" style={{maskImage:'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'}}>
            <div className="marquee-track flex w-max gap-12 whitespace-nowrap items-center py-4 opacity-70 dark:opacity-60">
              {/* Duplicated for seamless marquee loop */}
              {[...accreditedSources, ...accreditedSources].map((source, i) => (
                <div key={i} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer px-4">
                  <img 
                    src={source.src} 
                    alt={source.name} 
                    className="h-8 md:h-10 w-auto object-contain max-w-[150px] drop-shadow-sm" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Future of Academic Inquiry */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24">
        <div className="relative bg-paper-white dark:bg-[#1A1A1A] rounded-4xl shadow-xl border border-cloud-canvas dark:border-stone-gray overflow-hidden group">
          {/* Subtle animated background gradient */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-fuenzer-teal/40 via-transparent to-transparent transition-opacity duration-700 group-hover:opacity-40" />
          
          <div className="relative p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight dark:text-paper-white">
                The Future of <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-fuenzer-teal to-fuenzer-teal-dark">
                  Academic Inquiry
                </span>
              </h2>
              <p className="text-lg text-stone-gray dark:text-silver-mist leading-relaxed font-sans max-w-2xl">
                Fuenzer Research is an AI-powered scientific discovery engine designed to bridge the gap between traditional research methodologies and advanced artificial intelligence. We empower scholars, researchers, and students to navigate massive academic datasets, instantly synthesize complex papers, and uncover deep insights across millions of publications.
              </p>
            </div>
            
            {/* Visual element on the right */}
            <div className="flex-1 w-full max-w-md relative aspect-square md:aspect-auto md:h-80 rounded-2xl border border-cloud-canvas dark:border-stone-gray/50 bg-[#F1F5F9] dark:bg-[#121212] overflow-hidden flex items-center justify-center">
              {/* Decorative nodes */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-fuenzer-teal/30 dark:bg-fuenzer-teal/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-code-blue/30 dark:bg-code-blue/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="relative z-10 grid grid-cols-2 gap-4 p-8 w-full">
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 dark:border-white/10 transform translate-y-4 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="h-2 w-12 bg-cloud-canvas dark:bg-stone-gray rounded-full mb-3" />
                  <div className="h-2 w-full bg-slate-200 dark:bg-stone-gray/50 rounded-full mb-2" />
                  <div className="h-2 w-4/5 bg-slate-200 dark:bg-stone-gray/50 rounded-full" />
                </div>
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 dark:border-white/10 transform -translate-y-2 group-hover:translate-y-2 transition-transform duration-500 delay-100">
                  <div className="h-2 w-16 bg-fuenzer-teal/50 rounded-full mb-3" />
                  <div className="h-2 w-full bg-slate-200 dark:bg-stone-gray/50 rounded-full mb-2" />
                  <div className="h-2 w-5/6 bg-slate-200 dark:bg-stone-gray/50 rounded-full" />
                </div>
                <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 dark:border-white/10 transform translate-y-2 group-hover:-translate-y-1 transition-transform duration-500 delay-150 col-span-2 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-fuenzer-teal/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-fuenzer-teal" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-cloud-canvas dark:bg-stone-gray rounded-full mb-2" />
                    <div className="h-2 w-full bg-slate-200 dark:bg-stone-gray/50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold dark:text-paper-white mb-4">Why Choose Fuenzer Research?</h2>
          <p className="text-slate-gray dark:text-silver-mist font-sans max-w-2xl mx-auto">Built for modern academics, our platform combines extensive database coverage with cutting-edge AI to streamline your research workflow.</p>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
          {[
            { icon: <BookOpen className="w-6 h-6 text-fuenzer-teal" />, title: 'SINTA-Ready Data', desc: 'Direct integration with recognized national databases ensuring your sources meet institutional standards.', className: 'lg:col-span-1 lg:row-span-1' },
            { icon: <Zap className="w-6 h-6 text-fuenzer-teal" />, title: 'AI Synthesis', desc: 'Beyond search: our AI models help connect dots across disparate papers, summarizing findings rapidly without losing academic rigor.', className: 'lg:col-span-1 lg:row-span-1' },
            { 
              icon: <Globe className="w-6 h-6 text-fuenzer-teal" />, 
              title: 'Global Reach', 
              desc: 'Access millions of open-access articles worldwide, seamlessly integrated with local contexts. Never miss a critical international paper again.', 
              className: 'md:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col',
              visual: (
                <div className="mt-8 flex-1 flex flex-col items-center justify-center relative min-h-[160px] opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Orbiting rings */}
                  <div className="absolute w-32 h-32 border border-fuenzer-teal/20 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-24 h-24 border border-fuenzer-teal/30 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                  <Globe className="w-10 h-10 text-fuenzer-teal/50" />
                  
                  {/* Floating tags */}
                  <div className="absolute w-full flex justify-between px-6">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-[#2A2A2A]/80 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-paper-white shadow-sm animate-[bounce_3s_infinite]">IDN</span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-[#2A2A2A]/80 backdrop-blur-sm text-[10px] font-bold text-slate-700 dark:text-paper-white shadow-sm animate-[bounce_4s_infinite]" style={{animationDelay:'0.5s'}}>USA</span>
                  </div>
                  <div className="absolute top-0 w-full flex justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-fuenzer-teal/10 border border-fuenzer-teal/20 text-[10px] font-bold text-fuenzer-teal animate-[pulse_3s_infinite]">Global</span>
                  </div>
                </div>
              )
            },
            { icon: <Bell className="w-6 h-6 text-fuenzer-teal" />, title: 'Real-time Updates', desc: 'Stay ahead with continuous indexing of the latest publications and preprint servers.', className: 'lg:col-span-1 lg:row-span-1' },
            { icon: <Network className="w-6 h-6 text-fuenzer-teal" />, title: 'Cross-disciplinary Links', desc: 'Discover hidden connections between different fields of study through AI-driven semantic mapping.', className: 'lg:col-span-1 lg:row-span-1' },
          ].map((item, i) => (
            <div key={i} className={`group relative bg-paper-white dark:bg-[#1A1A1A] p-8 rounded-3xl shadow-sm border border-cloud-canvas dark:border-stone-gray hover:shadow-xl hover:-translate-y-1 hover:border-fuenzer-teal/30 transition-all duration-300 overflow-hidden ${item.className}`}>
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-fuenzer-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Abstract Large Icon Background */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] dark:opacity-[0.02] scale-[8] group-hover:scale-[10] group-hover:text-fuenzer-teal transition-all duration-700 pointer-events-none">
                {item.icon}
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-fuenzer-teal transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-xl dark:text-paper-white group-hover:text-fuenzer-teal transition-colors">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-gray dark:text-silver-mist leading-relaxed font-sans flex-1">{item.desc}</p>
                {/* @ts-ignore */}
                {item.visual && item.visual}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-16 dark:text-paper-white">From Query to Synthesis</h2>
        <div className="relative z-0 flex flex-col md:flex-row justify-center gap-12 md:gap-8 lg:gap-16 items-center w-full py-8">
          
          {/* Animated connection lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-[10%] right-[10%] h-[2px] z-0 bg-cloud-canvas dark:bg-stone-gray/30 overflow-hidden rounded-full">
            <div className="absolute inset-0 h-full bg-[linear-gradient(90deg,transparent_0%,var(--color-fuenzer-teal)_50%,transparent_100%)] w-1/2 animate-[progress_3s_linear_infinite]" />
          </div>

          {/* Animated connection lines (Mobile) */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-[15%] bottom-[15%] w-[2px] z-0 bg-cloud-canvas dark:bg-stone-gray/30 overflow-hidden rounded-full">
            <div className="absolute inset-0 w-full bg-[linear-gradient(180deg,transparent_0%,var(--color-fuenzer-teal)_50%,transparent_100%)] h-1/2 animate-[progress-vertical_3s_linear_infinite]" />
          </div>

          {[
            { step: '1', title: 'User Input', desc: 'Query global & local databases simultaneously using natural language.', icon: <Search className="w-6 h-6" /> },
            { step: '2', title: 'AI Processing', desc: 'Fuenzer models extract, connect, and cross-reference research data.', icon: <Cpu className="w-6 h-6" /> },
            { step: '3', title: 'Synthesis Output', desc: 'Generate structured, accurate literature reviews instantly.', icon: <FileText className="w-6 h-6" /> },
          ].map((item) => (
            <div key={item.step} className="relative flex flex-col items-center bg-paper-white dark:bg-[#1A1A1A] p-8 rounded-3xl border border-cloud-canvas dark:border-stone-gray shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-fuenzer-teal/40 transition-all duration-300 w-full md:w-80 mb-8 md:mb-0 z-10 group">
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-fuenzer-teal/10 to-transparent border border-fuenzer-teal/20 text-fuenzer-teal flex items-center justify-center mb-6 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                {/* scanning effect inside icon */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-fuenzer-teal/20 dark:via-fuenzer-teal/40 to-transparent -translate-y-full group-hover:animate-[slideInFromTop_1.5s_infinite]" />
                {item.icon}
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-paper-white dark:bg-[#1A1A1A] border border-cloud-canvas dark:border-stone-gray flex items-center justify-center text-xs font-bold text-slate-gray dark:text-silver-mist shadow-sm">
                0{item.step}
              </div>
              <h3 className="font-bold text-xl mb-3 dark:text-paper-white group-hover:text-fuenzer-teal transition-colors text-center">{item.title}</h3>
              <p className="text-sm text-slate-gray dark:text-silver-mist font-sans text-center leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-paper-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is Fuenzer Research?', a: 'Fuenzer Research is an AI-powered scientific discovery engine that bridges traditional research methodologies with advanced artificial intelligence, helping scholars navigate massive academic datasets and synthesize complex papers.' },
            { q: 'How does the SINTA integration work?', a: 'We provide direct integration with recognized national databases like SINTA and GARUDA, ensuring your sources meet institutional standards while also accessing global repositories like Scopus and Google Scholar.' },
            { q: 'Can the AI synthesize findings accurately?', a: 'Yes, our AI models are specifically tuned for academic rigor. They connect dots across disparate papers and summarize findings rapidly without losing critical academic context or hallucinating facts.' },
            { q: 'Is my data and research secure?', a: 'Absolutely. All your queries and generated literature reviews are private. We use industry-standard encryption and guarantee that your personal research data is never used to train our public models.' },
            { q: 'In what formats can I export my synthesis?', a: 'You can export your structured literature reviews, citations, and summaries in Word, PDF, and standard BibTeX formats, which seamlessly integrate into LaTeX workflows and reference managers.' },
          ].map((item, i) => (
            <div key={i} className="bg-paper-white dark:bg-ink-black rounded-xl shadow-sm border border-cloud-canvas dark:border-stone-gray overflow-hidden transition-colors">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-cloud-canvas/50 dark:hover:bg-stone-gray/50 transition-colors font-sans group"
              >
                <div className="w-6 h-6 rounded-full bg-fuenzer-teal/10 border border-fuenzer-teal/30 text-fuenzer-teal flex items-center justify-center shrink-0">
                  <span className="italic font-bold text-xs font-serif">i</span>
                </div>
                <span className="font-bold text-sm flex-1 dark:text-paper-white">{item.q}</span>
                <div className={`shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                  openFaq === i 
                    ? 'text-fuenzer-teal rotate-180' 
                    : 'text-stone-gray dark:text-silver-mist group-hover:text-fuenzer-teal'
                }`}>
                  <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                </div>
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
