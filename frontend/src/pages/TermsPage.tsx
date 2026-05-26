import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors overflow-hidden font-serif selection:bg-fuenzer-teal/30 selection:text-ink-black dark:selection:text-paper-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 font-sans text-stone-gray dark:text-silver-mist">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium hover:text-ink-black dark:hover:text-paper-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-4xl font-bold font-serif dark:text-paper-white mb-8">Terms of Service</h1>
        <div className="space-y-6 leading-relaxed">
          <p>Last updated: May 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">1. Acceptance of Terms</h2>
            <p>By accessing and using Fuenzer Research, you accept and agree to be bound by the terms and provision of this agreement. Our platform provides AI-driven scientific literature synthesis designed to assist academic research. If you do not agree to abide by these terms, please do not use this service.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">2. Academic Integrity and Use</h2>
            <p>Fuenzer Research is designed to assist researchers, not to replace original thought. Users agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the synthesized literature strictly as a supplementary research tool.</li>
              <li>Properly cite the original authors and sources provided in the synthesis.</li>
              <li>Not submit AI-generated text verbatim as their own original work in academic assignments or peer-reviewed journals without disclosure, adhering to the policies of the respective academic institution or publisher.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">3. API Usage and Limitations</h2>
            <p>We query open-access and national databases (such as SINTA and OpenAlex) in real-time. Fuenzer Research does not guarantee uninterrupted access, nor the absolute completeness of the databases, as we rely on third-party API availability.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">4. Disclaimer</h2>
            <p>The materials on Fuenzer Research's website are provided on an 'as is' basis. While we strive to ensure our AI produces highly accurate and non-hallucinated syntheses, you are solely responsible for fact-checking and verifying the claims against the primary literature.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
