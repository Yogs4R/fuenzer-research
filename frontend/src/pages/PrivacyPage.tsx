import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] transition-colors overflow-hidden font-serif selection:bg-fuenzer-teal/30 selection:text-ink-black dark:selection:text-paper-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-32 font-sans text-stone-gray dark:text-silver-mist">
        <h1 className="text-4xl font-bold font-serif dark:text-paper-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 leading-relaxed">
          <p>Last updated: May 2026</p>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">1. Information We Collect</h2>
            <p>Fuenzer Research is designed with privacy in mind. We collect basic account information necessary for service delivery, such as your email address when you sign up. More importantly, your academic queries, uploaded documents, and generated literature reviews remain strictly private.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">2. AI Training and Data Usage</h2>
            <p>We respect the confidentiality of your research. Therefore, we explicitly guarantee that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Your personal research queries and synthesized outputs are <strong>never</strong> used to train our public generative AI models.</li>
              <li>Data is processed statelessly where possible, meaning your queries are processed to generate results and are not persistently stored for training purposes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-ink-black dark:text-paper-white mb-4 mt-8">3. Data Security</h2>
            <p>We implement industry-standard security measures, including encryption in transit and at rest, to maintain the safety of your personal information and research data against unauthorized access or disclosure.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
