import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { en } from '../locales/en';
import { id } from '../locales/id';

export function TermsPage() {
  const navigate = useNavigate();
  const { language } = useUiStore();
  const t = language === 'en' ? en.terms : id.terms;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors overflow-hidden font-serif selection:bg-fuenzer-teal/30 selection:text-ink-black dark:selection:text-paper-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 font-sans text-stone-gray dark:text-silver-mist">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium hover:text-ink-black dark:hover:text-paper-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.back}
        </button>
        <h1 className="text-4xl font-bold font-serif dark:text-paper-white mb-8">{t.title}</h1>
        <div className="space-y-6 leading-relaxed">
          <p>{t.lastUpdated}</p>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec1Title}</h2>
            <p>{t.sec1Desc}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec2Title}</h2>
            <p>{t.sec2Desc}</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>{t.sec2List1}</li>
              <li>{t.sec2List2}</li>
              <li>{t.sec2List3}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec3Title}</h2>
            <p>{t.sec3Desc}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec4Title}</h2>
            <p>{t.sec4Desc}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec5Title}</h2>
            <p>{t.sec5Desc}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">{t.sec6Title}</h2>
            <p>{t.sec6Desc}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
