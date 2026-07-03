/**
 * Parses a Markdown table string into a 2D array of cells.
 * Strips outer piping and ignores separator lines (e.g. |---|---|).
 */
export function parseMarkdownTable(markdown: string): string[][] {
  const lines = markdown.trim().split('\n');
  const rows: string[][] = [];

  for (const line of lines) {
    if (!line.includes('|')) continue;
    
    // Ignore markdown table separator lines like |---|---|
    if (line.match(/^\s*\|?\s*:?-+:?\s*\|/)) continue;

    // Split cells by '|', trim spaces, and exclude outer empty cells resulting from leading/trailing '|'
    const cells = line.split('|')
      .map(c => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  return rows;
}

/**
 * Sanitizes a cell value to prevent CSV Formula Injection.
 * Prefixes cells starting with dangerous characters (=, +, -, @, tab, CR) with a single quote.
 */
function sanitizeCsvCell(cell: string): string {
  return cell.replace(/^([=+\-@\t\r])/, "'$1");
}

/**
 * Converts headers and rows to a CSV string and triggers a browser download.
 */
export function exportToCSV(headers: string[], dataRows: string[][], filename: string = 'literature_matrix.csv'): void {
  const csvContent = [headers, ...dataRows]
    .map(row => row.map(cell => `"${sanitizeCsvCell(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Add BOM (Byte Order Mark) for proper UTF-8 parsing in MS Excel
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
