/**
 * keywordExtractor.ts
 * 
 * Extracts clean academic keywords from user input by removing
 * noise words (filler, commands, articles) in Bahasa Indonesia and English.
 * 
 * Example:
 *   Input:  "Carikan artikel berjudul machine learning"
 *   Output: "machine learning"
 * 
 *   Input:  "Tolong bantu cari jurnal tentang renewable energy"
 *   Output: "renewable energy"
 */

// ─── Noise Words: Bahasa Indonesia ────────────────────────────────────────────
const NOISE_WORDS_ID: string[] = [
  // Command / request words
  'carikan', 'cari', 'carilah', 'carinya', 'mencari',
  'tolong', 'bantu', 'bantuin', 'mohon', 'minta', 'mintakan',
  'tampilkan', 'tunjukkan', 'lihatkan', 'kasih', 'berikan',
  'buatkan', 'temukan', 'dapatkan',

  // Article / document type (extracted separately via dropdown)
  'artikel', 'jurnal', 'buku', 'paper', 'makalah', 'skripsi',
  'tesis', 'disertasi', 'publikasi', 'riset', 'penelitian',
  'literatur', 'referensi', 'sumber', 'dokumen',

  // Prepositions & conjunctions
  'tentang', 'mengenai', 'perihal', 'terkait', 'berkaitan',
  'seputar', 'soal', 'berjudul', 'bertema', 'bertopik',
  'dengan', 'dari', 'untuk', 'ke', 'di', 'pada', 'oleh',
  'yang', 'dan', 'atau', 'serta', 'maupun', 'ataupun',
  'ini', 'itu', 'tersebut',

  // Verbs / fillers
  'adalah', 'merupakan', 'yaitu', 'ialah',
  'bisa', 'dapat', 'mampu', 'mau', 'ingin', 'hendak',
  'sedang', 'akan', 'sudah', 'telah', 'belum', 'pernah',
  'saya', 'aku', 'kami', 'kita',

  // Adjectives / quantifiers
  'semua', 'seluruh', 'beberapa', 'banyak', 'sedikit',
  'terbaru', 'terkini', 'terbaru', 'terlama', 'terbaik',
  'paling', 'sangat', 'lebih', 'kurang',
];

// ─── Noise Words: English ─────────────────────────────────────────────────────
const NOISE_WORDS_EN: string[] = [
  // Command / request words
  'find', 'search', 'look', 'lookup', 'get', 'fetch',
  'show', 'display', 'list', 'give', 'provide',
  'please', 'help', 'can', 'could', 'would',

  // Article / document type
  'article', 'articles', 'journal', 'journals', 'book', 'books',
  'paper', 'papers', 'thesis', 'dissertation', 'publication',
  'publications', 'research', 'study', 'studies', 'literature',
  'reference', 'references', 'source', 'sources', 'document',

  // Prepositions & conjunctions
  'about', 'regarding', 'concerning', 'related', 'on', 'in',
  'for', 'of', 'to', 'from', 'with', 'by', 'at',
  'the', 'a', 'an', 'this', 'that', 'these', 'those',
  'and', 'or', 'but', 'nor',
  'titled', 'called', 'named', 'entitled',

  // Verbs / fillers
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'shall', 'may', 'might', 'must',
  'i', 'me', 'my', 'we', 'our', 'you', 'your',

  // Adjectives / quantifiers
  'all', 'some', 'any', 'many', 'few', 'most',
  'latest', 'newest', 'recent', 'best', 'top',
  'very', 'more', 'less',
];

// Combine all noise words into a Set for O(1) lookup
const NOISE_WORDS = new Set([
  ...NOISE_WORDS_ID.map((w) => w.toLowerCase()),
  ...NOISE_WORDS_EN.map((w) => w.toLowerCase()),
]);

/**
 * Extracts clean keywords from user input by removing noise words.
 * Preserves multi-word academic terms and phrases.
 * 
 * @param input - Raw user input string
 * @returns Cleaned keyword string ready for API search
 * 
 * @example
 * extractKeywords("Carikan artikel berjudul machine learning")
 * // → "machine learning"
 * 
 * extractKeywords("find me research papers about deep learning in healthcare")
 * // → "deep learning healthcare"
 * 
 * extractKeywords("machine learning")
 * // → "machine learning" (unchanged — no noise words)
 */
export function extractKeywords(input: string): string {
  if (!input || !input.trim()) return '';

  // Normalize: trim, collapse whitespace, lowercase for comparison
  const normalized = input.trim().replace(/\s+/g, ' ');
  const words = normalized.split(' ');

  // Filter out noise words (case-insensitive comparison)
  const keywords = words.filter((word) => {
    const lower = word.toLowerCase();
    // Keep the word if it's NOT a noise word
    return !NOISE_WORDS.has(lower);
  });

  // Join remaining words back
  return keywords.join(' ').trim();
}

/**
 * Checks if the input contains ONLY noise words (no meaningful keywords).
 * Useful for showing validation errors.
 * 
 * @param input - Raw user input string
 * @returns true if no meaningful keywords were found
 */
export function hasNoKeywords(input: string): boolean {
  return extractKeywords(input).length === 0;
}

/**
 * Checks if the extracted keywords differ from the original input.
 * If they differ, it means noise words were stripped.
 * 
 * @param input - Raw user input string
 * @returns true if extraction changed the input (noise was removed)
 */
export function wasExtracted(input: string): boolean {
  if (!input || !input.trim()) return false;
  const cleaned = extractKeywords(input);
  return cleaned.toLowerCase() !== input.trim().toLowerCase().replace(/\s+/g, ' ');
}
