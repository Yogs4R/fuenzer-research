import { useEffect } from 'react';

interface UseSEOProps {
  canonical?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

/**
 * useSEO — injects per-page JSON-LD structured data into <head>
 * and updates <link rel="canonical"> for GEO & SEO.
 *
 * @param {UseSEOProps} options
 */
export function useSEO({ canonical, schema }: UseSEOProps) {
  useEffect(() => {
    // ── Canonical ────────────────────────────────────────────────
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl && canonical) {
      canonicalEl.setAttribute('href', canonical);
    }

    // ── JSON-LD ──────────────────────────────────────────────────
    if (!schema) return;

    const schemas = Array.isArray(schema) ? schema : [schema];
    const injected: HTMLScriptElement[] = [];

    schemas.forEach((s) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-page-schema', 'true');
      el.textContent = JSON.stringify(s);
      document.head.appendChild(el);
      injected.push(el);
    });

    // Cleanup when route changes or component unmounts
    return () => {
      injected.forEach((el) => el.remove());
      // Restore canonical to root when leaving a sub-page
      if (canonicalEl) {
        canonicalEl.setAttribute('href', 'https://research.fuenzer.web.id/');
      }
    };
  }, [canonical, schema]);
}
