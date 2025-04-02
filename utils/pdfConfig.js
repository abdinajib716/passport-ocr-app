import { pdfjs } from 'react-pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export const pdfConfig = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};
