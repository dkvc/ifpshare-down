import type { ProcessedImage } from './image'
import type { jsPDF } from 'jspdf'

export const createAndSavePDF = async (images: ProcessedImage[], pdfName: string = 'output.pdf') => {
  const { jsPDF: JsPDFConstructor } = await import('jspdf')

  let doc: jsPDF | null = null
  for (let i = 0; i < images.length; i++) {
    const { width, height, data } = images[i]
    const orientation = width > height ? 'l' : 'p'

    if (i === 0) {
      doc = new JsPDFConstructor({
        orientation,
        unit: 'px',
        format: [width, height],
      })
    } else {
      doc!.addPage([width, height], orientation)
    }

    doc!.addImage(data, 'PNG', 0, 0, width, height)
  }

  doc!.save(pdfName)
}
