import type { AcademicSource } from '../types/research';

/**
 * Extracts a DOI from a URL string if it points to doi.org.
 */
function extractDoi(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Generates a BibTeX string from an array of academic sources.
 */
export function generateBibTeX(sources: AcademicSource[]): string {
  return sources
    .map((s, idx) => {
      const citeKey = `source_${idx + 1}`;
      const authors = (s.authors || []).join(' and ') || 'Unknown Author';
      const doiVal = extractDoi(s.url);
      const doiField = doiVal ? `,\n  doi = {${doiVal}}` : '';
      return `@article{${citeKey},\n  author = {${authors}},\n  title = {${s.title}},\n  journal = {${s.publisher || 'Unknown Journal'}},\n  year = {${s.year > 0 ? s.year : 'n.d.'}}${doiField}\n}`;
    })
    .join('\n\n');
}

/**
 * Generates an RIS string from an array of academic sources.
 */
export function generateRIS(sources: AcademicSource[]): string {
  return sources
    .map((s) => {
      const type = getRisType(s.content_type);
      const parts = [
        `TY  - ${type}`,
        `TI  - ${s.title}`,
      ];

      if (s.authors && s.authors.length > 0) {
        s.authors.forEach((auth) => {
          parts.push(`AU  - ${auth}`);
        });
      } else {
        parts.push(`AU  - Unknown Author`);
      }

      if (s.year > 0) {
        parts.push(`PY  - ${s.year}`);
      }

      if (s.publisher) {
        parts.push(`PB  - ${s.publisher}`);
      }

      if (s.abstract) {
        // Strip newlines or multiple spaces in abstract to keep RIS format clean
        const cleanAbstract = s.abstract ? s.abstract.replace(/\s+/g, ' ').trim() : '';
        if (cleanAbstract) {
          parts.push(`N2  - ${cleanAbstract}`);
        }
      }

      const doiVal = extractDoi(s.url);
      if (doiVal) {
        parts.push(`DO  - ${doiVal}`);
      }

      if (s.url) {
        parts.push(`UR  - ${s.url}`);
      }

      parts.push('ER  -');
      return parts.join('\n');
    })
    .join('\n\n');
}

function getRisType(contentType?: string): string {
  const ct = contentType?.toLowerCase() || '';
  if (ct.includes('book')) return 'BOOK';
  if (ct.includes('journal') || ct.includes('article')) return 'JOUR';
  return 'GEN'; // default generic
}
