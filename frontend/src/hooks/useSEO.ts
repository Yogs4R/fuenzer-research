import { useEffect } from 'react';

interface UseSEOProps {
  canonical?: string;
  schema?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

/**
 * useSEO — injects per-page JSON-LD structured data into <head>,
 * updates <link rel="canonical">, and manages indexing directives for robots.
 *
 * @param {UseSEOProps} options
 */
export function useSEO({ canonical, schema, noindex }: UseSEOProps) {
  useEffect(() => {
    // ── Canonical ────────────────────────────────────────────────
    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl && canonical) {
      canonicalEl.setAttribute('href', canonical);
    }

    // ── Robots (noindex, nofollow) ──────────────────────────────
    const robotsEl = document.querySelector('meta[name="robots"]');
    const originalRobots = robotsEl ? robotsEl.getAttribute('content') : 'index, follow';

    if (robotsEl) {
      if (noindex) {
        robotsEl.setAttribute('content', 'noindex, nofollow');
      } else {
        robotsEl.setAttribute('content', 'index, follow');
      }
    }

    // ── JSON-LD ──────────────────────────────────────────────────
    if (!schema) {
      return () => {
        if (canonicalEl) {
          canonicalEl.setAttribute('href', 'https://research.fuenzer.web.id/');
        }
        if (robotsEl) {
          robotsEl.setAttribute('content', originalRobots || 'index, follow');
        }
      };
    }

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
      // Restore canonical and robots to defaults
      if (canonicalEl) {
        canonicalEl.setAttribute('href', 'https://research.fuenzer.web.id/');
      }
      if (robotsEl) {
        robotsEl.setAttribute('content', originalRobots || 'index, follow');
      }
    };
  }, [canonical, schema, noindex]);
}
