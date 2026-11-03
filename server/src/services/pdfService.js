import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Attempts to extract plain text from a PDF buffer.
 * If the PDF is scanned or image-based, returns empty string so OCR multimodal pipeline can handle it.
 */
export const extractTextFromPdf = async (pdfBuffer) => {
  try {
    const data = await pdf(pdfBuffer);
    const text = data.text ? data.text.trim() : '';
    return text;
  } catch (err) {
    console.warn('pdf-parse could not extract text directly (may be scanned image):', err.message);
    return '';
  }
};
