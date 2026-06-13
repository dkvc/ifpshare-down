/// <reference lib="webworker" />

self.onmessage = async (e: MessageEvent<{ blob: Blob; index: number }>) => {
  const { blob, index } = e.data
  try {
    const bitmap = await createImageBitmap(blob)
    const width = bitmap.width
    const height = bitmap.height
    const arrayBuffer = await blob.arrayBuffer()
    bitmap.close()
    self.postMessage({ index, width, height, data: arrayBuffer }, { transfer: [arrayBuffer] })
  } catch (error) {
    self.postMessage({ index, error: (error as Error).message })
  }
}
