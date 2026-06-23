import type { AcademicSource } from '../types/research';

export type CitationStyle = 'APA' | 'Harvard' | 'MLA' | 'Chicago' | 'Vancouver';

export const CITATION_STYLES: CitationStyle[] = ['APA', 'Harvard', 'MLA', 'Chicago', 'Vancouver'];

/**
 * Format academic metadata into a formatted citation string according to style.
 */
export function getFormattedCitation(source: AcademicSource, style: CitationStyle | string): string {
  const authorsArr = source.authors || [];
  const authors = authorsArr.length > 0 ? authorsArr.join(', ') : 'Penulis tidak tersedia';
  const year = source.year > 0 ? source.year : 'n.d.';
  const title = source.title;
  const pub = source.publisher || 'Unknown Publisher';

  switch (style) {
    case 'APA':
      return `${authors} (${year}). ${title}. ${pub}.`;
    case 'Harvard':
      return `${authors}, ${year}. ${title}. ${pub}.`;
    case 'MLA':
      return `${authors}. "${title}." ${pub}, ${year}.`;
    case 'Chicago':
      return `${authors}. "${title}." ${pub} (${year}).`;
    case 'Vancouver':
      return `${authors}. ${title}. ${pub}. ${year};`;
    default:
      return `${authors} (${year}). ${title}. ${pub}.`;
  }
}
