/**
 * @description
 * Creates a PDF document with given imageBlobs such that
 * each image is on a separate page with dimensions equal
 * to the image dimensions.
 * @param {Blob[]} imageBlobs - Array of image blobs to be added to the PDF.
 * @param {string} [pdfName] - Name for the generated PDF file. Defaults to `output.pdf`.
 */

import { blobToBase64, getImageSize } from './image'
import { jsPDF } from 'jspdf'

export const createAndSavePDF = async (imageBlobs: Blob[], pdfName: string = 'output.pdf') => {
  let doc: jsPDF | null = null
  for (let i = 0; i < imageBlobs.length; i++) {
    const blob = imageBlobs[i]
    const base64 = await blobToBase64(blob)
    const { width, height } = await getImageSize(base64)
    const orientation = width > height ? 'l' : 'p'

    // first page
    if (i === 0) {
      // initialize doc here since jsPDF automatically creates
      // first page with fixed dims
      doc = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [width, height],
      })
    } else {
      // add new page for subsequent images
      if (doc) {
        doc.addPage([width, height], orientation)
      }
    }

    doc?.addImage(base64, 'PNG', 0, 0, width, height)
  }

  doc?.save(pdfName)
}
