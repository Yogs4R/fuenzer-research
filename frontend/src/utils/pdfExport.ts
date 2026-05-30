import { jsPDF } from 'jspdf';
import type { AcademicSource } from '../types/research';

type CitationStyle = 'APA' | 'Harvard' | 'MLA' | 'Chicago' | 'Vancouver';

// Helper to format citations programmatically
export function getFormattedCitation(source: AcademicSource, style: CitationStyle) {
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

// Generate premium A4 PDF Document
export function generatePdfDocument(source: AcademicSource, citationStyle: CitationStyle): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [13, 148, 136]; // Teal #0d9488
  const textColor = [18, 18, 18]; // Ink Black #121212
  const grayColor = [100, 116, 139]; // Slate Gray #64748b
  const lightGrayColor = [241, 245, 249]; // Light Gray #f1f5f9
  
  const margin = 20;
  const contentWidth = 170;
  let y = 25;

  // Header Brand
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, 6, 6, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FUENZER', margin + 9, y + 4.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('RESEARCH', margin + 37, y + 4.5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('ACADEMIC REFERENCE DOCUMENT', 210 - margin, y + 4, { align: 'right' });

  // Header Divider
  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 210 - margin, y);

  y += 12;

  // Content Type Badge
  const contentType = (source.content_type || 'article').toUpperCase();
  doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, 25, 6, 'FD');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(contentType, margin + 12.5, y + 4.2, { align: 'center' });

  // Year Badge
  if (source.year > 0) {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin + 28, y, 14, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(source.year.toString(), margin + 35, y + 4.2, { align: 'center' });
  }

  y += 12;

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  const titleLines = doc.splitTextToSize(source.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 7) + 5;

  // Authors & Source metadata
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const authorsText = `Authors: ${(source.authors || []).join(', ') || 'N/A'}`;
  const authorsLines = doc.splitTextToSize(authorsText, contentWidth);
  doc.text(authorsLines, margin, y);
  y += (authorsLines.length * 5) + 3;

  const publisherText = `Source / Publisher: ${source.publisher || 'N/A'}`;
  const publisherLines = doc.splitTextToSize(publisherText, contentWidth);
  doc.text(publisherLines, margin, y);
  y += (publisherLines.length * 5) + 8;

  // Citation Box
  doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
  doc.setDrawColor(226, 232, 240);
  
  const citationText = getFormattedCitation(source, citationStyle);
  const citationLines = doc.splitTextToSize(`${citationStyle} Citation: ${citationText}`, contentWidth - 10);
  const boxHeight = (citationLines.length * 5) + 10;
  
  doc.rect(margin, y, contentWidth, boxHeight, 'FD');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(citationLines, margin + 5, y + 7);
  
  y += boxHeight + 10;

  // Abstract section
  if (source.abstract && source.abstract.trim()) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('ABSTRACT', margin, y);
    y += 7;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const abstractLines = doc.splitTextToSize(source.abstract, contentWidth);
    
    for (let i = 0; i < abstractLines.length; i++) {
      if (y > 270) {
        doc.addPage();
        y = 25;
      }
      doc.text(abstractLines[i], margin, y);
      y += 5.5;
    }
  }

  // Footer & Page Numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 282, 210 - margin, 282);
    doc.text(`Page ${i} of ${totalPages}`, 210 - margin, 287, { align: 'right' });
    doc.text('Synthesized via Fuenzer Research', margin, 287);
  }

  return doc;
}
