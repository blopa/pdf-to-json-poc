import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const PDFParser = () => {
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          // Load the PDF from the file's ArrayBuffer
          const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
          const pdfDocument = await loadingTask.promise;

          // Initialize the object to accumulate all page data
          const pdfInfo = {
            numPages: pdfDocument.numPages,
            pages: [],
          };

          // Loop through all pages and extract content
          for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();

            pdfInfo.pages.push(textContent);
          }

          // Once all pages are processed, create a single JSON file
          const blob = new Blob([JSON.stringify(pdfInfo, null, 2)], { type: 'application/json' });
          saveAs(blob, 'parsed_pdf.json');
        } catch (err) {
          setError('Error parsing PDF.');
          console.error(err);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
      <div>
        <h1>PDF Parser</h1>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
        {error && <p>{error}</p>}
      </div>
  );
};

export default PDFParser;
