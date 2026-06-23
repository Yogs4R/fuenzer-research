import { useUiStore } from '../store/uiStore';
import { useSEO } from '../hooks/useSEO';
import { en } from '../locales/en';
import { id } from '../locales/id';
import { InfoPageLayout } from '../components/shared/InfoPageLayout';

export function TermsPage() {
  const { language } = useUiStore();
  const t = language === 'en' ? en.terms : id.terms;

  useSEO({
    canonical: 'https://research.fuenzer.web.id/terms/',
    schema: {
      "@context": "https://schema.org",
      "@type": "TermsOfService",
      "name": "Terms of Service - Fuenzer Research",
      "url": "https://research.fuenzer.web.id/terms/",
      "description": "Read the terms of service governing the usage of Fuenzer Research, search functionalities, and AI synthesis features.",
      "about": {
        "@type": "Organization",
        "name": "Fuenzer Research",
        "url": "https://research.fuenzer.web.id/"
      }
    }
  });

  return (
    <InfoPageLayout title={t.title} backLabel={t.back}>
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
    </InfoPageLayout>
  );
}

