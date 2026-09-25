// Client-side PDF: snapshot each letter-size page element and place it on a
// PDF page. Libraries are loaded on demand so they stay out of the main bundle.

export const PAGE_W = 816 // 8.5in @ 96dpi
export const PAGE_H = 1056 // 11in

export async function downloadPdf(pages, filename, onProgress) {
  const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')])
  await document.fonts?.ready
  const pdf = new jsPDF({ unit: 'in', format: 'letter', compress: true })
  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i, pages.length)
    const png = await toPng(pages[i], {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: PAGE_W,
      height: PAGE_H,
      cacheBust: false,
    })
    if (i) pdf.addPage('letter')
    pdf.addImage(png, 'PNG', 0, 0, 8.5, 11, undefined, 'FAST')
  }
  pdf.save(filename)
}
