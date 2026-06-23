import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface InfoPageLayoutProps {
  children: React.ReactNode;
  title: string;
  backLabel?: string;
}

export function InfoPageLayout({ children, title, backLabel = 'Back' }: InfoPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors overflow-hidden font-serif selection:bg-fuenzer-teal/30 selection:text-ink-black dark:selection:text-paper-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 font-sans text-stone-gray dark:text-silver-mist">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium hover:text-ink-black dark:hover:text-paper-white mb-6 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <h1 className="text-4xl font-bold font-serif dark:text-paper-white mb-8">{title}</h1>
        <div className="space-y-6 leading-relaxed">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
