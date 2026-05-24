import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResearchStore } from '../store/researchStore';
import {
  Search,
  BookOpen,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import type { SearchScope } from '../types/research';

const features = [
  {
    icon: <Sparkles className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Sintesis AI',
    description: 'Gemini 2.5 Flash menganalisis abstrak jurnal dan menghasilkan sintesis akademis yang ringkas.',
  },
  {
    icon: <Globe className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Global & SINTA',
    description: 'Cari dari database Semantic Scholar global atau filter khusus jurnal Indonesia terindeks SINTA.',
  },
  {
    icon: <Zap className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Kecepatan Riset',
    description: 'Dari query ke sintesis dalam hitungan detik. Tidak perlu baca satu-per-satu.',
  },
  {
    icon: <Shield className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Tanpa Halusinasi',
    description: 'AI hanya menyintesis dari abstrak yang ditemukan. Tidak ada fabrikasi data.',
  },
];

const faqItems = [
  {
    q: 'Apa itu Fuenzer Research?',
    a: 'Fuenzer Research adalah tool riset akademis berbasis AI yang membantu Anda menemukan dan menyintesis literatur ilmiah dengan cepat menggunakan database Semantic Scholar dan Google Gemini.',
  },
  {
    q: 'Apakah referensinya terpercaya?',
    a: 'Semua referensi diambil langsung dari Semantic Scholar, database yang mengindeks lebih dari 200 juta paper akademis. AI hanya menyintesis dari abstrak yang ditemukan, tanpa menggunakan pengetahuan eksternal.',
  },
  {
    q: 'Bagaimana cara kerja filter SINTA?',
    a: 'Ketika Anda memilih mode Indonesia/SINTA, sistem akan mencocokkan nama publisher jurnal dengan database SINTA lokal kami untuk menampilkan tier akreditasi (SINTA 1-6 atau Garuda/Lokal).',
  },
  {
    q: 'Apakah gratis?',
    a: 'Ya, Fuenzer Research sepenuhnya gratis untuk digunakan selama masa demo.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { query, scope, setQuery, setScope, executeSearch } = useResearchStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    await executeSearch();
    navigate('/search');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-alabaster">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-600" strokeWidth={1.5} />
            <span className="font-serif text-xl font-bold text-[#0F172A]">
              Fuenzer Research
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#64748B] hover:text-cyan-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-32 right-1/4 w-56 h-56 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium mb-6 border border-cyan-100">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini 2.5 Flash
          </p>

          <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#0F172A] leading-tight mb-6">
            Riset Akademis,{' '}
            <span className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Disintesis AI
            </span>
          </h1>

          <p className="text-lg text-[#334155] max-w-2xl mx-auto mb-10 leading-relaxed">
            Temukan referensi jurnal ilmiah dari seluruh dunia dan dapatkan sintesis
            instan dari AI. Mendukung indeksasi SINTA untuk jurnal Indonesia.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            {/* Scope tabs */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex rounded-lg bg-white border border-slate-200 p-1">
                {(['global', 'indonesia'] as SearchScope[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScope(s)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      scope === s
                        ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {s === 'global' ? '🌍 Global' : '🇮🇩 Indonesia / SINTA'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-cyan-400 to-blue-600 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm group-focus-within:border-transparent group-focus-within:ring-2 group-focus-within:ring-cyan-400/50 transition-all">
                <Search className="w-5 h-5 text-[#64748B] ml-5" strokeWidth={1.5} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cari topik riset... (contoh: pengaruh AI dalam pendidikan)"
                  className="flex-1 h-14 px-4 bg-transparent text-[#0F172A] placeholder:text-[#94A3B8] outline-none text-base"
                  maxLength={200}
                />
                <button
                  onClick={handleSearch}
                  disabled={query.trim().length < 3}
                  className="flex items-center gap-2 mr-2 px-5 py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cari
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '200M+', label: 'Paper Terindeks' },
            { value: '110+', label: 'Jurnal SINTA' },
            { value: '<5s', label: 'Waktu Sintesis' },
            { value: '100%', label: 'Gratis' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-[#64748B] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-bold text-[#0F172A] text-center mb-12">
          Mengapa Fuenzer Research?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-card transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-cyan-50 to-blue-50 flex items-center justify-center text-cyan-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-[#0F172A] text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-[#334155] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl font-bold text-[#0F172A] text-center mb-12">
            Cara Kerja
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Masukkan Query',
                desc: 'Ketik topik riset Anda dan pilih scope pencarian (Global atau Indonesia/SINTA).',
              },
              {
                step: '02',
                title: 'AI Menganalisis',
                desc: 'Sistem mencari di Semantic Scholar, memetakan indeks SINTA, dan mengirim abstrak ke Gemini.',
              },
              {
                step: '03',
                title: 'Hasil Instan',
                desc: 'Dapatkan sintesis AI plus daftar referensi dengan tier SINTA dalam hitungan detik.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-sm text-[#334155] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-bold text-[#0F172A] text-center mb-12">
          Pertanyaan Umum
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-[#0F172A]">{item.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-[#64748B]" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#64748B]" strokeWidth={1.5} />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-[#334155] leading-relaxed animate-in slide-in-from-top-2 duration-200">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#64748B]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-600" strokeWidth={1.5} />
            <span>Fuenzer Research © 2026</span>
          </div>
          <p>
            Built for{' '}
            <span className="font-medium text-[#0F172A]">JuaraVibeCoding</span> by
            Google
          </p>
        </div>
      </footer>
    </div>
  );
}
